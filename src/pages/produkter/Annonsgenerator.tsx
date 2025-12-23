import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Sparkles, FileText, Zap, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import DecorativeBackground from "@/components/DecorativeBackground";
import TerminalDemo from "@/components/TerminalDemo";
import StepGuide, { StepGuideContent } from "@/components/StepGuide";
import bilgenLogo from "@/assets/bilgen-logo.png";

const stepGuides: Record<number, StepGuideContent> = {
  1: {
    title: "Steg 1: Registreringsnummer",
    description: "Skriv in kundens registreringsnummer. Vi hämtar automatiskt all bildata från Transportstyrelsen – märke, modell, årsmodell, motor och mer.",
    tip: "I det riktiga verktyget skriver du in kundens regnr och får all info på 2 sekunder."
  },
  2: {
    title: "Steg 2: Finansieringsuppgifter",
    description: "Lägg till era aktuella kampanjer, räntor och erbjudanden. Dessa väver AI:n in naturligt i annonstexten för att locka köpare.",
    tip: "Dina sparade kampanjer kommer automatiskt nästa gång du skapar en annons."
  },
  3: {
    title: "Steg 3: Välj fokus",
    description: "Bestäm vad som ska lyftas fram mest i annonsen. Finansiering passar när ni har bra kampanjer, utrustning när bilen har mycket extra.",
    tip: "Balanserad mix fungerar bra för de flesta bilar."
  },
  4: {
    title: "Klart! Din annons är redo",
    description: "AI:n har skapat en säljande annonstext baserat på bilens data och dina val. Kopiera och klistra in på Blocket, Bytbil eller Facebook.",
    tip: "Du kan alltid regenerera med andra inställningar om du vill prova en annan vinkel."
  }
};

const features = [
  "Från regnr till färdig text på 10 sekunder",
  "Optimerad för Blocket, Bytbil och Facebook",
  "Inkludera finansiering och kampanjer automatiskt",
  "Välj fokus: finansiering, utrustning eller mix"
];

const Annonsgenerator = () => {
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
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Annonsgenerator</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              <span className="text-foreground">Skapa </span>
              <span className="gradient-text">säljande bilannonser</span>
              <span className="text-foreground"> på sekunder</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Slå in regnr, välj fokus – få färdig annonstext. AI:n skriver, du säljer.
            </p>
          </div>

          {/* Main content: Demo + Step Guide */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
            {/* Demo */}
            <div>
              <TerminalDemo onStepChange={handleStepChange} />
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
                onClick={() => navigate("/start")}
                className="gap-2 text-lg px-8 py-6"
              >
                <Sparkles className="h-5 w-5" />
                Använd verktyget på riktigt
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

export default Annonsgenerator;
