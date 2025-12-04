import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import expressLogo from "@/assets/express-bilar-logo.png";

interface FormData {
  brand: string;
  model: string;
  year: string;
  mileage: string;
  price: string;
  equipment: string;
  condition: string;
}

const DEFAULT_PROMPT = `Du är en expert på att skriva säljande bilannonser på svenska. 
Skapa en professionell och engagerande annons baserat på bilinformationen.
Annonsen ska vara:
- Tydlig och välstrukturerad
- Säljande men ärlig
- Innehålla emojis för visuell appeal
- Inkludera en uppmaning att kontakta säljaren`;

const AnnonsGenerator = () => {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_PROMPT);
  const [formData, setFormData] = useState<FormData>({
    brand: "",
    model: "",
    year: "",
    mileage: "",
    price: "",
    equipment: "",
    condition: "",
  });

  // Load saved settings from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem("openai_api_key");
    const savedPrompt = localStorage.getItem("ad_system_prompt");
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedPrompt) setSystemPrompt(savedPrompt);
  }, []);

  // Save API key when changed
  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    localStorage.setItem("openai_api_key", value);
  };

  // Save prompt when changed
  const handlePromptChange = (value: string) => {
    setSystemPrompt(value);
    localStorage.setItem("ad_system_prompt", value);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = () => {
    if (!formData.brand || !formData.model) {
      toast({
        title: "Fyll i obligatoriska fält",
        description: "Märke och modell måste anges",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "API-nyckel saknas",
        description: "Ange din OpenAI API-nyckel i inställningarna",
        variant: "destructive",
      });
      return;
    }

    // Navigate to results page with form data
    navigate("/annons-resultat", {
      state: {
        formData,
        apiKey,
        systemPrompt,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4 animate-fade-in-up">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <img src={expressLogo} alt="Express Bilar" className="h-10" />
        </div>

        {/* Title */}
        <div className="mb-10 text-center animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-3xl font-bold text-foreground mb-2">Bilannonsgenerator</h1>
          <p className="text-muted-foreground">Skapa professionella annonser på sekunder</p>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
          {/* Left Column - Settings */}
          <div className="space-y-6">
            <div 
              className="rounded-xl border border-level-border bg-level-card p-6 transition-all duration-300 hover:shadow-[0_0_30px_0_hsl(var(--level-card-glow)/0.15)] animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Settings className="h-5 w-5 text-primary" />
                Inställningar
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">OpenAI API-nyckel *</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Sparas lokalt i din webbläsare
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prompt">System Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Instruktioner till AI..."
                    value={systemPrompt}
                    onChange={(e) => handlePromptChange(e.target.value)}
                    className="min-h-[200px] text-sm transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Car Info Form */}
          <div className="space-y-6">
            {/* Car Information Card */}
            <div 
              className="rounded-xl border border-level-border bg-level-card p-6 transition-all duration-300 hover:shadow-[0_0_30px_0_hsl(var(--level-card-glow)/0.15)] animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Car className="h-5 w-5 text-primary" />
                Bilinformation
              </h2>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="brand">Märke *</Label>
                  <Input
                    id="brand"
                    placeholder="t.ex. Volvo"
                    value={formData.brand}
                    onChange={(e) => handleInputChange("brand", e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="model">Modell *</Label>
                  <Input
                    id="model"
                    placeholder="t.ex. XC60"
                    value={formData.model}
                    onChange={(e) => handleInputChange("model", e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="year">Årsmodell</Label>
                  <Input
                    id="year"
                    placeholder="t.ex. 2020"
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mileage">Miltal</Label>
                  <Input
                    id="mileage"
                    placeholder="t.ex. 45000"
                    value={formData.mileage}
                    onChange={(e) => handleInputChange("mileage", e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="price">Pris (kr)</Label>
                  <Input
                    id="price"
                    placeholder="t.ex. 299000"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* Equipment & Condition Card */}
            <div 
              className="rounded-xl border border-level-border bg-level-card p-6 transition-all duration-300 hover:shadow-[0_0_30px_0_hsl(var(--level-card-glow)/0.15)] animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <h2 className="mb-4 text-lg font-semibold text-foreground">Utrustning & Skick</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="equipment">Utrustning</Label>
                  <Textarea
                    id="equipment"
                    placeholder="Lista utrustning, t.ex. Navigation, Läderklädsel, Dragkrok..."
                    value={formData.equipment}
                    onChange={(e) => handleInputChange("equipment", e.target.value)}
                    className="min-h-[100px] transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="condition">Skick</Label>
                  <Textarea
                    id="condition"
                    placeholder="Beskriv bilens skick..."
                    value={formData.condition}
                    onChange={(e) => handleInputChange("condition", e.target.value)}
                    className="min-h-[100px] transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
              <Button
                onClick={handleGenerate}
                className="group relative h-14 px-10 text-lg font-semibold transition-all duration-300 hover:shadow-[0_0_30px_0_hsl(var(--primary)/0.4)]"
              >
                <Car className="mr-2 h-5 w-5" />
                Generera Annons
                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-primary-foreground transition-all duration-300 group-hover:w-3/4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnonsGenerator;
