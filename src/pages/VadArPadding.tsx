import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import DecorativeBackground from "@/components/DecorativeBackground";
import PaddingExplainer from "@/components/PaddingExplainer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle } from "lucide-react";

const VadArPadding = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-muted/30 to-background animate-fade-in">
      <DecorativeBackground />
      <AppHeader showBackButton />

      <main className="relative flex flex-col items-center px-6 pt-24 pb-16">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 mb-4">
              <HelpCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Hjälp</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">
              Vad är padding?
            </h1>
            <p className="text-muted-foreground">
              Se hur padding påverkar din bild steg för steg
            </p>
          </div>

          {/* Interactive Animation */}
          <PaddingExplainer />

          {/* Back Button */}
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="border-purple-200 hover:bg-purple-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tillbaka till bildgeneratorn
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VadArPadding;
