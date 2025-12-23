import { useState } from "react";
import { Search, Car, HelpCircle, ChevronRight, ChevronLeft, Sparkles, RotateCcw, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Interactive Step-by-Step Bil Research Demo
 * Users click through: Välj bil → Välj fråga → AI-svar
 */
interface BilResearchDemoProps {
  onStepChange?: (step: number) => void;
}

const BilResearchDemo = ({ onStepChange }: BilResearchDemoProps = {}) => {
  const [currentStep, setCurrentStepInternal] = useState(1);
  
  const setCurrentStep = (step: number) => {
    setCurrentStepInternal(step);
    onStepChange?.(step);
  };
  const [selectedQuestion, setSelectedQuestion] = useState<'problems' | 'service' | 'fuel'>('problems');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const navigate = useNavigate();

  // Track demo actions
  const trackDemoAction = async (action: string, stepFrom: number) => {
    try {
      const sessionId = localStorage.getItem('bilgen_session_id') || 'unknown';
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('demo_tests').insert({
        session_id: sessionId,
        action: `research_${action}`,
        step_from: stepFrom,
        user_id: user?.id || null
      });
    } catch (error) {
      console.error("Error tracking demo action:", error);
    }
  };

  const regNumber = "ABC 123";
  const carInfo = {
    brand: "Volvo",
    model: "XC60 D4 AWD",
    year: "2019",
    engine: "2.0L Diesel 190 hk",
    mileage: "8 500 mil"
  };

  const questionOptions = [
    { id: 'problems' as const, label: "Vanliga problem?", description: "Kända fel och svagheter" },
    { id: 'service' as const, label: "Vad kostar service?", description: "Uppskattade servicekostnader" },
    { id: 'fuel' as const, label: "Bränsleförbrukning?", description: "Verklig förbrukning och tips" },
  ];

  const demoAnswers = {
    problems: `**Vanliga problem Volvo XC60 D4 AWD (2019)**

🔧 **Motor & Drivlina:**
• Injektorproblem kan uppstå vid 15 000+ mil – lyssna efter ojämn gång
• AdBlue-system kräver påfyllning var 10 000-15 000 mil
• Kopplingsslitage vid mycket stadskörning

⚙️ **Chassi & Komfort:**
• Stötdämpare bak slits snabbare än förväntat
• Luftfjädring (om monterad) kan ge felmeddelanden
• Infotainment kan behöva mjukvaruuppdatering

✅ **Generellt:** XC60 D4 är en pålitlig bil. Ovanstående är kända punkter att kontrollera vid köp.`,
    
    service: `**Servicekostnader Volvo XC60 D4 AWD (2019)**

📅 **Intervall:** Service var 2:a år eller 30 000 km

💰 **Uppskattade kostnader:**

| Service | Pris (ca) |
|---------|-----------|
| Liten service (olja, filter) | 3 500 - 4 500 kr |
| Stor service (60 000 km) | 6 000 - 8 000 kr |
| Bromsbyte (fram) | 4 000 - 5 500 kr |
| Kamremskit (om aktuellt) | 8 000 - 12 000 kr |

💡 **Tips:** Fristående verkstäder kan vara 20-30% billigare än märkesverkstad.`,
    
    fuel: `**Bränsleförbrukning Volvo XC60 D4 AWD (2019)**

⛽ **Officiell förbrukning:** 5,6 l/100 km (blandad)

📊 **Verklig förbrukning (ägarrapporter):**

| Körning | Förbrukning |
|---------|-------------|
| Landsväg | 5,5 - 6,5 l/100 km |
| Blandad | 6,5 - 7,5 l/100 km |
| Stad | 7,5 - 9,0 l/100 km |

💡 **Spartips:**
• Eco-läge sparar 5-10% bränsle
• Rätt däcktryck är viktigt (2,5 bar)
• Undvik tomgångskörning – dieseln är effektivast i fart`
  };

  const generatedAnswer = demoAnswers[selectedQuestion];

  const handleNext = async () => {
    if (currentStep < 2) {
      await trackDemoAction('next', currentStep);
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 2) {
      await trackDemoAction('generate', currentStep);
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
        setShowResult(true);
        setCurrentStep(3);
      }, 1500);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setShowResult(false);
    }
  };

  const handleReset = async () => {
    await trackDemoAction('reset', 3);
    setCurrentStep(1);
    setShowResult(false);
    setSelectedQuestion('problems');
  };

  const handleCopy = async () => {
    await trackDemoAction('copy', 3);
    navigator.clipboard.writeText(generatedAnswer.replace(/\*\*/g, '').replace(/\|/g, ' '));
    toast.success("Kopierat till urklipp!");
  };

  const handleCreateReal = async () => {
    await trackDemoAction('create_real', 3);
    navigate('/bil-research');
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
        
        <div className="relative h-1.5 bg-muted/50 rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="flex justify-between mt-4">
          {[
            { num: 1, label: 'Välj bil' },
            { num: 2, label: 'Välj fråga' },
            { num: 3, label: 'AI-svar' }
          ].map((step) => (
            <div 
              key={step.num}
              className="flex flex-col items-center gap-1"
            >
              <div className={`text-3xl font-bold transition-all duration-300 ${
                step.num < currentStep || showResult
                  ? 'text-primary'
                  : step.num === currentStep
                    ? 'text-foreground'
                    : 'text-muted-foreground/30'
              }`}>
                {step.num}
              </div>
              <span className={`text-xs transition-colors duration-300 ${
                step.num < currentStep || showResult
                  ? 'text-primary'
                  : step.num === currentStep
                    ? 'text-foreground'
                    : 'text-muted-foreground/50'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content card */}
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent rounded-3xl blur-2xl" />
        
        <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="p-6 md:p-8 min-h-[320px] flex flex-col">
            
            {/* Step 1: Car info */}
            {currentStep === 1 && !showResult && (
              <div className="flex-1 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Car className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Biluppgifter hämtade</h3>
                    <p className="text-sm text-muted-foreground">Från registreringsnummer</p>
                  </div>
                </div>
                
                {/* License plate */}
                <div className="flex justify-center py-4">
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-background border-2 border-border shadow-sm">
                    <div className="w-2 h-8 rounded-full bg-[#003399]" />
                    <span className="text-2xl font-mono font-bold tracking-[0.15em] text-foreground">
                      {regNumber}
                    </span>
                  </div>
                </div>
                
                {/* Car details */}
                <div className="mt-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-muted-foreground">Märke & Modell</span>
                      <p className="font-medium text-foreground">{carInfo.brand} {carInfo.model}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Årsmodell</span>
                      <p className="font-medium text-foreground">{carInfo.year}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Motor</span>
                      <p className="font-medium text-foreground">{carInfo.engine}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Mätarställning</span>
                      <p className="font-medium text-foreground">{carInfo.mileage}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Select question */}
            {currentStep === 2 && !showResult && !isGenerating && (
              <div className="flex-1 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <HelpCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Vad vill du veta?</h3>
                    <p className="text-sm text-muted-foreground">Välj en fråga om bilen</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4">
                  {questionOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedQuestion(option.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        selectedQuestion === option.id
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-border/50 bg-muted/20 hover:border-border hover:bg-muted/40'
                      }`}
                    >
                      <p className={`font-medium text-sm ${
                        selectedQuestion === option.id ? 'text-foreground' : 'text-foreground/80'
                      }`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Car context */}
                <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <span className="text-xs text-muted-foreground">Söker om:</span>
                  <p className="text-sm font-medium text-foreground">
                    {carInfo.brand} {carInfo.model} ({carInfo.year})
                  </p>
                </div>
              </div>
            )}

            {/* Generating state */}
            {isGenerating && (
              <div className="flex-1 flex flex-col items-center justify-center animate-fade-in py-12">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Search className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                </div>
                <p className="mt-6 text-foreground font-medium">Söker information...</p>
                <p className="text-sm text-muted-foreground mt-1">AI analyserar data om bilen</p>
              </div>
            )}

            {/* Step 3: Result */}
            {showResult && (
              <div className="flex-1 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                      AI-svar
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
                
                <div className="rounded-xl bg-background border border-border p-4 mb-4 max-h-[220px] overflow-y-auto">
                  <div 
                    className="text-sm leading-relaxed text-foreground/90 prose prose-sm max-w-none"
                    style={{
                      animation: 'fade-in 0.4s ease-out forwards',
                    }}
                  >
                    {generatedAnswer.split('\n').map((line, index) => {
                      // Handle headers
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return (
                          <h4 key={index} className="font-semibold text-foreground mt-3 first:mt-0 mb-2">
                            {line.replace(/\*\*/g, '')}
                          </h4>
                        );
                      }
                      // Handle bullet points
                      if (line.startsWith('•') || line.startsWith('🔧') || line.startsWith('⚙️') || line.startsWith('✅') || line.startsWith('💰') || line.startsWith('📅') || line.startsWith('💡') || line.startsWith('⛽') || line.startsWith('📊')) {
                        return (
                          <p key={index} className="my-1 text-foreground/80">
                            {line}
                          </p>
                        );
                      }
                      // Handle table rows
                      if (line.startsWith('|')) {
                        return null; // Skip table formatting for simplicity in demo
                      }
                      // Empty lines
                      if (line.trim() === '') {
                        return <br key={index} />;
                      }
                      return (
                        <p key={index} className="my-1">
                          {line.replace(/\*\*/g, '')}
                        </p>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs">Baserat på verkliga ägarerfarenheter och expertdata</span>
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
                  {currentStep === 2 ? (
                    <>
                      <Search className="w-4 h-4" />
                      Sök svar
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
                    onClick={handleCreateReal}
                    className="gap-2 bg-primary hover:bg-primary/90"
                  >
                    Sök på riktigt
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
          Från regnummer till expertkunskap – <span className="text-foreground font-medium">utan att googla.</span>
        </p>
      </div>
    </div>
  );
};

export default BilResearchDemo;
