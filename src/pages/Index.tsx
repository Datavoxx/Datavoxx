import { useNavigate } from "react-router-dom";
import LevelCard from "@/components/LevelCard";
import DecorativeBackground from "@/components/DecorativeBackground";
import AppHeader from "@/components/AppHeader";
import bilgenLogo from "@/assets/bilgen-logo.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white animate-fade-in">
      <DecorativeBackground />

      {/* Header */}
      <AppHeader showBackButton={false} />

      {/* Main Content */}
      <main className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-24 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <img 
            src={bilgenLogo} 
            alt="BILGEN" 
            className="h-20 mx-auto mb-10"
          />
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-4">
            Välj verktyg
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Vad vill du göra idag?
          </p>
        </div>

        {/* Level Cards */}
        <div className="flex flex-col lg:flex-row flex-wrap justify-center gap-8 lg:gap-10 max-w-5xl">
          <LevelCard
            title="Bilannonsgenerator"
            description="Skapa annonser snabbare med en annonsgenerator"
            onClick={() => navigate("/annons-generator")}
          />
          <LevelCard
            title="Bil Research Expert"
            description="Lär känna era nya bilar genom att fråga mig om den"
            onClick={() => navigate("/bil-research")}
          />
          <LevelCard
            title="Email Assistent"
            description="Skriv professionella e-postmeddelanden snabbt med AI-hjälp"
            onClick={() => navigate("/email-assistent")}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
