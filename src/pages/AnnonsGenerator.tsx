import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import bilgenLogo from "@/assets/bilgen-logo.png";
import NameInput from "@/components/NameInput";

interface FormData {
  brand: string;
  model: string;
  year: string;
  mileage: string;
  price: string;
  equipment: string;
  condition: string;
}

type ToneType = "professional" | "casual" | "luxury" | "urgent";

interface ToneOption {
  id: ToneType;
  label: string;
  icon: string;
  description: string;
  prompt: string;
}

const TONE_OPTIONS: ToneOption[] = [
  {
    id: "professional",
    label: "Professionell",
    icon: "💼",
    description: "Formell och seriös ton",
    prompt: `Du är en expert på att skriva professionella bilannonser på svenska.
Skapa en formell och seriös annons baserat på bilinformationen.
Annonsen ska vara:
- Tydlig och välstrukturerad
- Professionell och trovärdig
- Faktabaserad med tekniska detaljer
- Inkludera en professionell uppmaning att kontakta säljaren`,
  },
  {
    id: "casual",
    label: "Avslappnad",
    icon: "😊",
    description: "Vänlig och lättsam ton",
    prompt: `Du är en vänlig bilsäljare som skriver avslappnade annonser på svenska.
Skapa en lättsam och personlig annons baserat på bilinformationen.
Annonsen ska vara:
- Vänlig och inbjudande
- Personlig med emojis
- Enkel att läsa
- Avsluta med en trevlig uppmaning att höra av sig`,
  },
  {
    id: "luxury",
    label: "Lyxig",
    icon: "✨",
    description: "Exklusiv och premium ton",
    prompt: `Du är en expert på lyxbilar och skriver exklusiva annonser på svenska.
Skapa en premium och sofistikerad annons baserat på bilinformationen.
Annonsen ska vara:
- Elegant och exklusiv i tonen
- Betona kvalitet och komfort
- Använda raffinerat språk
- Skapa en känsla av lyx och prestige`,
  },
  {
    id: "urgent",
    label: "Brådskande",
    icon: "🔥",
    description: "Snabb försäljning",
    prompt: `Du är en säljare som behöver sälja bilar snabbt och skriver på svenska.
Skapa en brådskande och säljande annons baserat på bilinformationen.
Annonsen ska vara:
- Energisk med känsla av brådska
- Betona bra pris och värde
- Använda action-ord och emojis
- Skapa FOMO (fear of missing out)
- Uppmana till snabb kontakt`,
  },
];

const AnnonsGenerator = () => {
  const navigate = useNavigate();
  const [selectedTone, setSelectedTone] = useState<ToneType>("professional");
  const [systemPrompt, setSystemPrompt] = useState(TONE_OPTIONS[0].prompt);
  const [formData, setFormData] = useState<FormData>({
    brand: "",
    model: "",
    year: "",
    mileage: "",
    price: "",
    equipment: "",
    condition: "",
  });

  // Load saved tone from localStorage
  useEffect(() => {
    const savedTone = localStorage.getItem("ad_tone") as ToneType | null;
    
    if (savedTone && TONE_OPTIONS.find(t => t.id === savedTone)) {
      setSelectedTone(savedTone);
      const toneOption = TONE_OPTIONS.find(t => t.id === savedTone);
      if (toneOption) {
        setSystemPrompt(toneOption.prompt);
      }
    }
  }, []);

  // Handle tone change
  const handleToneChange = (tone: ToneType) => {
    setSelectedTone(tone);
    localStorage.setItem("ad_tone", tone);
    const toneOption = TONE_OPTIONS.find(t => t.id === tone);
    if (toneOption) {
      setSystemPrompt(toneOption.prompt);
    }
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

    // Navigate to results page with form data
    navigate("/annons-resultat", {
      state: {
        formData,
        systemPrompt,
        selectedTone,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between animate-fade-in-up">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="hover:bg-secondary"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={bilgenLogo} alt="BILGEN" className="h-10" />
          </div>
          <NameInput />
        </div>

        {/* Title */}
        <div className="mb-10 text-center animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-3xl font-bold text-foreground mb-2">Bilannonsgenerator</h1>
          <p className="text-muted-foreground">Skapa professionella annonser på sekunder</p>
        </div>

        {/* Single column layout */}
        <div className="space-y-6">
          {/* Car Information Card */}
          <div 
            className="rounded-xl border border-level-border bg-level-card p-6 transition-all duration-300 hover:shadow-[0_0_30px_0_hsl(var(--level-card-glow)/0.15)] animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Car className="h-5 w-5 text-foreground" />
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
                  className="transition-all duration-200 focus:ring-2 focus:ring-foreground/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="model">Modell *</Label>
                <Input
                  id="model"
                  placeholder="t.ex. XC60"
                  value={formData.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-foreground/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Årsmodell</Label>
                <Input
                  id="year"
                  placeholder="t.ex. 2020"
                  value={formData.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-foreground/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mileage">Miltal</Label>
                <Input
                  id="mileage"
                  placeholder="t.ex. 45000"
                  value={formData.mileage}
                  onChange={(e) => handleInputChange("mileage", e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-foreground/50"
                />
              </div>
              
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="price">Pris (kr)</Label>
                <Input
                  id="price"
                  placeholder="t.ex. 299000"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-foreground/50"
                />
              </div>
            </div>
          </div>

          {/* Equipment & Condition Card */}
          <div 
            className="rounded-xl border border-level-border bg-level-card p-6 transition-all duration-300 hover:shadow-[0_0_30px_0_hsl(var(--level-card-glow)/0.15)] animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
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
                  className="min-h-[100px] transition-all duration-200 focus:ring-2 focus:ring-foreground/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="condition">Skick</Label>
                <Textarea
                  id="condition"
                  placeholder="Beskriv bilens skick..."
                  value={formData.condition}
                  onChange={(e) => handleInputChange("condition", e.target.value)}
                  className="min-h-[100px] transition-all duration-200 focus:ring-2 focus:ring-foreground/50"
                />
              </div>
            </div>
          </div>

          {/* Tone Selection */}
          <div 
            className="rounded-xl border border-level-border bg-level-card p-6 transition-all duration-300 hover:shadow-[0_0_30px_0_hsl(var(--level-card-glow)/0.15)] animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <h2 className="mb-4 text-lg font-semibold text-foreground">Välj tonläge</h2>
            
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {TONE_OPTIONS.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => handleToneChange(tone.id)}
                  className={`group flex flex-col items-center rounded-lg border-2 p-4 transition-all duration-200 ${
                    selectedTone === tone.id
                      ? "border-foreground bg-foreground/10 shadow-[0_0_20px_0_hsl(var(--foreground)/0.2)]"
                      : "border-border hover:border-foreground/50 hover:bg-secondary"
                  }`}
                >
                  <span className="text-2xl mb-2">{tone.icon}</span>
                  <span className="text-sm font-medium text-foreground">
                    {tone.label}
                  </span>
                  <span className="text-xs text-muted-foreground text-center mt-1">
                    {tone.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <Button
              onClick={handleGenerate}
              className="group relative h-14 px-10 text-lg font-semibold transition-all duration-300 hover:shadow-[0_0_30px_0_hsl(var(--foreground)/0.4)]"
            >
              <Car className="mr-2 h-5 w-5" />
              Generera Annons
              <div className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-primary-foreground transition-all duration-300 group-hover:w-3/4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnonsGenerator;