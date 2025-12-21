import { useState } from "react";
import { Car, CreditCard, Target, Copy, Check, ChevronRight, ChevronLeft, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

/**
 * Interactive Step-by-Step Demo
 * Users click through: Reg.nr → Financing → Focus → Generated text
 */
const TerminalDemo = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFocus, setSelectedFocus] = useState<'financing' | 'equipment' | 'mixed'>('financing');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const navigate = useNavigate();

  const regNumber = "ABC 123";
  
  const financingDetails = [
    { label: "Ränta", value: "3,95%" },
    { label: "Kampanj", value: "Januarikampanj" },
    { label: "Försäkring", value: "Inkluderat erbjudande" },
  ];

  const focusOptions = [
    { id: 'financing' as const, icon: CreditCard, label: "Finansiering", description: "Lyft fram kampanjränta och erbjudanden" },
    { id: 'equipment' as const, icon: Car, label: "Skick & Utrustning", description: "Fokusera på bilens egenskaper" },
    { id: 'mixed' as const, icon: Target, label: "Balanserad", description: "Blandning av allt" },
  ];

  const adTexts = {
    financing: `Januari-rea! Just nu erbjuder vi förmånlig kampanjfinansiering med endast 3,95% i ränta vid köp i samband med vår januarikampanj. Ett fantastiskt tillfälle att göra en riktigt bra bilaffär!

Nu till bilen: Vi har en Volvo XC60 D4 AWD Momentum, årsmodell 2019. En robust och välutrustad SUV med panoramatak, navigation och dragkrok.

Bilen är servad hos märkesverkstad och har fullständig servicehistorik. Kontakta oss för provkörning eller mer information!`,
    
    equipment: `Volvo XC60 D4 AWD Momentum 2019 – Topputrustad SUV!

Denna välskötta XC60 levereras med:
✓ Panoramatak för extra rymd och ljus
✓ Navigation med stor pekskärm
✓ Dragkrok (1800 kg)
✓ Parkeringskamera och sensorer
✓ Läderklädsel med elstolar
✓ Adaptiv farthållare

Bilen har fullständig servicehistorik hos märkesverkstad och är i utmärkt skick. Kontakta oss för provkörning!`,
    
    mixed: `Volvo XC60 D4 AWD Momentum 2019 – Välutrustad till kampanjpris!

En robust familje-SUV med panoramatak, navigation och dragkrok. Läderklädsel, parkeringskamera och fullständig servicehistorik hos märkesverkstad.

Just nu med kampanjfinansiering från 3,95% ränta. Passa på – kontakta oss för visning och provkörning!`
  };

  const generatedAdText = adTexts[selectedFocus];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 3) {
      // Generate
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
        setShowResult(true);
        setCurrentStep(4);
      }, 1500);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setShowResult(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setShowResult(false);
    setSelectedFocus('financing');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedAdText);
    toast.success("Kopierat till urklipp!");
  };

  const totalSteps = 3;
  const progressPercentage = showResult ? 100 : ((currentStep - 1) / totalSteps) * 100 + (100 / totalSteps / 2);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {showResult ? "Klart!" : `Steg ${currentStep} av ${totalSteps}`}
          </span>
        </div>
        
        {/* Progress track */}
        <div className="relative h-1.5 bg-muted/50 rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* Step indicators */}
        <div className="flex justify-between mt-3">
          {[1, 2, 3].map((step) => (
            <div 
              key={step}
              className={`flex items-center gap-2 transition-colors duration-300 ${
                step < currentStep || showResult 
                  ? 'text-primary' 
                  : step === currentStep 
                    ? 'text-foreground' 
                    : 'text-muted-foreground/50'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border transition-all duration-300 ${
                step < currentStep || showResult
                  ? 'bg-primary border-primary text-primary-foreground'
                  : step === currentStep
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-muted-foreground/30'
              }`}>
                {step < currentStep || showResult ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  step
                )}
              </div>
              <span className="hidden sm:inline text-xs">
                {step === 1 ? 'Reg.nr' : step === 2 ? 'Finansiering' : 'Fokus'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content card */}
      <div className="relative">
        {/* Background glow */}
        <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent rounded-3xl blur-2xl" />
        
        <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
          {/* Step content with transitions */}
          <div className="p-6 md:p-8 min-h-[320px] flex flex-col">
            
            {/* Step 1: Registration number */}
            {currentStep === 1 && !showResult && (
              <div className="flex-1 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Car className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Ange registreringsnummer</h3>
                    <p className="text-sm text-muted-foreground">Vi hämtar bilens uppgifter automatiskt</p>
                  </div>
                </div>
                
                {/* License plate display */}
                <div className="flex justify-center py-8">
                  <div className="inline-flex items-center gap-3 px-6 py-4 rounded-lg bg-background border-2 border-border shadow-sm">
                    <div className="w-2 h-10 rounded-full bg-[#003399]" />
                    <span className="text-3xl font-mono font-bold tracking-[0.15em] text-foreground">
                      {regNumber}
                    </span>
                  </div>
                </div>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Klicka "Nästa" för att fortsätta med demon
                </p>
              </div>
            )}

            {/* Step 2: Financing */}
            {currentStep === 2 && !showResult && (
              <div className="flex-1 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Finansieringsuppgifter</h3>
                    <p className="text-sm text-muted-foreground">Dessa inkluderas i annonsen</p>
                  </div>
                </div>
                
                {/* Financing details */}
                <div className="space-y-3 py-4">
                  {financingDetails.map((detail, index) => (
                    <div 
                      key={detail.label}
                      className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50"
                      style={{
                        animation: 'fade-in 0.3s ease-out forwards',
                        animationDelay: `${index * 0.1}s`,
                      }}
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">{detail.label}</span>
                        <p className="font-medium text-foreground">{detail.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Focus selection */}
            {currentStep === 3 && !showResult && !isGenerating && (
              <div className="flex-1 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Välj fokus för annonsen</h3>
                    <p className="text-sm text-muted-foreground">Vad ska lyftas fram mest?</p>
                  </div>
                </div>
                
                {/* Focus options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4">
                  {focusOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedFocus(option.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        selectedFocus === option.id
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-border/50 bg-muted/20 hover:border-border hover:bg-muted/40'
                      }`}
                    >
                      <option.icon className={`w-5 h-5 mb-2 ${
                        selectedFocus === option.id ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <p className={`font-medium text-sm ${
                        selectedFocus === option.id ? 'text-foreground' : 'text-foreground/80'
                      }`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Generating state */}
            {isGenerating && (
              <div className="flex-1 flex flex-col items-center justify-center animate-fade-in py-12">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                </div>
                <p className="mt-6 text-foreground font-medium">Genererar annonstext...</p>
                <p className="text-sm text-muted-foreground mt-1">AI analyserar och skriver</p>
              </div>
            )}

            {/* Step 4: Result */}
            {showResult && (
              <div className="flex-1 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                      Din genererade annonstext
                    </span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">Kopiera</span>
                  </button>
                </div>
                
                {/* Generated text */}
                <div className="rounded-xl bg-background border border-border p-4 mb-4 max-h-[200px] overflow-y-auto">
                  {generatedAdText.split('\n\n').map((paragraph, index) => (
                    <p 
                      key={index}
                      className="text-sm leading-relaxed text-foreground/90 mb-3 last:mb-0"
                      style={{
                        animation: 'fade-in 0.4s ease-out forwards',
                        animationDelay: `${index * 0.15}s`,
                        opacity: 0,
                      }}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
                
                {/* Ready indicator */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs">Redo att klistras in på Blocket, Bytbil, Facebook...</span>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
              {currentStep > 1 && !showResult ? (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Tillbaka
                </Button>
              ) : (
                <div />
              )}
              
              {!showResult ? (
                <Button
                  onClick={handleNext}
                  disabled={isGenerating}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  {currentStep === 3 ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generera
                    </>
                  ) : (
                    <>
                      Nästa
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Börja om
                  </Button>
                  <Button
                    onClick={() => navigate('/start')}
                    className="gap-2 bg-primary hover:bg-primary/90"
                  >
                    Skapa på riktigt
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className="text-center mt-8">
        <p className="text-sm md:text-base text-muted-foreground">
          Från regnummer till säljande annonstext – <span className="text-foreground font-medium">på sekunder.</span>
        </p>
      </div>
    </div>
  );
};

export default TerminalDemo;
