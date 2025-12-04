import { cn } from "@/lib/utils";

interface LevelCardProps {
  title: string;
  description?: string;
  onClick?: () => void;
  className?: string;
}

const LevelCard = ({ title, description, onClick, className }: LevelCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center justify-center",
        "w-64 h-48 rounded-xl",
        "bg-level-card border border-level-border",
        "transition-all duration-300 ease-out",
        "hover:bg-level-card-hover hover:border-foreground/50",
        "hover:shadow-[0_0_30px_0_hsl(var(--level-card-glow)/0.3)]",
        "focus:outline-none focus:ring-2 focus:ring-foreground/50",
        "cursor-pointer",
        className
      )}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <span className="relative text-2xl font-semibold text-foreground group-hover:text-foreground transition-colors duration-300">
        {title}
      </span>
      
      {description && (
        <span className="relative mt-2 text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
          {description}
        </span>
      )}
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-foreground group-hover:w-3/4 transition-all duration-300 rounded-full" />
    </button>
  );
};

export default LevelCard;
