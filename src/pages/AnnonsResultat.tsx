import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Copy, Check, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserSession } from "@/hooks/useUserSession";
import bilgenLogo from "@/assets/bilgen-logo.png";

interface FormData {
  brand: string;
  model: string;
  year: string;
  mileage: string;
  price: string;
  equipment: string;
  condition: string;
}

interface LocationState {
  formData: FormData;
  systemPrompt: string;
  selectedTone: string;
}

const AnnonsResultat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId, userName } = useUserSession();
  const state = location.state as LocationState | null;

  const [generatedAd, setGeneratedAd] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateAd = useCallback(async () => {
    if (!state) return;

    setIsGenerating(true);
    setGeneratedAd("");

    try {
      const response = await supabase.functions.invoke("generate-ad", {
        body: {
          formData: state.formData,
          systemPrompt: state.systemPrompt,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to generate ad");
      }

      const data = response.data;
      
      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedAd(data.generatedAd || "");
      
      // Save ad to database
      try {
        await supabase.from('ad_generations').insert({
          session_id: sessionId,
          user_name: userName || 'Anonym',
          brand: state.formData.brand,
          model: state.formData.model,
          year: state.formData.year || null,
          mileage: state.formData.mileage || null,
          price: state.formData.price || null,
          equipment: state.formData.equipment || null,
          condition: state.formData.condition || null,
          tone: state.selectedTone || null,
          generated_ad: data.generatedAd || null
        });
      } catch (saveError) {
        console.error("Error saving ad:", saveError);
      }
      
      toast({
        title: "Annons genererad!",
        description: "Din annons är nu redo att användas",
      });
    } catch (error) {
      console.error("Error generating ad:", error);
      toast({
        title: "Fel vid generering",
        description: error instanceof Error ? error.message : "Något gick fel",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [state]);

  // Generate on mount
  useEffect(() => {
    if (!state) {
      navigate("/annons-generator");
      return;
    }
    generateAd();
  }, [state, navigate, generateAd]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedAd);
    setCopied(true);
    toast({
      title: "Kopierat!",
      description: "Annonsen har kopierats till urklipp",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    generateAd();
  };

  const handleBack = () => {
    navigate("/annons-generator", {
      state: {
        formData: state?.formData,
      },
    });
  };

  if (!state) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4 animate-fade-in-up">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <img src={bilgenLogo} alt="BILGEN" className="h-10" />
        </div>

        {/* Title */}
        <div className="mb-10 text-center animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-3xl font-bold text-foreground mb-2">Din Genererade Annons</h1>
          <p className="text-muted-foreground">
            {state.formData.brand} {state.formData.model} {state.formData.year && `(${state.formData.year})`}
          </p>
        </div>

        {/* Generated Ad Card */}
        <div 
          className="rounded-xl border border-level-border bg-level-card p-6 transition-all duration-300 hover:shadow-[0_0_30px_0_hsl(var(--level-card-glow)/0.15)] animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-foreground mb-4" />
              <p className="text-lg text-muted-foreground">Genererar din annons...</p>
              <p className="text-sm text-muted-foreground mt-2">Detta kan ta 30-60 sekunder</p>
            </div>
          ) : generatedAd ? (
            <>
              <div className="whitespace-pre-wrap rounded-lg bg-secondary p-6 text-foreground leading-relaxed">
                {generatedAd}
              </div>
              
              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  className="transition-all duration-200 hover:border-foreground hover:text-foreground"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Kopierat!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Kopiera annons
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleRegenerate}
                  className="transition-all duration-200 hover:border-foreground hover:text-foreground"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerera
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="transition-all duration-200"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Tillbaka till formulär
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-muted-foreground">Ingen annons genererad ännu</p>
              <Button onClick={handleRegenerate} className="mt-4">
                Försök igen
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnonsResultat;