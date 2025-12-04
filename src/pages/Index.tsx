import { useNavigate } from "react-router-dom";
import LevelCard from "@/components/LevelCard";
import bilgenLogo from "@/assets/bilgen-logo.png";

const Index = () => {
  const navigate = useNavigate();

  const handleResearchSelect = () => {
    navigate("/bil-research");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      {/* Logo */}
      <img 
        src={bilgenLogo} 
        alt="BILGEN" 
        className="h-16 mb-8 animate-fade-in-up"
      />
      
      {/* Header */}
      <div className="mb-16 text-center animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <h1 className="text-3xl font-bold text-foreground mb-2">Välj verktyg</h1>
        <p className="text-muted-foreground">Vad vill du göra idag?</p>
      </div>

      {/* Level Cards */}
      <div className="flex flex-col sm:flex-row gap-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <LevelCard
          title="Bilannonsgenerator"
          description="Skapa annonser snabbare med en annonsgenerator"
          onClick={() => navigate("/annons-generator")}
        />
        <LevelCard
          title="Bil Research Expert"
          description="Lär känna era nya bilar genom att fråga mig om den – kanske lättare att sälja ju mer du vet"
          onClick={handleResearchSelect}
        />
      </div>
    </div>
  );
};

export default Index;
