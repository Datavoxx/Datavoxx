import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LevelCard from "@/components/LevelCard";
import DecorativeBackground from "@/components/DecorativeBackground";
import AppHeader from "@/components/AppHeader";
import FeedbackWidget from "@/components/FeedbackWidget";
import HelpWidget from "@/components/HelpWidget";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { History, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import HistoryPanel from "@/components/HistoryPanel";
import { LockedToolModal } from "@/components/LockedToolModal";
import bilgenLogo from "@/assets/bilgen-logo.png";

const Index = () => {
  const navigate = useNavigate();
  const { hasMinRole, isGuest } = useUserRole();
  const { user } = useAuth();
  const [showHistory, setShowHistory] = useState(false);
  const [lockedToolModal, setLockedToolModal] = useState<{ open: boolean; toolName: string }>({
    open: false,
    toolName: "",
  });

  // Access rules:
  // - Email Assistent: locked for guests (user role), open for intro+
  // - Bildgenerator: locked for guests AND intro, open for gen_1+
  const isEmailLocked = isGuest;
  const isBildgenLocked = !hasMinRole("gen_1");

  const handleLockedToolClick = (toolName: string) => {
    setLockedToolModal({ open: true, toolName });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white animate-fade-in">
      <DecorativeBackground />
      <HelpWidget />
      <FeedbackWidget />

      {/* Locked Tool Modal */}
      <LockedToolModal
        open={lockedToolModal.open}
        onClose={() => setLockedToolModal({ open: false, toolName: "" })}
        toolName={lockedToolModal.toolName}
      />

      {/* Header */}
      <AppHeader showBackButton={false} />

      {/* History button - only visible when logged in */}
      {user && (
        <div className="fixed top-20 right-4 z-40">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowHistory(true)}
            className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-accent"
            title="Visa historik"
          >
            <History className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* History Panel */}
      <HistoryPanel
        type="all"
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />

      {/* Main Content */}
      <main className="relative flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 pt-20 sm:pt-24 pb-12 sm:pb-16">
        {/* Guest Banner */}
        {isGuest && (
          <div className="w-full max-w-md mx-auto mb-6 animate-fade-in">
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <Sparkles className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Lås upp alla verktyg</p>
                  <p className="text-sm text-muted-foreground">
                    Skapa konto gratis för full tillgång
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => navigate("/auth")}
                size="sm"
                className="shrink-0"
              >
                Skapa konto
              </Button>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-10 sm:mb-20">
          <button
            onClick={() => navigate("/")}
            className="transition-opacity hover:opacity-80"
          >
            <img 
              src={bilgenLogo} 
              alt="BILGEN - Gå till startsidan" 
              className="h-20 sm:h-32 mx-auto mb-6 sm:mb-10"
            />
          </button>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-3 sm:mb-4">
            Redo att börja?
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-md mx-auto px-2">
            Skriva <span className="gradient-text font-semibold">annons</span>, göra <span className="gradient-text font-semibold">bilresearch</span> eller hantera <span className="gradient-text font-semibold">mail</span>.
          </p>
          
          {/* Speed tagline - hidden on mobile */}
          <div className="hidden sm:inline-flex mt-6 items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-foreground to-accent text-primary-foreground shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-default">
            <span className="text-lg">⚡</span>
            <span className="text-sm font-medium tracking-wide">
              <span className="text-xl font-bold">2-3X</span> snabbare än manuellt
            </span>
          </div>
        </div>

        {/* Level Cards */}
        <div className="flex flex-col lg:flex-row flex-wrap justify-center gap-4 sm:gap-8 lg:gap-10 max-w-5xl w-full">
          <LevelCard
            title="Annonstextgenerator"
            description="Skapa annonstextar snabbare med AI"
            onClick={() => navigate("/annons-generator")}
            timeBadge="10 sek"
          />
          <LevelCard
            title="Bil Research Expert"
            description="Lär känna era nya bilar genom att fråga mig om den"
            onClick={() => navigate("/bil-research")}
            timeBadge="Direkt"
          />
          <LevelCard
            title="Email Assistent"
            description="Skriv professionella e-postmeddelanden snabbt med AI-hjälp"
            onClick={isEmailLocked ? () => handleLockedToolClick("Email Assistent") : () => navigate("/email-assistent")}
            timeBadge={!isEmailLocked ? "5 sek" : undefined}
            blurred={isEmailLocked}
          />
          <LevelCard
            title="Bildgenerator"
            description="Generera professionella bilder med AI"
            onClick={isBildgenLocked ? () => handleLockedToolClick("Bildgenerator") : () => navigate("/bildgenerator")}
            blurred={isBildgenLocked}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
