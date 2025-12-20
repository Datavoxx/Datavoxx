import { useState, useEffect } from "react";
import { Car, FileText, Sparkles, CheckCircle, Loader2, Eye } from "lucide-react";

/**
 * App Demo Component - Shows a modern step-by-step animation
 * Demonstrates how easy it is to use Bilgen
 */
const TerminalDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showReveal, setShowReveal] = useState(false);

  const steps = [
    { 
      icon: Car, 
      completedText: 'Registreringsnummer: ABC123',
      activeText: 'Anger registreringsnummer...' 
    },
    { 
      icon: FileText, 
      completedText: 'Bilinfo hämtad: Volvo XC60 2019',
      activeText: 'Hämtar bilinfo...' 
    },
    { 
      icon: Sparkles, 
      completedText: 'Annons skapad',
      activeText: 'Skapar annons...' 
    },
    { 
      icon: CheckCircle, 
      completedText: 'Klart! Annonsen är redo',
      activeText: 'Slutför...' 
    },
  ];

  useEffect(() => {
    if (currentStep < steps.length) {
      const delay = currentStep === 0 ? 800 : 1200;
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      // Show reveal after all steps complete
      const revealTimer = setTimeout(() => {
        setShowReveal(true);
      }, 400);
      return () => clearTimeout(revealTimer);
    }
  }, [currentStep, steps.length]);

  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Modern app card */}
      <div className="rounded-2xl overflow-hidden shadow-xl border border-border/50 bg-card">
        {/* Header with progress */}
        <div className="px-5 py-4 border-b border-border/30 bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Skapa annons</span>
            <span className="text-xs text-muted-foreground">
              {Math.min(currentStep, steps.length)}/{steps.length}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        
        {/* Steps list */}
        <div className="p-5 space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;
            const isVisible = index <= currentStep;
            
            if (!isVisible) return null;
            
            return (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-primary/5 border border-primary/20' 
                    : isActive 
                      ? 'bg-muted/50 border border-border/50' 
                      : 'bg-muted/30'
                }`}
                style={{ 
                  animation: isVisible ? 'fade-in-up 0.4s ease-out forwards' : undefined,
                  animationDelay: `${index * 0.05}s`
                }}
              >
                {/* Icon container */}
                <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-primary/10 text-primary' 
                    : isActive 
                      ? 'bg-muted text-muted-foreground' 
                      : 'bg-muted/50 text-muted-foreground/50'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                {/* Text */}
                <span className={`flex-1 text-sm ${
                  isCompleted 
                    ? 'text-foreground font-medium' 
                    : 'text-muted-foreground'
                }`}>
                  {isCompleted ? step.completedText : step.activeText}
                </span>
                
                {/* Status indicator */}
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5 text-primary" />
                    </div>
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Reveal section - shows after completion */}
        {showReveal && (
          <div 
            className="px-5 pb-5 animate-fade-in"
            style={{ animationDuration: '0.5s' }}
          >
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border border-primary/20">
              {/* Mini preview */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">Volvo XC60 D4 2019</p>
                  <p className="text-xs text-muted-foreground">Professionell annons skapad</p>
                </div>
              </div>
              
              {/* CTA button */}
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                <Eye className="w-4 h-4" />
                Visa annons
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalDemo;
