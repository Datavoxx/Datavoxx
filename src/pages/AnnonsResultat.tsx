import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Copy, Check, RefreshCw, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DecorativeBackground from "@/components/DecorativeBackground";
import AppHeader from "@/components/AppHeader";

interface FormData {
  brand: string;
  model: string;
  year: string;
  mileage: string;
  price: string;
  equipment: string;
  condition: string;
  // Nya finansieringsfält
  interestRate: string;
  campaign: string;
  insuranceOffer: string;
  financing: string;
  warranty: string;
}

interface LocationState {
  formData: FormData;
  systemPrompt: string;
  selectedFocus: string;
}

const AnnonsResultat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isLoading: authLoading } = useAuth();
  const state = location.state as LocationState | null;

  const [generatedAd, setGeneratedAd] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateAd = useCallback(async () => {
    if (!state) return;

    setIsGenerating(true);
    setGeneratedAd("");

    try {
      // Build request body - include user info only if logged in
      const requestBody: { 
        formData: FormData; 
        systemPrompt: string; 
        companyName?: string; 
        userName?: string 
      } = {
        formData: state.formData,
        systemPrompt: state.systemPrompt,
      };
      
      if (user && profile) {
        if (profile.company_name) requestBody.companyName = profile.company_name;
        if (profile.display_name) requestBody.userName = profile.display_name;
      }

      const response = await supabase.functions.invoke("generate-ad", {
        body: requestBody,
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to generate ad");
      }

      const data = response.data;
      
      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedAd(data.generatedAd || "");
      
      // Save ad to database only if user is logged in
      if (user) {
        try {
          await supabase.from('ad_generations').insert({
            user_id: user.id,
            session_id: user.id,
            user_name: profile?.display_name || user.email || 'Anonym',
            brand: state.formData.brand,
            model: state.formData.model,
            year: state.formData.year || null,
            mileage: state.formData.mileage || null,
            price: state.formData.price || null,
            equipment: state.formData.equipment || null,
            condition: state.formData.condition || null,
            tone: state.selectedFocus || null,
            generated_ad: data.generatedAd || null
          });
        } catch (saveError) {
          console.error("Error saving ad:", saveError);
        }
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
  }, [state, user, profile]);

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
    <div className="relative min-h-screen bg-background">
      <DecorativeBackground />
      {/* Header */}
      <AppHeader showBackButton={true} onBackClick={handleBack} />
      
      <div className="mx-auto max-w-3xl relative z-10 p-6">

        {/* Title */}
        <div className="mb-10 text-center opacity-0 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">Din Genererade Annons</h1>
          <p className="text-muted-foreground">
            {state.formData.brand} {state.formData.model} {state.formData.year && `(${state.formData.year})`}
          </p>
        </div>

        {/* Generated Ad Card */}
        <div 
          className="rounded-xl border border-level-border bg-level-card p-6 transition-all duration-300 hover:shadow-[0_0_30px_0_hsl(var(--level-card-glow)/0.15)] opacity-0 animate-fade-in"
          style={{ animationDelay: "100ms" }}
        >
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-foreground mb-4" />
              <p className="text-lg text-muted-foreground">Genererar din annons...</p>
              <p className="text-sm text-muted-foreground mt-2">Detta kan ta 30-60 sekunder</p>
            </div>
          ) : generatedAd ? (
            <>
              {/* Action Buttons */}
              <div className="mb-6 flex flex-wrap justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleCopy}
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
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerera
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={handleBack}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Tillbaka till formulär
                </Button>
              </div>
              
              <div className="whitespace-pre-wrap rounded-lg bg-secondary p-6 text-foreground leading-relaxed">
                {generatedAd}
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
