import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import DecorativeBackground from "@/components/DecorativeBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Loader2, ImageIcon, Download, Sparkles, Upload, ArrowLeft, HelpCircle, Eye, Car, ArrowUp, ArrowDown, ArrowLeftRight, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface UserTemplate {
  id: string;
  name: string;
  template_url: string;
}

const Bildgenerator = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdmin, isBeginner, isLoading: roleLoading } = useUserRole();
  const { user, isLoading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mallId = searchParams.get("mall");

  const [selectedTemplate, setSelectedTemplate] = useState<UserTemplate | null>(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(true);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [padding, setPadding] = useState(0.25);
  const [paddingBottom, setPaddingBottom] = useState(0.25);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  // Spara padding-värden när bilden genereras för att kunna visa live-preview
  const [generatedPadding, setGeneratedPadding] = useState(0.25);
  const [generatedPaddingBottom, setGeneratedPaddingBottom] = useState(0.25);

  // Beräkna om det finns osparade ändringar
  const hasUnsavedChanges = generatedImage && (
    Math.abs(padding - generatedPadding) > 0.001 || 
    Math.abs(paddingBottom - generatedPaddingBottom) > 0.001
  );

  // Beräkna preview-transform baserat på padding-skillnad
  const previewScale = 1 + (generatedPadding - padding) * 3;
  const previewTranslateY = (paddingBottom - generatedPaddingBottom) * -150;

  // Fetch template from database
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!mallId || !user) {
        setIsLoadingTemplate(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_templates")
          .select("*")
          .eq("id", mallId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        setSelectedTemplate(data);
      } catch (error) {
        console.error("Error fetching template:", error);
      } finally {
        setIsLoadingTemplate(false);
      }
    };

    if (user && !authLoading) {
      fetchTemplate();
    }
  }, [mallId, user, authLoading]);

  // Redirect to template selector if no template is selected
  useEffect(() => {
    if (!authLoading && !roleLoading && !isLoadingTemplate && user && isBeginner && !mallId) {
      navigate("/bildgenerator-mallar");
    }
  }, [authLoading, roleLoading, isLoadingTemplate, user, isBeginner, mallId, navigate]);

  // Redirect users without gen_2+ access
  if (!authLoading && !roleLoading) {
    if (!user) {
      navigate("/auth");
      return null;
    }
    if (!isBeginner) {
      navigate("/start");
      return null;
    }
  }

  if (authLoading || roleLoading || isLoadingTemplate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleGenerate = async () => {
    if (!uploadedImage) {
      toast.error("Ladda upp en bild först");
      return;
    }

    if (!mallId || !selectedTemplate) {
      toast.error("Ingen mall vald");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      // Hämta mall-bilden och konvertera till blob
      const templateResponse = await fetch(selectedTemplate.template_url);
      const templateBlob = await templateResponse.blob();

      const formData = new FormData();
      formData.append("template_id", mallId);
      formData.append("template_image", templateBlob, "template.png");
      formData.append("data", uploadedImage);
      formData.append("padding", padding.toString());
      formData.append("padding_bottom", paddingBottom.toString());

      // Logga vad som skickas
      console.log("Skickar till webhook:", {
        template_id: mallId,
        template_image: `${templateBlob.size} bytes (${templateBlob.type})`,
        data: `${uploadedImage.name} - ${uploadedImage.size} bytes`,
        padding: padding,
        padding_bottom: paddingBottom
      });

      const response = await fetch("https://datavox.app.n8n.cloud/webhook/bildgenerator", {
        method: "POST",
        body: formData
      });

      // Logga response headers
      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));
      console.log("Content-Type:", response.headers.get("content-type"));

      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.status}`);
      }

      // Läs responsen som blob (binär bilddata)
      const blob = await response.blob();
      console.log("Blob type:", blob.type);
      console.log("Blob size:", blob.size, "bytes");
      
      // Skapa en URL för att visa bilden
      const imageUrl = URL.createObjectURL(blob);
      setGeneratedImage(imageUrl);
      
      // Spara padding-värden som användes vid generering
      setGeneratedPadding(padding);
      setGeneratedPaddingBottom(paddingBottom);
      
      toast.success("Bilden har genererats!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Ett fel uppstod. Försök igen.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (generatedImage) {
      try {
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `generated-image-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        // Fallback
        const link = document.createElement("a");
        link.href = generatedImage;
        link.download = `generated-image-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const handleResetPadding = () => {
    setPadding(generatedPadding);
    setPaddingBottom(generatedPaddingBottom);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-muted/30 to-background animate-fade-in">
      <DecorativeBackground />
      <AppHeader showBackButton />

      <main className="relative flex flex-col items-center px-6 pt-24 pb-16">
        <div className="w-full max-w-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Pro-verktyg</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">
              Bildgenerator
            </h1>
            {selectedTemplate && (
              <div className="flex items-center justify-center gap-3 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/bildgenerator-mallar")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Byt mall
                </Button>
                <span className="text-muted-foreground">|</span>
                <span className="text-sm text-muted-foreground">
                  Vald mall: <strong className="text-foreground">{selectedTemplate.name}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Upload & Settings Card */}
          <Card className="mb-6 border-purple-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between w-full">
                <span className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-purple-600" />
                  Ladda upp bild
                </span>
                <Link 
                  to="/hur-fungerar-bildgenerator" 
                  className="text-sm text-purple-600 hover:text-purple-800 hover:underline flex items-center gap-1 font-normal"
                >
                  <HelpCircle className="h-4 w-4" />
                  Hur fungerar bildgenerator?
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Upload Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 transition-all"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Uppladdad bild"
                      className="max-h-48 mx-auto rounded-lg shadow-md"
                    />
                    <p className="text-sm text-muted-foreground">
                      Klicka för att byta bild
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="h-12 w-12 mx-auto text-purple-400" />
                    <p className="text-muted-foreground">
                      Klicka eller dra en bild hit
                    </p>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !uploadedImage}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Genererar...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generera bild
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result Card */}
          {generatedImage && (
            <Card className="border-purple-200 shadow-lg animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Genererad bild</span>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Ladda ner
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Live Preview Image */}
                <div className="relative overflow-hidden rounded-lg bg-muted/30">
                  <img
                    src={generatedImage}
                    alt="Generated"
                    className="w-full rounded-lg shadow-md transition-transform duration-300 ease-out"
                    style={{
                      transform: hasUnsavedChanges 
                        ? `scale(${previewScale}) translateY(${previewTranslateY}px)`
                        : 'none',
                      transformOrigin: 'center bottom'
                    }}
                  />
                  
                  {/* Preview badge */}
                  {hasUnsavedChanges && (
                    <div className="absolute top-3 right-3 bg-amber-500/95 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                      <Eye className="h-3.5 w-3.5" />
                      Förhandsvisning
                    </div>
                  )}
                </div>

                {/* Adjustment Section */}
                <div className="pt-4 border-t border-border space-y-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Justera bilens storlek och position
                    </p>
                    {hasUnsavedChanges && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleResetPadding}
                        className="text-muted-foreground hover:text-foreground h-8 px-2"
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-1" />
                        Återställ
                      </Button>
                    )}
                  </div>

                  {/* Padding Slider with Visual Indicator */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <ArrowLeftRight className="h-4 w-4 text-purple-600" />
                        Storlek (padding)
                      </label>
                      <span className="text-sm font-mono text-purple-600 bg-purple-100 px-2 py-1 rounded">
                        {padding.toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Visual Size Indicator */}
                    <div className="flex items-center justify-center gap-4 py-2 px-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-1 text-purple-600">
                        <span className="text-xs font-medium">Större</span>
                      </div>
                      
                      <div className="relative w-20 h-12 flex items-end justify-center">
                        <Car 
                          className="text-purple-600 transition-all duration-200" 
                          style={{ 
                            width: `${20 + (0.49 - padding) * 50}px`,
                            height: `${20 + (0.49 - padding) * 50}px` 
                          }} 
                        />
                      </div>
                      
                      <div className="flex items-center gap-1 text-purple-600">
                        <span className="text-xs font-medium">Mindre</span>
                      </div>
                    </div>
                    
                    <Slider
                      value={[padding]}
                      onValueChange={(val) => setPadding(val[0])}
                      min={0.01}
                      max={0.49}
                      step={0.01}
                      className="w-full"
                    />
                  </div>

                  {/* Padding Bottom Slider with Visual Indicator */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <ArrowUp className="h-4 w-4 text-green-600" />
                        Position (padding bottom)
                      </label>
                      <span className="text-sm font-mono text-green-600 bg-green-100 px-2 py-1 rounded">
                        {paddingBottom.toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Visual Position Indicator */}
                    <div className="flex items-center justify-center gap-4 py-2 px-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-1 text-green-600">
                        <ArrowDown className="h-4 w-4" />
                        <span className="text-xs font-medium">Ner</span>
                      </div>
                      
                      <div className="relative w-16 h-14 border border-green-200 rounded bg-white overflow-hidden">
                        <Car 
                          className="absolute left-1/2 -translate-x-1/2 text-green-600 w-6 h-6 transition-all duration-200" 
                          style={{ 
                            bottom: `${paddingBottom * 80}%` 
                          }} 
                        />
                        {/* Ground line */}
                        <div className="absolute bottom-1.5 left-1.5 right-1.5 h-0.5 bg-green-300 rounded" />
                      </div>
                      
                      <div className="flex items-center gap-1 text-green-600">
                        <span className="text-xs font-medium">Upp</span>
                        <ArrowUp className="h-4 w-4" />
                      </div>
                    </div>
                    
                    <Slider
                      value={[paddingBottom]}
                      onValueChange={(val) => setPaddingBottom(val[0])}
                      min={0.01}
                      max={0.49}
                      step={0.01}
                      className="w-full"
                    />
                  </div>

                  {/* Update Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`w-full transition-all ${
                      hasUnsavedChanges 
                        ? 'bg-amber-500 hover:bg-amber-600 animate-pulse' 
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uppdaterar...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {hasUnsavedChanges ? 'Applicera ändringar' : 'Uppdatera bild'}
                      </>
                    )}
                  </Button>
                  
                  {hasUnsavedChanges && (
                    <p className="text-xs text-center text-amber-600">
                      Förhandsvisningen visar ungefär hur bilden kommer se ut
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Bildgenerator;
