import { MessageCircle, Lightbulb, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepGuideContent {
  title: string;
  description: string;
  tip?: string;
}

interface StepGuideProps {
  currentStep: number;
  stepGuides: Record<number, StepGuideContent>;
  className?: string;
}

const StepGuide = ({ currentStep, stepGuides, className }: StepGuideProps) => {
  const guide = stepGuides[currentStep];
  
  if (!guide) return null;

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
            
            {guide.tip && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
                <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-foreground/80 leading-relaxed">
                  <span className="font-medium text-primary">Tips:</span> {guide.tip}
                </p>
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
