import LevelCard from "@/components/LevelCard";
import { toast } from "@/hooks/use-toast";
import expressLogo from "@/assets/express-bilar-logo.png";

const Index = () => {
  const handleLevelSelect = (level: string) => {
    toast({
      title: `${level} vald`,
      description: `Du har valt ${level}`,
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      {/* Logo */}
      <img 
        src={expressLogo} 
        alt="Express Bilar" 
        className="h-16 mb-8 animate-fade-in-up"
      />
      
      {/* Header */}
      <div className="mb-16 text-center animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <h1 className="text-3xl font-bold text-foreground mb-2">Välj nivå</h1>
        <p className="text-muted-foreground">Välj den nivå du vill använda</p>
      </div>

      {/* Level Cards */}
      <div className="flex flex-col sm:flex-row gap-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <LevelCard
          title="Bilannonsgenerator"
          description="Skapa annonser snabbare med en annonsgenerator"
          onClick={() => handleLevelSelect("Bilannonsgenerator")}
        />
        <LevelCard
          title="Bil Research Expert"
          description="Lär känna era nya bilar genom att fråga mig om den – kanske lättare att sälja ju mer du vet"
          onClick={() => handleLevelSelect("Bil Research Expert")}
        />
      </div>
    </div>
  );
};

export default Index;
