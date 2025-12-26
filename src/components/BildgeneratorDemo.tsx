import { useState, useEffect } from "react";
import { Upload, Palette, ChevronRight, ChevronLeft, Sparkles, RotateCcw, Download, Check, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface BildgeneratorDemoProps {
  onStepChange?: (step: number) => void;
}

const BildgeneratorDemo = ({ onStepChange }: BildgeneratorDemoProps = {}) => {
  const [currentStep, setCurrentStepInternal] = useState(1);
  const [isRemoving, setIsRemoving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'professional' | 'premium' | 'minimal'>('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const navigate = useNavigate();

  const setCurrentStep = (step: number) => {
    setCurrentStepInternal(step);
    onStepChange?.(step);
  };

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
    { id: 'professional' as const, label: "Professionell", description: "Klassisk showroom-stil", color: "from-slate-700 to-slate-800" },
    { id: 'premium' as const, label: "Premium", description: "Lyxig gradient", color: "from-slate-800 to-slate-900" },
    { id: 'minimal' as const, label: "Minimalistisk", description: "Clean och modern", color: "from-gray-600 to-gray-700" },
  ];

  const aiTips = {
    professional: { status: 'good', message: 'Bilen är rätt positionerad!', tips: ['Storleken passar perfekt i mallen', 'Bra centrering av fordonet'] },
    premium: { status: 'good', message: 'Utmärkt resultat!', tips: ['Premium-känsla med bra komposition', 'Bilens proportioner framhävs väl'] },
    minimal: { status: 'needs_adjustment', message: 'Förslag på justering', tips: ['Överväg att öka padding för mer luft', 'Annars ser det bra ut!'] },
  };

  const currentAiTips = aiTips[selectedTemplate];

  const loadingSteps = [
    "Analyserar bilbild...",
    "Tar bort bakgrund...",
    "Applicerar mall...",
  ];

  // Cycle through loading steps
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setLoadingStepIndex(prev => (prev + 1) % loadingSteps.length);
      }, 600);
      return () => clearInterval(interval);
    }
  }, [isGenerating, loadingSteps.length]);

  const handleNext = async () => {
    if (currentStep === 1) {
      // Start background removal animation
      await trackDemoAction('next', currentStep);
      setIsRemoving(true);
      setTimeout(() => {
        setIsRemoving(false);
        setCurrentStep(2);
      }, 1500);
    } else if (currentStep === 2) {
      await trackDemoAction('generate', currentStep);
      setIsGenerating(true);
      setLoadingStepIndex(0);
      setTimeout(() => {
        setIsGenerating(false);
        setShowResult(true);
        setCurrentStep(3);
      }, 2000);
    }
  };

  const handleBack = () => {
    if (currentStep > 1 && !isRemoving) {
      setCurrentStep(currentStep - 1);
      setShowResult(false);
    }
  };

  const handleReset = async () => {
    await trackDemoAction('reset', 3);
    setCurrentStep(1);
    setShowResult(false);
    setSelectedTemplate('professional');
    setIsRemoving(false);
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

  // Get current template colors
  const currentTemplateColors = templateOptions.find(t => t.id === selectedTemplate)?.color || "from-slate-700 to-slate-800";

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
          <div className="p-6 md:p-8 min-h-[420px] flex flex-col">
            
            {/* Step header */}
            {!showResult && !isGenerating && (
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  {currentStep === 1 ? (
                    <Upload className="w-6 h-6 text-primary" />
                  ) : (
                    <Palette className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {currentStep === 1 ? "Bilbild uppladdad" : "Välj mall"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentStep === 1 ? "Din bild är redo för bearbetning" : "Hur ska din annons se ut?"}
                  </p>
                </div>
              </div>
            )}

            {/* Animation area - Car visualization */}
            {!isGenerating && (
              <div className="relative bg-gradient-to-b from-muted/50 to-muted rounded-xl overflow-hidden aspect-video mb-6 border border-border/50">
                
                {/* Template background (showroom) - visible from step 2 onwards or result */}
                {(currentStep >= 2 || showResult) && !isRemoving && (
                  <div className={`absolute inset-0 bg-gradient-to-b ${currentTemplateColors} transition-all duration-500`}>
                    {/* Floor reflection */}
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
                    {/* Spotlight effect */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-b-full" />
                  </div>
                )}

                {/* Transparent background indicator (during step 1 after removal) */}
                {currentStep === 1 && !isRemoving && (
                  <div
                    className="absolute inset-0 opacity-0"
                    style={{
                      backgroundImage: `
                        linear-gradient(45deg, #e5e5e5 25%, transparent 25%),
                        linear-gradient(-45deg, #e5e5e5 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, #e5e5e5 75%),
                        linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)
                      `,
                      backgroundSize: "20px 20px",
                      backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                    }}
                  />
                )}

                {/* Original background (step 1 and during removal) */}
                {(currentStep === 1 || isRemoving) && (
                  <div
                    className={`absolute inset-0 bg-gradient-to-b from-blue-300 via-blue-400 to-green-400 transition-opacity duration-1000 ${
                      isRemoving ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    {/* Simple background elements */}
                    <div className="absolute top-8 right-12 w-16 h-10 bg-white/60 rounded-full" />
                    <div className="absolute top-12 right-20 w-12 h-8 bg-white/40 rounded-full" />
                    <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-green-500/50 to-transparent" />
                  </div>
                )}

                {/* Car illustration */}
                <div
                  className="absolute left-1/2 bottom-[15%] transition-all duration-500 ease-out"
                  style={{
                    transform: `translateX(-50%) scale(${showResult || currentStep >= 2 ? 1.2 : 1})`,
                  }}
                >
                  {/* Car SVG - same as PaddingExplainer */}
                  <svg
                    viewBox="0 0 200 80"
                    className="w-48 h-auto drop-shadow-lg"
                    style={{
                      filter: (currentStep >= 2 || showResult) ? "drop-shadow(0 10px 20px rgba(0,0,0,0.3))" : "none",
                    }}
                  >
                    {/* Car body */}
                    <path
                      d="M20 50 L35 50 L45 30 L90 25 L140 25 L160 35 L180 40 L180 55 L20 55 Z"
                      fill="#1e40af"
                      className="transition-all duration-300"
                    />
                    {/* Roof */}
                    <path
                      d="M50 30 L85 20 L130 20 L150 30"
                      fill="none"
                      stroke="#1e3a8a"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {/* Windows */}
                    <path
                      d="M55 30 L65 22 L95 22 L95 30 Z"
                      fill="#60a5fa"
                      opacity="0.8"
                    />
                    <path
                      d="M100 22 L100 30 L135 30 L125 22 Z"
                      fill="#60a5fa"
                      opacity="0.8"
                    />
                    {/* Wheels */}
                    <circle cx="50" cy="55" r="12" fill="#1f2937" />
                    <circle cx="50" cy="55" r="6" fill="#6b7280" />
                    <circle cx="150" cy="55" r="12" fill="#1f2937" />
                    <circle cx="150" cy="55" r="6" fill="#6b7280" />
                    {/* Headlights */}
                    <ellipse cx="175" cy="45" rx="4" ry="3" fill="#fbbf24" />
                    <ellipse cx="25" cy="52" rx="3" ry="2" fill="#ef4444" />
                    {/* Details */}
                    <line x1="45" y1="45" x2="160" y2="45" stroke="#1e3a8a" strokeWidth="1" />
                  </svg>
                </div>

                {/* Removal animation overlay */}
                {isRemoving && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 bg-background/90 rounded-full shadow-lg animate-pulse border border-primary/20">
                      <Sparkles className="h-5 w-5 text-primary animate-spin" />
                      <span className="text-sm font-medium text-primary">Tar bort bakgrund...</span>
                    </div>
                  </div>
                )}

                {/* Upload badge (step 1) */}
                {currentStep === 1 && !isRemoving && (
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <Check className="w-3 h-3" />
                      Uppladdad
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Template selection (step 2) */}
            {currentStep === 2 && !showResult && !isGenerating && (
              <div className="animate-fade-in">
                <div className="grid grid-cols-3 gap-3">
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
                      {/* Mini preview with gradient */}
                      <div className={`aspect-video rounded-lg overflow-hidden mb-2 bg-gradient-to-b ${option.color}`}>
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-8 h-3 bg-blue-700 rounded-sm" />
                        </div>
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
                    <Sparkles className="w-6 h-6 text-primary animate-pulse" />
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
              {currentStep > 1 && !showResult && !isRemoving ? (
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
              
              {!showResult && !isRemoving ? (
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
              ) : showResult ? (
                <div className="flex items-center gap-3 ml-auto">
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
              ) : null}
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
