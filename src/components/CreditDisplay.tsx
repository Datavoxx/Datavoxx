import { Zap, AlertTriangle } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface CreditDisplayProps {
  compact?: boolean;
}

const TIER_LABELS: Record<string, string> = {
  anonymous: "Gratis",
  free_logged_in: "Gratis",
  gen_1: "Gen 1",
  gen_2: "Gen 2",
};

export const CreditDisplay = ({ compact = false }: CreditDisplayProps) => {
  const { remaining, limit, tier, canUse, isLoading } = useCredits();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Badge variant="outline" className="animate-pulse">
        <Zap className="h-3 w-3 mr-1" />
        ...
      </Badge>
    );
  }

  const percentage = (remaining / limit) * 100;
  const isLow = percentage <= 20;
  const isExhausted = remaining === 0;

  const tierLabel = TIER_LABELS[tier] || tier;

  const handleClick = () => {
    if (!user) {
      navigate("/auth");
    } else if (tier === "free_logged_in" || tier === "anonymous") {
      navigate("/paket");
    }
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant={isExhausted ? "destructive" : isLow ? "secondary" : "outline"}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleClick}
            >
              {isExhausted ? (
                <AlertTriangle className="h-3 w-3 mr-1" />
              ) : (
                <Zap className="h-3 w-3 mr-1" />
              )}
              {remaining}/{limit}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{tierLabel}</p>
            <p className="text-sm text-muted-foreground">
              {remaining} av {limit} credits kvar idag
            </p>
            {isExhausted && (
              <p className="text-sm text-destructive mt-1">
                Återställs vid midnatt
              </p>
            )}
            {!user && (
              <p className="text-sm text-primary mt-1">
                Logga in för fler credits
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-lg border ${
        isExhausted
          ? "border-destructive bg-destructive/10"
          : isLow
          ? "border-yellow-500 bg-yellow-500/10"
          : "border-border bg-background"
      }`}
    >
      {isExhausted ? (
        <AlertTriangle className="h-4 w-4 text-destructive" />
      ) : (
        <Zap className={`h-4 w-4 ${isLow ? "text-yellow-500" : "text-primary"}`} />
      )}
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {remaining}/{limit} credits
        </span>
        <span className="text-xs text-muted-foreground">{tierLabel}</span>
      </div>
      {(tier === "anonymous" || tier === "free_logged_in") && (
        <button
          onClick={handleClick}
          className="ml-auto text-xs text-primary hover:underline"
        >
          {!user ? "Logga in" : "Uppgradera"}
        </button>
      )}
    </div>
  );
};
