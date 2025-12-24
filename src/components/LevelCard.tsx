import { cn } from "@/lib/utils";
import { ArrowRight, Lock } from "lucide-react";

interface LevelCardProps {
  title: string;
  description?: string;
  onClick?: () => void;
  className?: string;
  timeBadge?: string;
  locked?: boolean;
}

const LevelCard = ({ title, description, onClick, className, timeBadge, locked }: LevelCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-start justify-between text-left",
        "w-full sm:w-80 min-h-[140px] sm:min-h-[200px] p-5 sm:p-8 rounded-2xl",
        "bg-white border border-gray-200",
        "transition-all duration-300 ease-out",
        "hover:shadow-xl hover:-translate-y-2 hover:border-gray-300",
        "focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:ring-offset-2",
        "cursor-pointer",
        className
      )}
    >
      {/* Lock Badge */}
      {locked && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
          <Lock className="h-3 w-3" />
          <span>Låst</span>
        </div>
      )}

      {/* Time Badge */}
      {timeBadge && !locked && (
        <div className="absolute top-4 right-4 flex flex-col items-end gap-0.5">
          <div className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
            {timeBadge}
          </div>
          <span className="text-[10px] text-muted-foreground">istället för 5 min</span>
        </div>
      )}

      <div className="flex-1">
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
      <div className="flex items-center mt-6 text-muted-foreground group-hover:text-foreground transition-colors duration-300">
        <span className="text-sm font-medium mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Öppna
        </span>
        <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
      </div>
    </button>
  );
};

export default LevelCard;
