import { MessageCircle, Lightbulb, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface StepGuideContent {
  title: string;
  description: string;
  tip?: string;
  authPrompt?: {
    text: string;
    buttonText: string;
    link: string;
  };
}

interface StepGuideProps {
  currentStep: number;
  stepGuides: Record<number, StepGuideContent>;
  className?: string;
  isAuthenticated?: boolean;
}

const StepGuide = ({ currentStep, stepGuides, className, isAuthenticated = false }: StepGuideProps) => {
  const guide = stepGuides[currentStep];
  
  if (!guide) return null;

  // Show auth prompt if user is not authenticated and authPrompt exists for this step
  const showAuthPrompt = !isAuthenticated && guide.authPrompt;
  const showTip = isAuthenticated && guide.tip;

  return (
    <div className={cn(
      "relative animate-fade-in",
      className
    )}>
      {/* Speech bubble container */}
      <div className="relative">
        {/* Pointer arrow */}
        <div className="absolute -left-3 top-6 w-3 h-3 rotate-45 bg-card border-l border-b border-primary/30" />
        
        {/* Main bubble */}
        <div className="rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-sm shadow-lg shadow-primary/5 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/20">
            <MessageCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">{guide.title}</span>
          </div>
          
          {/* Content */}
          <div className="p-5 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {guide.description}
            </p>
            
            {/* Show tip if authenticated */}
            {showTip && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-foreground/80 leading-relaxed">
                  <span className="font-medium text-primary">Tips:</span> {guide.tip}
                </p>
              </div>
            )}
            
            {/* Show auth prompt if not authenticated */}
            {showAuthPrompt && guide.authPrompt && (
              <div className="flex flex-col gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-start gap-3">
                  <UserPlus className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    {guide.authPrompt.text}
                  </p>
                </div>
                <Button asChild size="sm" className="w-full">
                  <Link to={guide.authPrompt.link}>
                    {guide.authPrompt.buttonText}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Step indicator dots */}
      <div className="flex justify-center gap-2 mt-4">
        {Object.keys(stepGuides).map((step) => (
          <div
            key={step}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              parseInt(step) === currentStep
                ? "bg-primary w-6"
                : parseInt(step) < currentStep
                  ? "bg-primary/50"
                  : "bg-muted-foreground/30"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default StepGuide;
