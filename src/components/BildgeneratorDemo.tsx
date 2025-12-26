import { useState } from "react";
import { Image, Upload, Palette, ChevronRight, ChevronLeft, Sparkles, RotateCcw, Download, Check, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Demo images
import mall1 from "@/assets/mall-1.png";
import mall2 from "@/assets/mall-2.png";
import mall3 from "@/assets/mall-3.png";
import demoCarBefore from "@/assets/demo-car-before.png";
import demoCarResult from "@/assets/demo-car-result.png";

interface BildgeneratorDemoProps {
  onStepChange?: (step: number) => void;
}

const BildgeneratorDemo = ({ onStepChange }: BildgeneratorDemoProps = {}) => {
  const [currentStep, setCurrentStepInternal] = useState(1);
  
  const setCurrentStep = (step: number) => {
    setCurrentStepInternal(step);
    onStepChange?.(step);
  };
  const [selectedTemplate, setSelectedTemplate] = useState<'professional' | 'premium' | 'minimal'>('professional');
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
        action: `bildgenerator_${action}`,
        step_from: stepFrom,
        user_id: user?.id || null
      });
    } catch (error) {
      console.error("Error tracking demo action:", error);
    }
  };

  const templateOptions = [
    { id: 'professional' as const, label: "Professionell", description: "Klassisk stil för Blocket/Bytbil", image: mall1 },
    { id: 'premium' as const, label: "Premium", description: "Lyxig känsla med gradient", image: mall2 },
    { id: 'minimal' as const, label: "Minimalistisk", description: "Clean och modern", image: mall3 },
  ];

  const resultImage = demoCarResult;

  const aiTips = {
    professional: { status: 'good', message: 'Bilen är rätt positionerad!', tips: ['Storleken passar perfekt i mallen', 'Bra centrering av fordonet'] },
    premium: { status: 'good', message: 'Utmärkt resultat!', tips: ['Premium-känsla med bra komposition', 'Bilens proportioner framhävs väl'] },
    minimal: { status: 'needs_adjustment', message: 'Förslag på justering', tips: ['Överväg att öka padding för mer luft', 'Annars ser det bra ut!'] },
  };

  const currentAiTips = aiTips[selectedTemplate];

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
      }, 2000);
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
    setSelectedTemplate('professional');
  };

  const handleDownload = async () => {
    await trackDemoAction('download_attempt', 3);
    toast.info("Detta är en demo – skapa på riktigt för att ladda ner!");
  };

  const handleCreateReal = async () => {
    await trackDemoAction('create_real', 3);
    navigate('/bildgenerator-mallar');
  };

  const totalSteps = 2;
  const progressPercentage = showResult ? 100 : ((currentStep - 1) / totalSteps) * 100 + (100 / totalSteps / 2);

  const loadingSteps = [
    "Analyserar bilbild...",
    "Tar bort bakgrund...",
    "Applicerar mall...",
  ];
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  // Cycle through loading steps
  useState(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setLoadingStepIndex(prev => (prev + 1) % loadingSteps.length);
      }, 600);
      return () => clearInterval(interval);
    }
  });

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
        <div className="flex justify-between mt-4">
          {[
            { num: 1, label: 'Bild' },
            { num: 2, label: 'Mall' }
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
        {/* Background glow */}
        <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent rounded-3xl blur-2xl" />
        
        <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="p-6 md:p-8 min-h-[320px] flex flex-col">
            
            {/* Step 1: Upload image */}
            {currentStep === 1 && !showResult && (
              <div className="flex-1 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Bilbild uppladdad</h3>
                    <p className="text-sm text-muted-foreground">Din bild är redo för bearbetning</p>
                  </div>
                </div>
                
                {/* Demo car image preview */}
                <div className="flex justify-center py-4">
                  <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-primary/30 bg-muted/20 p-2">
                    <img 
                      src={demoCarBefore} 
                      alt="Volvo XC60 2019" 
                      className="w-full max-w-sm rounded-lg object-cover"
                    />
                    <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <Check className="w-3 h-3" />
                        Klar
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Klicka "Nästa" för att välja mall
                </p>
              </div>
            )}

            {/* Step 2: Select template */}
            {currentStep === 2 && !showResult && !isGenerating && (
              <div className="flex-1 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Välj mall</h3>
                    <p className="text-sm text-muted-foreground">Hur ska din annons se ut?</p>
                  </div>
                </div>
                
                {/* Template options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4">
                  {templateOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedTemplate(option.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                        selectedTemplate === option.id
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-border/50 bg-muted/20 hover:border-border hover:bg-muted/40'
                      }`}
                    >
                      <div className="aspect-video rounded-lg overflow-hidden mb-2 bg-muted/50">
                        <img src={option.image} alt={option.label} className="w-full h-full object-cover" />
                      </div>
                      <p className={`font-medium text-sm ${
                        selectedTemplate === option.id ? 'text-foreground' : 'text-foreground/80'
                      }`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
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
                    <Image className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                </div>
                <p className="mt-6 text-foreground font-medium">{loadingSteps[loadingStepIndex]}</p>
                <p className="text-sm text-muted-foreground mt-1">AI bearbetar din bild</p>
              </div>
            )}

            {/* Step 3: Result */}
            {showResult && (
              <div className="flex-1 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                      Din genererade bild
                    </span>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">Ladda ner</span>
                  </button>
                </div>
                
                {/* Generated image */}
                <div className="rounded-xl overflow-hidden border border-border mb-4">
                  <img src={resultImage} alt="Genererad bild" className="w-full aspect-video object-cover" />
                </div>
                
                {/* AI Tips */}
                <div className={`rounded-xl p-4 border ${
                  currentAiTips.status === 'good' 
                    ? 'bg-green-500/5 border-green-500/20' 
                    : 'bg-yellow-500/5 border-yellow-500/20'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      currentAiTips.status === 'good' 
                        ? 'bg-green-500/20' 
                        : 'bg-yellow-500/20'
                    }`}>
                      {currentAiTips.status === 'good' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Lightbulb className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${
                        currentAiTips.status === 'good' ? 'text-green-700' : 'text-yellow-700'
                      }`}>
                        {currentAiTips.message}
                      </p>
                      <ul className="mt-1 space-y-0.5">
                        {currentAiTips.tips.map((tip, index) => (
                          <li key={index} className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
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
                    onClick={handleCreateReal}
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
          Från vanlig bilbild till professionell annons – <span className="text-foreground font-medium">automatiskt.</span>
        </p>
      </div>
    </div>
  );
};

export default BildgeneratorDemo;
