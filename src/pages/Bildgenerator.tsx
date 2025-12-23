import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import AppHeader from "@/components/AppHeader";
import DecorativeBackground from "@/components/DecorativeBackground";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ImageIcon, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Bildgenerator = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { user, isLoading: authLoading } = useAuth();
  const [prompt, setPrompt] = useState("");
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

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Skriv en beskrivning av bilden du vill skapa");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt: prompt.trim() },
      });

      if (error) {
        console.error("Error generating image:", error);
        toast.error("Kunde inte generera bilden. Försök igen.");
        return;
      }

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
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
              Generera professionella bilder med AI
            </p>
          </div>

          {/* Input Card */}
          <Card className="mb-6 border-purple-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-purple-600" />
                Beskriv din bild
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="T.ex. 'En professionell bild av en röd Volvo V60 parkerad framför en modern bilhandlare vid solnedgång'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-32 resize-none"
                disabled={isGenerating}
              />
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
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
