import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Image, Zap, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import DecorativeBackground from "@/components/DecorativeBackground";
import PaddingExplainer from "@/components/PaddingExplainer";
import StepGuide, { StepGuideContent } from "@/components/StepGuide";
import bilgenLogo from "@/assets/bilgen-logo.png";

const stepGuides: Record<number, StepGuideContent> = {
  1: {
    title: "Steg 1: Skicka din bild",
    description: "Skicka bilbilden precis som den är – direkt från kameran eller ditt bildbibliotek. Ingen förbehandling krävs.",
    tip: "Du kan skicka bilder via webbsidan eller direkt via API."
  },
  2: {
    title: "Steg 2: AI tar bort bakgrunden",
    description: "Vår AI analyserar bilden och tar automatiskt bort bakgrunden. Du behöver inte göra något – det sker på sekunder.",
    tip: "Bakgrundsborttagningen fungerar på alla typer av bilar och vinklar."
  },
  3: {
    title: "Steg 3: Justera storlek",
    description: "Använd padding-slidern för att justera hur stor bilen ska vara på mallen. Lägre värde ger större bil.",
    tip: "De flesta bilar ser bäst ut runt 0.20-0.30 i padding."
  },
  4: {
    title: "Steg 4: Justera position",
    description: "Finjustera bilens vertikala position på mallen. Lägre värde placerar bilen längre ner.",
    tip: "Experimentera för att hitta den perfekta placeringen för din mall."
  }
};

const features = [
  "Skicka bild via webbsida eller API",
  "Automatisk bakgrundsborttagning",
  "Färdiga showroom-mallar",
  "Endast ett värde att justera (padding)",
  "Färdig bild på sekunder"
];

const ProduktBildgenerator = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <DecorativeBackground />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={bilgenLogo} alt="BILGEN" className="h-8" />
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Tillbaka
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-8 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Image className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Bildgenerator</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              <span className="text-foreground">Skapa </span>
              <span className="gradient-text">professionella bilbilder</span>
              <span className="text-foreground"> på sekunder</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Skicka din bilbild – vi tar bort bakgrunden och placerar den på en snygg mall. Du justerar bara storleken.
            </p>
          </div>

          {/* Main content: Demo + Step Guide */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
            {/* Demo */}
            <div>
              <PaddingExplainer onStepChange={handleStepChange} />
            </div>

            {/* Step Guide Sidebar */}
            <div className="hidden lg:block sticky top-8">
              <StepGuide currentStep={currentStep} stepGuides={stepGuides} />
              
              {/* Features list */}
              <div className="mt-6 p-4 rounded-xl bg-card/50 border border-border/50">
                <h4 className="text-sm font-semibold text-foreground mb-3">Funktioner</h4>
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Mobile Step Guide */}
          <div className="lg:hidden mt-8">
            <StepGuide currentStep={currentStep} stepGuides={stepGuides} />
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <div className="inline-flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/bildgenerator")}
                className="gap-2 text-lg px-8 py-6"
              >
                <Image className="h-5 w-5" />
                Prova bildgeneratorn
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/paket")}
                className="gap-2 text-lg px-8 py-6"
              >
                Se priser & paket
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Ingen registrering krävs för demo
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Gratis att prova
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProduktBildgenerator;
