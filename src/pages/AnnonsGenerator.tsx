import { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Check, Settings, Sparkles, Wrench } from "lucide-react";
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

const STEPS = [
  { num: 1, label: "Bilinfo", icon: Car },
  { num: 2, label: "Utrustning", icon: Wrench },
  { num: 3, label: "Tonläge", icon: Settings },
];

const AnnonsGenerator = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
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
      const newEquipment = currentEquipment
        .split(", ")
        .filter((e) => e !== item)
        .join(", ");
      handleInputChange("equipment", newEquipment);
    } else {
      const newEquipment = currentEquipment
        ? `${currentEquipment}, ${item}`
        : item;
      handleInputChange("equipment", newEquipment);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && (!formData.brand.trim() || !formData.model.trim())) {
      toast({
        title: "Fyll i obligatoriska fält",
        description: "Märke och modell måste anges för att fortsätta",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigate("/");
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleGenerate = () => {
    navigate("/annons-resultat", {
      state: {
        formData,
        systemPrompt,
        selectedTone,
      },
    });
  };

  // Step Indicator Component
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-2">
      {STEPS.map((step, index) => (
        <Fragment key={step.num}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                step.num < currentStep
                  ? "bg-foreground text-background"
                  : step.num === currentStep
                  ? "bg-foreground text-background"
                  : "border-2 border-muted-foreground/30 text-muted-foreground"
              }`}
            >
              {step.num < currentStep ? (
                <Check className="h-5 w-5" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </div>
            <span
              className={`text-xs mt-1.5 font-medium transition-colors duration-300 ${
                step.num <= currentStep ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div
              className={`w-12 h-0.5 mb-6 transition-all duration-300 ${
                step.num < currentStep ? "bg-foreground" : "bg-muted-foreground/30"
              }`}
            />
          )}
        </Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="hover:bg-secondary"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={bilgenLogo} alt="BILGEN" className="h-10" />
          </div>
          <NameInput />
        </div>

        {/* Title */}
        <div className="mb-6 text-center animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">Bilannonsgenerator</h1>
          <p className="text-muted-foreground mb-6">Skapa professionella annonser på sekunder</p>
          
          {/* Step Indicator */}
          <StepIndicator />
          <p className="text-sm text-muted-foreground mt-2">
            Steg {currentStep} av {totalSteps}
          </p>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Car Information */}
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                <h2 className="mb-6 flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
                  <Car className="h-6 w-6 text-foreground" />
                  Bilinformation
                </h2>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="brand" className="text-sm text-muted-foreground">
                      Märke <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="brand"
                      placeholder="t.ex. Volvo"
                      value={formData.brand}
                      onChange={(e) => handleInputChange("brand", e.target.value)}
                      className="transition-all duration-200 focus:ring-2 focus:ring-foreground/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="model" className="text-sm text-muted-foreground">
                      Modell <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="model"
                      placeholder="t.ex. XC60"
                      value={formData.model}
                      onChange={(e) => handleInputChange("model", e.target.value)}
                      className="transition-all duration-200 focus:ring-2 focus:ring-foreground/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-sm text-muted-foreground">
                      Årsmodell <span className="text-muted-foreground/60">(valfritt)</span>
                    </Label>
                    <Input
                      id="year"
                      placeholder="t.ex. 2020"
                      value={formData.year}
                      onChange={(e) => handleInputChange("year", e.target.value)}
                      className="transition-all duration-200 focus:ring-2 focus:ring-foreground/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mileage" className="text-sm text-muted-foreground">
                      Miltal <span className="text-muted-foreground/60">(valfritt)</span>
                    </Label>
                    <Input
                      id="mileage"
                      placeholder="t.ex. 45000"
                      value={formData.mileage}
                      onChange={(e) => handleInputChange("mileage", e.target.value)}
                      className="transition-all duration-200 focus:ring-2 focus:ring-foreground/50"
                    />
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="price" className="text-sm text-muted-foreground">
                      Pris (kr) <span className="text-muted-foreground/60">(valfritt)</span>
                    </Label>
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

              {/* Navigation */}
              <div className="flex justify-end mt-6">
                <Button
                  onClick={handleNext}
                  className="w-full max-w-[380px] py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:shadow-lg"
                >
                  Nästa
                  <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Equipment & Condition */}
          {currentStep === 2 && (
            <div className="animate-fade-in">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                <h2 className="mb-2 flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
                  <Wrench className="h-6 w-6 text-foreground" />
                  Utrustning & Skick
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Du kan hoppa över detta om du vill – vi fyller ändå i en bra grundtext
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="equipment" className="text-sm text-muted-foreground">
                      Utrustning <span className="text-muted-foreground/60">(valfritt)</span>
                    </Label>
                    
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
                              : "border-border bg-background hover:border-foreground/50 text-foreground"
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
                    <Label htmlFor="condition" className="text-sm text-muted-foreground">
                      Skick <span className="text-muted-foreground/60">(valfritt)</span>
                    </Label>
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

              {/* Navigation */}
              <div className="flex justify-between mt-6 gap-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="py-6 px-8 text-lg font-semibold rounded-xl transition-all duration-300"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Tillbaka
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 max-w-[380px] py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:shadow-lg"
                >
                  Nästa
                  <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Tone Selection */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                <h2 className="mb-2 flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
                  <Settings className="h-6 w-6 text-foreground" />
                  Välj tonläge
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Välj den stil som passar din annons bäst
                </p>
                
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {TONE_OPTIONS.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => handleToneChange(tone.id)}
                      className={`group flex flex-col items-center rounded-xl p-4 transition-all duration-200 ${
                        selectedTone === tone.id
                          ? "border-2 border-foreground bg-card shadow-md"
                          : "border border-border hover:border-foreground/50 bg-card"
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

              {/* Navigation */}
              <div className="flex justify-between mt-6 gap-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="py-6 px-8 text-lg font-semibold rounded-xl transition-all duration-300"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Tillbaka
                </Button>
                <Button
                  onClick={handleGenerate}
                  className="flex-1 max-w-[380px] py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:shadow-lg"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generera Annons
                </Button>
              </div>
              
              <p className="text-center text-sm text-muted-foreground mt-4">
                Du kan redigera texten efteråt
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnonsGenerator;
