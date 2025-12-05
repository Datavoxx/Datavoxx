import { useNavigate } from "react-router-dom";
import LevelCard from "@/components/LevelCard";
import NameInput from "@/components/NameInput";
import bilgenLogo from "@/assets/bilgen-logo.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute top-0 left-0 w-full h-full opacity-[0.03]"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
        >
          <ellipse cx="200" cy="100" rx="400" ry="300" fill="currentColor" className="text-foreground" />
          <ellipse cx="1300" cy="700" rx="350" ry="250" fill="currentColor" className="text-foreground" />
        </svg>
      </div>

      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <img 
            src={bilgenLogo} 
            alt="BILGEN" 
            className="h-8"
          />
          <NameInput />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-24 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in-up">
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
        <div 
          className="flex flex-col lg:flex-row flex-wrap justify-center gap-8 lg:gap-10 max-w-5xl animate-fade-in-up" 
          style={{ animationDelay: "0.15s" }}
        >
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
