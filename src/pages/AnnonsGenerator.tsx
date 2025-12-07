import { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Check, Sparkles, Wrench, History, CreditCard, Focus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import DecorativeBackground from "@/components/DecorativeBackground";
import AppHeader from "@/components/AppHeader";
import HistoryPanel from "@/components/HistoryPanel";

interface FormData {
  brand: string;
  model: string;
  year: string;
  mileage: string;
  price: string;
  equipment: string;
  condition: string;
  // Nya finansieringsfält
  interestRate: string;
  campaign: string;
  insuranceOffer: string;
  financing: string;
  warranty: string;
}

type FocusType = "financing" | "equipment" | "mixed";

interface FocusOption {
  id: FocusType;
  label: string;
  icon: string;
  description: string;
  prompt: string;
}

const FOCUS_OPTIONS: FocusOption[] = [
  {
    id: "financing",
    label: "Finansiering & Försäkring",
    icon: "🏦",
    description: "Ränta, trygghetspaket och försäkring lyfts upp först",
    prompt: `Du är en expert på att skriva professionella bilannonser på svenska.

VIKTIG STRUKTUR - Följ denna ordning EXAKT:
1. FÖRST: Kampanj/ränta-hook (om det finns kampanj eller ränta)
2. Företagsinfo och omdömen
3. Kort bilintro (märke, modell, miltal)
4. Utrustning (lista)
5. Service/besiktning (om angivet)
6. Kontaktinfo/hemsida
7. Försäkringserbjudande (om angivet)
8. Trygghetspaket och garantier
9. Betalnings- och leveransinfo
10. Avslut

Fokus: Lyft fram FINANSIERING, RÄNTA och FÖRSÄKRING mest i annonsen.
Dessa ska vara mest framträdande och placeras tidigt i texten.
Bilens utrustning och skick är sekundärt och kommer senare.`,
  },
  {
    id: "equipment",
    label: "Skick & Utrustning",
    icon: "🔧",
    description: "Bilens egenskaper och kvalitet lyfts upp först",
    prompt: `Du är en expert på att skriva professionella bilannonser på svenska.

VIKTIG STRUKTUR - Följ denna ordning EXAKT:
1. FÖRST: Bilens utrustning och skick som hook
2. Detaljerad beskrivning av utrustning och features
3. Skick och servicehistorik
4. Företagsinfo och omdömen
5. Kontaktinfo/hemsida
6. Finansiering och ränta (om angivet)
7. Försäkringserbjudande (om angivet)
8. Garantier
9. Avslut

Fokus: Lyft fram BILENS SKICK, UTRUSTNING och KVALITET mest i annonsen.
Dessa ska vara mest framträdande och placeras tidigt i texten.
Finansiering och försäkring nämns senare i texten.`,
  },
  {
    id: "mixed",
    label: "Balanserad mix",
    icon: "⚖️",
    description: "Jämn fördelning mellan alla delar",
    prompt: `Du är en expert på att skriva professionella bilannonser på svenska.

VIKTIG STRUKTUR - Följ denna ordning:
1. Kort kampanj-hook om det finns
2. Bilinfo och utrustning
3. Skick och service
4. Finansiering och ränta
5. Försäkring och garantier
6. Företagsinfo
7. Kontakt och avslut

Fokus: Ge en BALANSERAD mix av all information.
Både bilens egenskaper och finansieringsalternativ ska presenteras jämnt.
Ingen del ska dominera över de andra.`,
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
  { num: 3, label: "Finansiering", icon: CreditCard },
  { num: 4, label: "Fokus", icon: Focus },
];

const AnnonsGenerator = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [selectedFocus, setSelectedFocus] = useState<FocusType>("mixed");
  const [systemPrompt, setSystemPrompt] = useState(FOCUS_OPTIONS[2].prompt);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    brand: "",
    model: "",
    year: "",
    mileage: "",
    price: "",
    equipment: "",
    condition: "",
    interestRate: "",
    campaign: "",
    insuranceOffer: "",
    financing: "",
    warranty: "",
  });

  // Load saved focus from localStorage
  useEffect(() => {
    const savedFocus = localStorage.getItem("ad_focus") as FocusType | null;
    
    if (savedFocus && FOCUS_OPTIONS.find(f => f.id === savedFocus)) {
      setSelectedFocus(savedFocus);
      const focusOption = FOCUS_OPTIONS.find(f => f.id === savedFocus);
      if (focusOption) {
        setSystemPrompt(focusOption.prompt);
      }
    }
  }, []);

  // Handle focus change
  const handleFocusChange = (focus: FocusType) => {
    setSelectedFocus(focus);
    localStorage.setItem("ad_focus", focus);
    const focusOption = FOCUS_OPTIONS.find(f => f.id === focus);
    if (focusOption) {
      setSystemPrompt(focusOption.prompt);
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
        selectedFocus,
      },
    });
  };

  const handleHistorySelect = (item: { id: string; title: string; preview: string }) => {
    toast({
      title: item.title,
      description: "Tidigare annons visas",
    });
    setIsHistoryOpen(false);
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
              className={`w-8 h-0.5 mb-6 transition-all duration-300 ${
                step.num < currentStep ? "bg-foreground" : "bg-muted-foreground/30"
              }`}
            />
          )}
        </Fragment>
      ))}
    </div>
  );

  // Visual Preview Component for Focus Step
  const FocusPreview = () => {
    const sections = [
      { id: "financing", label: "Finansiering & Försäkring", short: "💰 Ränta, kampanj, försäkring" },
      { id: "car", label: "Bilinfo", short: "🚗 Märke, modell, miltal" },
      { id: "equipment", label: "Utrustning & Skick", short: "🔧 Utrustning, skick, service" },
      { id: "other", label: "Övrigt", short: "📋 Kontakt, garanti, avslut" },
    ];

    // Determine order based on selected focus
    const getOrderedSections = () => {
      if (selectedFocus === "financing") {
        return [sections[0], sections[1], sections[2], sections[3]];
      } else if (selectedFocus === "equipment") {
        return [sections[2], sections[1], sections[0], sections[3]];
      } else {
        // mixed
        return [sections[1], sections[2], sections[0], sections[3]];
      }
    };

    const orderedSections = getOrderedSections();
    const highlightId = selectedFocus === "financing" ? "financing" : selectedFocus === "equipment" ? "equipment" : null;

    return (
      <div className="rounded-xl border border-border bg-card/50 p-4">
        <p className="text-xs text-muted-foreground mb-3 text-center font-medium">
          Förhandsgranskning av annonsstruktur
        </p>
        <div className="space-y-2">
          {orderedSections.map((section, index) => {
            const isHighlighted = section.id === highlightId;
            const isFirst = index === 0;
            
            return (
              <div
                key={section.id}
                className={`rounded-lg px-3 py-2.5 transition-all duration-500 ease-out ${
                  isHighlighted
                    ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                    : isFirst && selectedFocus === "mixed"
                    ? "bg-primary/80 text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground"
                }`}
                style={{
                  transform: `translateY(${index * 0}px)`,
                  transitionDelay: `${index * 50}ms`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isHighlighted || (isFirst && selectedFocus === "mixed") ? "" : "opacity-70"}`}>
                    {section.short}
                  </span>
                  {(isHighlighted || (isFirst && selectedFocus === "mixed")) && (
                    <span className="text-xs bg-background/20 px-2 py-0.5 rounded-full">
                      Lyfts upp
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-background">
      <DecorativeBackground />
      {/* Header */}
      <AppHeader showBackButton={true} onBackClick={handleBack} />

      {/* History Button - only for logged in users */}
      {user && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsHistoryOpen(true)}
          className="fixed right-4 top-20 z-40 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <History className="h-5 w-5" />
        </Button>
      )}

      {/* History Panel - only for logged in users */}
      {user && (
        <HistoryPanel
          type="ad"
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelect={handleHistorySelect}
        />
      )}
      
      <div className="mx-auto max-w-3xl relative z-10 p-6">

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

          {/* Step 3: Financing & Insurance */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                <h2 className="mb-2 flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
                  <CreditCard className="h-6 w-6 text-foreground" />
                  Finansiering & Försäkring
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Lägg till information om ränta, kampanjer och försäkringserbjudanden
                </p>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="interestRate" className="text-sm text-muted-foreground">
                      Ränta <span className="text-muted-foreground/60">(valfritt)</span>
                    </Label>
                    <Input
                      id="interestRate"
                      placeholder="t.ex. 3,95%"
                      value={formData.interestRate}
                      onChange={(e) => handleInputChange("interestRate", e.target.value)}
                      className="transition-all duration-200 focus:ring-2 focus:ring-foreground/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="campaign" className="text-sm text-muted-foreground">
                      Kampanj <span className="text-muted-foreground/60">(valfritt)</span>
                    </Label>
                    <Input
                      id="campaign"
                      placeholder="t.ex. Decemberkampanj"
                      value={formData.campaign}
                      onChange={(e) => handleInputChange("campaign", e.target.value)}
                      className="transition-all duration-200 focus:ring-2 focus:ring-foreground/50"
                    />
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="insuranceOffer" className="text-sm text-muted-foreground">
                      Försäkringserbjudande <span className="text-muted-foreground/60">(valfritt)</span>
                    </Label>
                    <Input
                      id="insuranceOffer"
                      placeholder="t.ex. 1 månads helförsäkring gratis"
                      value={formData.insuranceOffer}
                      onChange={(e) => handleInputChange("insuranceOffer", e.target.value)}
                      className="transition-all duration-200 focus:ring-2 focus:ring-foreground/50"
                    />
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="financing" className="text-sm text-muted-foreground">
                      Finansieringsinfo <span className="text-muted-foreground/60">(valfritt)</span>
                    </Label>
                    <Textarea
                      id="financing"
                      placeholder="t.ex. Trygghetspaket, DNB Finans, Santander..."
                      value={formData.financing}
                      onChange={(e) => handleInputChange("financing", e.target.value)}
                      className="min-h-[80px] transition-all duration-200 focus:ring-2 focus:ring-foreground/50"
                    />
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="warranty" className="text-sm text-muted-foreground">
                      Garanti <span className="text-muted-foreground/60">(valfritt)</span>
                    </Label>
                    <Input
                      id="warranty"
                      placeholder="t.ex. MRF-garanti, upp till 36 månader"
                      value={formData.warranty}
                      onChange={(e) => handleInputChange("warranty", e.target.value)}
                      className="transition-all duration-200 focus:ring-2 focus:ring-foreground/50"
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

          {/* Step 4: Focus Selection with Visual Preview */}
          {currentStep === 4 && (
            <div className="animate-fade-in">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                <h2 className="mb-2 flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
                  <Focus className="h-6 w-6 text-foreground" />
                  Vad vill du lyfta upp mest?
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Välj vad som ska synas först och mest i din annons
                </p>
                
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Focus Options */}
                  <div className="space-y-3">
                    {FOCUS_OPTIONS.map((focus) => (
                      <button
                        key={focus.id}
                        onClick={() => handleFocusChange(focus.id)}
                        className={`w-full group flex items-center gap-4 rounded-xl p-4 text-left transition-all duration-200 ${
                          selectedFocus === focus.id
                            ? "border-2 border-foreground bg-card shadow-md"
                            : "border border-border hover:border-foreground/50 bg-card"
                        }`}
                      >
                        <span className="text-3xl">{focus.icon}</span>
                        <div className="flex-1">
                          <span className="block text-base font-medium text-foreground">
                            {focus.label}
                          </span>
                          <span className="block text-sm text-muted-foreground mt-0.5">
                            {focus.description}
                          </span>
                        </div>
                        {selectedFocus === focus.id && (
                          <Check className="h-5 w-5 text-foreground" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Visual Preview */}
                  <div className="lg:sticky lg:top-4">
                    <FocusPreview />
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
                  onClick={handleGenerate}
                  className="flex-1 max-w-[380px] py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:shadow-lg"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generera Annons
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnonsGenerator;
