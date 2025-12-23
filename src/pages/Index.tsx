import { useNavigate } from "react-router-dom";
import LevelCard from "@/components/LevelCard";
import DecorativeBackground from "@/components/DecorativeBackground";
import AppHeader from "@/components/AppHeader";
import FeedbackWidget from "@/components/FeedbackWidget";
import HelpWidget from "@/components/HelpWidget";
import bilgenLogo from "@/assets/bilgen-logo.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white animate-fade-in">
      <DecorativeBackground />
      <HelpWidget />
      <FeedbackWidget />

      {/* Header */}
      <AppHeader showBackButton={false} />

      {/* Main Content */}
      <main className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-24 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <button
            onClick={() => navigate("/")}
            className="transition-opacity hover:opacity-80"
          >
            <img 
              src={bilgenLogo} 
              alt="BILGEN - Gå till startsidan" 
              className="h-32 mx-auto mb-10"
            />
          </button>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-4">
            Redo att börja?
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Skriva <span className="gradient-text font-semibold">annons</span>, göra <span className="gradient-text font-semibold">bilresearch</span> eller hantera <span className="gradient-text font-semibold">mail</span>.
          </p>
          
          {/* Speed tagline - catchy gradient pill */}
          <div className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-foreground to-accent text-primary-foreground shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-default">
            <span className="text-lg">⚡</span>
            <span className="text-sm font-medium tracking-wide">
              <span className="text-xl font-bold">2-3X</span> snabbare än manuellt
            </span>
          </div>
        </div>

        {/* Level Cards */}
        <div className="flex flex-col lg:flex-row flex-wrap justify-center gap-8 lg:gap-10 max-w-5xl">
          <LevelCard
            title="Annonstextgenerator"
            description="Skapa annonstextar snabbare med AI"
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
