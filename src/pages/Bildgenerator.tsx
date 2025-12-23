import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import AppHeader from "@/components/AppHeader";
import DecorativeBackground from "@/components/DecorativeBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Loader2, ImageIcon, Download, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";

const Bildgenerator = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { user, isLoading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [padding, setPadding] = useState(0.25);
  const [paddingBottom, setPaddingBottom] = useState(0.25);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

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

  if (authLoading || roleLoading) {
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

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const formData = new FormData();
      formData.append("data", uploadedImage);
      formData.append("padding", padding.toString());
      formData.append("padding_bottom", paddingBottom.toString());

      const response = await fetch("https://datavox.app.n8n.cloud/webhook-test/bildgenerator", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.imageUrl || data.image) {
        setGeneratedImage(data.imageUrl || data.image);
        toast.success("Bilden har genererats!");
      } else {
        toast.error("Inget bildsvar mottogs");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Ett fel uppstod. Försök igen.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
            <p className="text-lg text-muted-foreground">
              Ladda upp en bild och justera padding-inställningar
            </p>
          </div>

          {/* Upload & Settings Card */}
          <Card className="mb-6 border-purple-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-purple-600" />
                Ladda upp bild
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

              {/* Padding Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground">
                    Padding
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
              </div>

              {/* Padding Bottom Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground">
                    Padding Bottom
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
              <CardContent>
                <img
                  src={generatedImage}
                  alt="Generated"
                  className="w-full rounded-lg shadow-md"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Bildgenerator;
