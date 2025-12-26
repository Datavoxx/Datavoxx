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
import { Loader2, ImageIcon, Download, Sparkles, Upload, ArrowLeft, HelpCircle, Bot, CheckCircle, AlertTriangle, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import demoCarBefore from "@/assets/demo-car-before.png";

interface AIAnalysis {
  status: 'good' | 'needs_adjustment';
  message: string;
  tips: string[];
}

interface UserTemplate {
  id: string;
  name: string;
  template_url: string;
}

const Bildgenerator = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { user, isLoading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mallId = searchParams.get("mall");

  const [selectedTemplate, setSelectedTemplate] = useState<UserTemplate | null>(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(true);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(demoCarBefore);
  const [isUsingDemoImage, setIsUsingDemoImage] = useState(true);
  const [padding, setPadding] = useState(0.25);
  const [paddingBottom, setPaddingBottom] = useState(0.25);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedImageBase64, setGeneratedImageBase64] = useState<string | null>(null);

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
    if (!authLoading && !roleLoading && !isLoadingTemplate && user && isAdmin && !mallId) {
      navigate("/bildgenerator-mallar");
    }
  }, [authLoading, roleLoading, isLoadingTemplate, user, isAdmin, mallId, navigate]);

  // Redirect non-admin users
  if (!authLoading && !roleLoading) {
    if (!user) {
      navigate("/auth");
      return null;
    }
    if (!isAdmin) {
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
      setIsUsingDemoImage(false);
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
      setIsUsingDemoImage(false);
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
    // If using demo image, we need to fetch and convert it to a File
    let imageToUpload = uploadedImage;
    
    if (isUsingDemoImage && !uploadedImage) {
      try {
        const response = await fetch(demoCarBefore);
        const blob = await response.blob();
        imageToUpload = new File([blob], "demo-car.png", { type: "image/png" });
      } catch (error) {
        console.error("Error loading demo image:", error);
        toast.error("Kunde inte ladda demo-bilden");
        return;
      }
    }
    
    if (!imageToUpload) {
      toast.error("Ladda upp en bild först");
      return;
    }

    if (!mallId || !selectedTemplate) {
      toast.error("Ingen mall vald");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setAiAnalysis(null);
    setGeneratedImageBase64(null);

    try {
      // Hämta mall-bilden och konvertera till blob
      const templateResponse = await fetch(selectedTemplate.template_url);
      const templateBlob = await templateResponse.blob();

      const formData = new FormData();
      formData.append("template_id", mallId);
      formData.append("template_image", templateBlob, "template.png");
      formData.append("data", imageToUpload);
      formData.append("padding", padding.toString());
      formData.append("padding_bottom", paddingBottom.toString());

      // Logga vad som skickas
      console.log("Skickar till webhook:", {
        template_id: mallId,
        template_image: `${templateBlob.size} bytes (${templateBlob.type})`,
        data: `${imageToUpload.name} - ${imageToUpload.size} bytes`,
        padding: padding,
        padding_bottom: paddingBottom
      });

      const response = await fetch("https://datavox.app.n8n.cloud/webhook-test/bildgenerator", {
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
      
      // Konvertera blob till base64 för AI-analys
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setGeneratedImageBase64(base64);
        // Starta AI-analys
        analyzeImage(base64);
      };
      reader.readAsDataURL(blob);
      
      toast.success("Bilden har genererats!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Ett fel uppstod. Försök igen.");
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeImage = async (imageBase64: string) => {
    setIsAnalyzing(true);
    setAiAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-car-image', {
        body: {
          imageBase64,
          currentPadding: padding,
          currentPaddingBottom: paddingBottom
        }
      });

      if (error) {
        console.error("Error analyzing image:", error);
        return;
      }

      if (data.error) {
        console.error("AI analysis error:", data.error);
        toast.error(data.error);
        return;
      }

      setAiAnalysis(data);
    } catch (error) {
      console.error("Error calling analyze function:", error);
    } finally {
      setIsAnalyzing(false);
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
              <span className="text-sm font-medium">Admin-verktyg</span>
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
                disabled={isGenerating || (!uploadedImage && !isUsingDemoImage)}
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
                <img
                  src={generatedImage}
                  alt="Generated"
                  className="w-full rounded-lg shadow-md"
                />

                {/* AI Analysis Section */}
                <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-foreground">AI-analys</h3>
                  </div>

                  {isAnalyzing && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Analyserar bilden...</span>
                    </div>
                  )}

                  {aiAnalysis && !isAnalyzing && (
                    <div className="space-y-3">
                      {/* Status indicator */}
                      <div className={`flex items-start gap-2 p-3 rounded-md ${
                        aiAnalysis.status === 'good' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {aiAnalysis.status === 'good' ? (
                          <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        )}
                        <p className="text-sm font-medium">{aiAnalysis.message}</p>
                      </div>

                      {/* Tips */}
                      {aiAnalysis.tips && aiAnalysis.tips.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                            <Lightbulb className="h-4 w-4 text-purple-600" />
                            <span>Tips</span>
                          </div>
                          <ul className="space-y-1.5 pl-6">
                            {aiAnalysis.tips.map((tip, index) => (
                              <li key={index} className="text-sm text-muted-foreground list-disc">
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {!isAnalyzing && !aiAnalysis && (
                    <p className="text-sm text-muted-foreground">
                      AI-analysen kunde inte genomföras just nu.
                    </p>
                  )}
                </div>

                {/* Adjustment Section */}
                <div className="pt-4 border-t border-border space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Justera bilens storlek och position, klicka sedan "Uppdatera bild"
                  </p>

                  {/* Padding Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-foreground">
                        Padding (storlek)
                      </label>
                      <span className="text-sm font-mono text-purple-600 bg-purple-100 px-2 py-1 rounded">
                        {padding.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      value={[padding]}
                      onValueChange={(val) => setPadding(val[0])}
                      min={0.01}
                      max={0.49}
                      step={0.01}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">Lägre värde = större bil</p>
                  </div>

                  {/* Padding Bottom Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-foreground">
                        Padding Bottom (position)
                      </label>
                      <span className="text-sm font-mono text-purple-600 bg-purple-100 px-2 py-1 rounded">
                        {paddingBottom.toFixed(2)}
                      </span>
                    </div>
                    <Slider
                      value={[paddingBottom]}
                      onValueChange={(val) => setPaddingBottom(val[0])}
                      min={0.01}
                      max={0.49}
                      step={0.01}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">Lägre värde = bil längre ner</p>
                  </div>

                  {/* Update Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uppdaterar...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Uppdatera bild
                      </>
                    )}
                  </Button>
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
