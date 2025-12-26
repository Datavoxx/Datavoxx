import { cn } from "@/lib/utils";
import { ArrowRight, Lock } from "lucide-react";

interface LevelCardProps {
  title: string;
  description?: string;
  onClick?: () => void;
  className?: string;
  timeBadge?: string;
  locked?: boolean;
  blurred?: boolean;
}

const LevelCard = ({ title, description, onClick, className, timeBadge, locked, blurred }: LevelCardProps) => {
  const isRestricted = locked || blurred;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-start justify-between text-left",
        "w-full sm:w-80 min-h-[140px] sm:min-h-[200px] p-5 sm:p-8 rounded-2xl",
        "bg-white border border-gray-200",
        "transition-all duration-300 ease-out",
        "focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:ring-offset-2",
        isRestricted 
          ? "cursor-pointer hover:border-gray-300" 
          : "hover:shadow-xl hover:-translate-y-2 hover:border-gray-300 cursor-pointer",
        className
      )}
    >
      {/* Blur overlay for blurred state */}
      {blurred && (
        <div className="absolute inset-0 rounded-2xl bg-background/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-muted/80">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Låst</span>
          </div>
        </div>
      )}

      {/* Lock Badge (for non-blurred locked state) */}
      {locked && !blurred && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium z-20">
          <Lock className="h-3 w-3" />
          <span>Låst</span>
        </div>
      )}

      {/* Time Badge */}
      {timeBadge && !isRestricted && (
        <div className="absolute top-4 right-4 flex flex-col items-end gap-0.5">
          <div className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
            {timeBadge}
          </div>
          <span className="text-[10px] text-muted-foreground">istället för 5 min</span>
        </div>
      )}

      <div className={cn("flex-1", blurred && "opacity-50")}>
        <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">
          {title}
        </h3>
        
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      
      {/* Arrow indicator */}
      {!blurred && (
        <div className="flex items-center mt-6 text-muted-foreground group-hover:text-foreground transition-colors duration-300">
          <span className="text-sm font-medium mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Öppna
          </span>
          <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      )}
    </button>
  );
};

export default LevelCard;
