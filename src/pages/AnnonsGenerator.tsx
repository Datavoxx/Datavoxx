import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Sparkles } from "lucide-react";
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

const EQUIPMENT_OPTIONS = [
  "Dragkrok",
  "Navigation",
  "Läder",
  "Vinterhjul",
  "Backkamera",
  "PDC",
  "Adaptiv farthållare",
  "Panoramatak",
  "El-stolar",
  "Apple CarPlay",
  "Android Auto",
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

  const handleEquipmentChipClick = (item: string) => {
    const currentEquipment = formData.equipment;
    if (currentEquipment.includes(item)) {
      // Remove item
      const newEquipment = currentEquipment
        .split(", ")
        .filter((e) => e !== item)
        .join(", ");
      handleInputChange("equipment", newEquipment);
    } else {
      // Add item
      const newEquipment = currentEquipment
        ? `${currentEquipment}, ${item}`
        : item;
      handleInputChange("equipment", newEquipment);
    }
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

        {/* Single column layout with increased spacing */}
        <div className="space-y-8">
          {/* Car Information Card */}
          <div 
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
              <Car className="h-6 w-6 text-foreground" />
              Bilinformation
            </h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brand" className="text-sm text-muted-foreground">Märke *</Label>
                <Input
                  id="brand"
                  placeholder="t.ex. Volvo"
                  value={formData.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-foreground/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="model" className="text-sm text-muted-foreground">Modell *</Label>
                <Input
                  id="model"
                  placeholder="t.ex. XC60"
                  value={formData.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-foreground/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year" className="text-sm text-muted-foreground">Årsmodell</Label>
                <Input
                  id="year"
                  placeholder="t.ex. 2020"
                  value={formData.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-foreground/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mileage" className="text-sm text-muted-foreground">Miltal</Label>
                <Input
                  id="mileage"
                  placeholder="t.ex. 45000"
                  value={formData.mileage}
                  onChange={(e) => handleInputChange("mileage", e.target.value)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-foreground/50"
                />
              </div>
              
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="price" className="text-sm text-muted-foreground">Pris (kr)</Label>
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
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">Utrustning & Skick</h2>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="equipment" className="text-sm text-muted-foreground">Utrustning</Label>
                
                {/* Equipment Chips */}
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT_OPTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleEquipmentChipClick(item)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 ${
                        formData.equipment.includes(item)
                          ? "border-foreground bg-foreground text-background"
                          : "border-gray-300 bg-white hover:border-gray-400 text-foreground"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                
                <Textarea
                  id="equipment"
                  placeholder="Lägg till ytterligare utrustning..."
                  value={formData.equipment}
                  onChange={(e) => handleInputChange("equipment", e.target.value)}
                  className="min-h-[80px] transition-all duration-200 focus:ring-2 focus:ring-foreground/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="condition" className="text-sm text-muted-foreground">Skick</Label>
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
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <h2 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">Välj tonläge</h2>
            
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {TONE_OPTIONS.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => handleToneChange(tone.id)}
                  className={`group flex flex-col items-center rounded-xl p-4 transition-all duration-200 ${
                    selectedTone === tone.id
                      ? "border-2 border-foreground bg-white shadow-md"
                      : "border border-gray-200 hover:border-gray-400 bg-white"
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
              className="w-full max-w-[380px] py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:shadow-lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Generera Annons
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnonsGenerator;
