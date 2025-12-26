import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Copy, Check, RefreshCw, Loader2, ArrowLeft, Sparkles, FileText, AlignLeft, AlignJustify, Pencil, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DecorativeBackground from "@/components/DecorativeBackground";
import AppHeader from "@/components/AppHeader";

type AdLength = "short" | "long";

interface FormData {
  car: string;
  year: string;
  mileage: string;
  price: string;
  equipment: string;
  condition: string;
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
  const { user, profile } = useAuth();
  const state = location.state as LocationState | null;

  const [generatedAd, setGeneratedAd] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenerateCount, setRegenerateCount] = useState(0);
  const [selectedLength, setSelectedLength] = useState<AdLength>("short");
  const [isEditing, setIsEditing] = useState(false);
  const [editedAd, setEditedAd] = useState("");
  const hasGeneratedRef = useRef(false);
  
  const MAX_REGENERATIONS = 3;

  const generateAd = useCallback(async (length: AdLength = selectedLength) => {
    if (!state) return;

    setIsGenerating(true);
    setGeneratedAd("");

    try {
      // Get session ID for anonymous credit tracking
      const sessionId = localStorage.getItem('bilgen_session_id');
      
      const requestBody: { 
        formData: FormData; 
        systemPrompt: string; 
        companyName?: string; 
        userName?: string;
        length: AdLength;
        sessionId?: string;
      } = {
        formData: state.formData,
        systemPrompt: state.systemPrompt,
        length,
        sessionId: sessionId || undefined,
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
      
      if (user) {
        try {
          await supabase.from('ad_generations').insert({
            user_id: user.id,
            session_id: user.id,
            user_name: profile?.display_name || user.email || 'Anonym',
            brand: state.formData.car.split(' ')[0] || '',
            model: state.formData.car.split(' ').slice(1).join(' ') || '',
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
  }, [state, user, profile, selectedLength]);

  useEffect(() => {
    if (!state) {
      navigate("/annons-generator");
    }
  }, [state, navigate]);

  useEffect(() => {
    if (!state || hasGeneratedRef.current) return;
    hasGeneratedRef.current = true;
    generateAd(selectedLength);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLengthChange = (length: AdLength) => {
    if (length === selectedLength || isGenerating) return;
    setSelectedLength(length);
    setRegenerateCount(prev => prev + 1);
    generateAd(length);
  };

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
    if (regenerateCount >= MAX_REGENERATIONS) {
      toast({
        title: "Max antal regenereringar nått",
        description: "Prova att ändra något i formuläret för att få ett bättre resultat",
        variant: "destructive",
      });
      return;
    }
    setRegenerateCount(prev => prev + 1);
    generateAd();
  };

  const handleBack = () => {
    navigate("/annons-generator", {
      state: {
        formData: state?.formData,
      },
    });
  };

  const handleStartEdit = () => {
    setEditedAd(generatedAd);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    const originalText = generatedAd;
    setGeneratedAd(editedAd);
    setIsEditing(false);

    // Spara redigeringen till databasen
    try {
      const sessionId = localStorage.getItem('bilgen_session_id') || 'unknown';
      
      await supabase.from('ad_edits').insert({
        session_id: sessionId,
        original_text: originalText,
        edited_text: editedAd,
        car_info: `${state?.formData.car || ''} ${state?.formData.year || ''}`.trim(),
        ad_length: selectedLength
      });
    } catch (error) {
      console.error("Error saving edit:", error);
    }

    toast({
      title: "Ändringar sparade!",
      description: "Din redigerade annons är redo att kopieras",
    });
  };

  const handleCancelEdit = () => {
    setEditedAd("");
    setIsEditing(false);
  };

  if (!state) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-background">
      <DecorativeBackground />
      <AppHeader showBackButton={true} onBackClick={handleBack} />
      
      <div className="mx-auto max-w-3xl relative z-10 px-4 py-4 sm:p-6">

        {/* Success Hero Section - Compact on mobile */}
        <div className="mb-4 sm:mb-8 text-center opacity-0 animate-fade-in">
          {/* Success icon with glow - smaller on mobile */}
          <div className="inline-flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-2 sm:mb-4 animate-pulse-glow">
            <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 text-primary" />
          </div>
          
          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent mb-2 sm:mb-3">
            Annons Skapad!
          </h1>
          
          {/* Car info badge with regeneration dots inline on mobile */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-primary font-medium text-sm sm:text-base">
                {state.formData.car} {state.formData.year && `(${state.formData.year})`}
              </span>
            </div>
            
            {/* Regeneration indicator - inline on mobile */}
            {generatedAd && !isGenerating && (
              <div className="flex items-center gap-1.5 opacity-0 animate-fade-in" style={{ animationDelay: "50ms" }}>
                {[...Array(MAX_REGENERATIONS)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                      i < regenerateCount
                        ? 'bg-muted-foreground/30'
                        : 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]'
                    }`}
                  />
                ))}
                <span className="text-[10px] sm:text-xs text-muted-foreground ml-1">
                  {MAX_REGENERATIONS - regenerateCount} kvar
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Card with Glassmorphism */}
        <div 
          className="relative rounded-2xl overflow-hidden opacity-0 animate-fade-in"
          style={{ animationDelay: "100ms" }}
        >
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-primary/10 rounded-2xl" />
          
          {/* Glass card content */}
          <div className="relative m-[1px] rounded-2xl backdrop-blur-xl bg-background/80 border border-border/50 p-4 sm:p-6 md:p-8">
            
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12 sm:py-20">
                <div className="relative">
                  <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
                  <Loader2 className="relative h-10 w-10 sm:h-14 sm:w-14 animate-spin text-primary mb-4 sm:mb-6" />
                </div>
                <p className="text-base sm:text-xl font-medium text-foreground mb-1 sm:mb-2">Genererar din annons...</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Detta kan ta {selectedLength === "short" ? "10-15 sek" : "30-60 sek"}</p>
                
                {/* Loading progress dots */}
                <div className="flex gap-1.5 mt-4 sm:mt-6">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary animate-pulse"
                      style={{ animationDelay: `${i * 200}ms` }}
                    />
                  ))}
                </div>
              </div>
            ) : generatedAd ? (
              <>
                {/* Max regenerations warning */}
                {regenerateCount >= MAX_REGENERATIONS && (
                  <div className="mb-4 sm:mb-6 rounded-xl border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm p-3 sm:p-4 text-center">
                    <p className="text-orange-400 font-medium text-sm sm:text-base">
                      Du har regenererat 3 gånger – prova att ändra något i formuläret!
                    </p>
                  </div>
                )}

                {/* Action Buttons - Compact layout on mobile */}
                <div className="mb-4 sm:mb-8 space-y-2 sm:space-y-0 sm:flex sm:flex-row sm:justify-center sm:items-center sm:gap-3">
                  {/* Primary CTA - Copy (full width on mobile) */}
                  <Button
                    onClick={handleCopy}
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Kopierat!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Kopiera annons
                      </>
                    )}
                  </Button>

                  {/* Second row on mobile: Toggle + Regenerate */}
                  <div className="flex gap-2 sm:contents">
                    {/* Length Toggle - Segmented buttons */}
                    <div className="flex-1 sm:flex-initial inline-flex rounded-lg border border-border/50 p-1 bg-background/50 backdrop-blur-sm">
                      <button
                        onClick={() => handleLengthChange("short")}
                        disabled={isGenerating}
                        className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                          selectedLength === "short"
                            ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <AlignLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Kort
                      </button>
                      <button
                        onClick={() => handleLengthChange("long")}
                        disabled={isGenerating}
                        className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                          selectedLength === "long"
                            ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <AlignJustify className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Lång
                      </button>
                    </div>
                    
                    {/* Secondary - Regenerate or Change */}
                    {regenerateCount >= MAX_REGENERATIONS ? (
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        className="flex-1 sm:flex-initial border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500 text-xs sm:text-sm px-3 sm:px-4"
                      >
                        <ArrowLeft className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Ändra formuläret</span>
                        <span className="sm:hidden">Ändra</span>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={handleRegenerate}
                        className="flex-1 sm:flex-initial border-border/50 hover:border-primary/50 hover:bg-primary/5 text-xs sm:text-sm px-3 sm:px-4"
                      >
                        <RefreshCw className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Regenerera</span>
                        <span className="sm:hidden">Ny</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Ad Content with styled header */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                      <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">Din annons</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {!isEditing && (
                        <button
                          onClick={handleStartEdit}
                          className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/30"
                        >
                          <Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          Redigera
                        </button>
                      )}
                      <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {selectedLength === "short" ? "Kort" : "Lång"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative rounded-xl overflow-hidden">
                    {/* Subtle inner glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                    
                    <div className="relative bg-secondary/50 backdrop-blur-sm border border-border/30 rounded-xl p-4 sm:p-6 md:p-8">
                      {isEditing ? (
                        <div className="space-y-3 sm:space-y-4">
                          <textarea
                            value={editedAd}
                            onChange={(e) => setEditedAd(e.target.value)}
                            className="w-full min-h-[200px] sm:min-h-[300px] bg-background/50 border border-border/50 rounded-lg p-3 sm:p-4 text-sm sm:text-base text-foreground leading-relaxed font-normal resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                            placeholder="Redigera din annons här..."
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCancelEdit}
                              className="border-border/50 text-xs sm:text-sm"
                            >
                              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                              Avbryt
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs sm:text-sm"
                            >
                              <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                              Spara
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap text-foreground leading-relaxed font-normal text-sm sm:text-base">
                          {generatedAd}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tertiary - Back link */}
                <div className="mt-4 sm:mt-6 text-center">
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Tillbaka till formulär
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 sm:py-20">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted/50 flex items-center justify-center mb-3 sm:mb-4">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">Ingen annons genererad ännu</p>
                <Button onClick={handleRegenerate} variant="outline" className="text-sm">
                  Försök igen
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnonsResultat;
