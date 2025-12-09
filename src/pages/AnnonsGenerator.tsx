import { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Check, Sparkles, Wrench, History, CreditCard, Focus, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import DecorativeBackground from "@/components/DecorativeBackground";
import AppHeader from "@/components/AppHeader";
import HistoryPanel from "@/components/HistoryPanel";
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  registrationNumber: string;
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
    prompt: `<role>
Du är en svensk bilannonsexpert som skriver professionella, säljande bilannonser för Blocket och Bytbil.
</role>

<critical_rules>
- Generera ALLTID en komplett bilannons direkt utan att ställa frågor
- Skriv ENDAST annonsen - ingen meta-text, förklaringar eller kommentarer
- Skriv i FLÖDANDE PROSA - ALDRIG numrerade listor, rubriker eller sektionsmarkeringar
- Annonsen ska vara en sammanhängande, säljande text som flyter naturligt
- Om viss information saknas, skriv annonsen ändå med det som finns tillgängligt
- Annonsen ska kunna kopieras direkt till Blocket/Bytbil
- Ställ ALDRIG frågor eller be om bekräftelse
</critical_rules>

<content_order>
Strukturera innehållet i denna ordning (men skriv som flödande text, INTE som numrerade sektioner):

FÖRST (hook): Kampanj och ränta - börja starkt med finansieringserbjudandet
SEDAN: Försäkringserbjudande och trygghetspaket
SEDAN: Kort om bilen - märke, modell, årsmodell, miltal, pris
SEDAN: Utrustning och skick - lista features naturligt i texten
SIST: Garanti, kontaktinfo och välkomnande avslutning
</content_order>

<available_variables>
Använd dessa variabler när de har värden:
- Märke, Modell (alltid)
- Årsmodell, Miltal, Pris (om angivna)
- Utrustning, Skick (om angivna)
- Ränta, Kampanj, Försäkringserbjudande, Finansieringsinfo, Garanti (om angivna)
- Företagsnamn (om inloggad)
</available_variables>

<example_output>
Nu har vi Decemberkampanj med endast 3,95% i ränta! Gäller utvalda bilar som köps med trygghetspaketet.

I samarbete med Länsförsäkringar erbjuder vi en månads helförsäkring helt utan kostnad! Missa inte vårt förmånliga Trygghetspaket med lägre ränta via DNB Finans och Santander.

Nu i lager har vi denna fina Volvo XC60 2020 med endast 45 000 mil. Pris: 299 000 kr.

Bilen är utrustad med bland annat navigation, läderklädsel, backkamera, parkeringssensorer, adaptiv farthållare och Apple CarPlay. Bilen är i mycket fint skick med fullständig servicehistorik. Senaste service utförd januari 2024, nästa besiktning senast juni 2025. Låg skatt på bara 1 200 kr/år.

2 års MRF-garanti ingår! Vi erbjuder hemleverans i hela Sverige. Betalning via Swish, kort eller banköverföring.

Varmt välkomna till oss!
</example_output>`,
  },
  {
    id: "equipment",
    label: "Skick & Utrustning",
    icon: "🔧",
    description: "Bilens egenskaper och kvalitet lyfts upp först",
    prompt: `<role>
Du är en svensk bilannonsexpert som skriver professionella, säljande bilannonser för Blocket och Bytbil.
</role>

<critical_rules>
- Generera ALLTID en komplett bilannons direkt utan att ställa frågor
- Skriv ENDAST annonsen - ingen meta-text, förklaringar eller kommentarer
- Skriv i FLÖDANDE PROSA - ALDRIG numrerade listor, rubriker eller sektionsmarkeringar
- Annonsen ska vara en sammanhängande, säljande text som flyter naturligt
- Om viss information saknas, skriv annonsen ändå med det som finns tillgängligt
- Annonsen ska kunna kopieras direkt till Blocket/Bytbil
- Ställ ALDRIG frågor eller be om bekräftelse
</critical_rules>

<content_order>
Strukturera innehållet i denna ordning (men skriv som flödande text, INTE som numrerade sektioner):

FÖRST (hook): Bilens utrustning och skick - börja starkt med kvaliteten
SEDAN: Detaljerad lista av utrustning, skick och servicehistorik
SEDAN: Kort om bilen - märke, modell, årsmodell, miltal, pris
SEDAN: Finansiering, kampanj och försäkringserbjudande
SIST: Garanti, kontaktinfo och välkomnande avslutning
</content_order>

<available_variables>
Använd dessa variabler när de har värden:
- Märke, Modell (alltid)
- Årsmodell, Miltal, Pris (om angivna)
- Utrustning, Skick (om angivna)
- Ränta, Kampanj, Försäkringserbjudande, Finansieringsinfo, Garanti (om angivna)
- Företagsnamn (om inloggad)
</available_variables>

<example_output>
Fullutrustad Volvo XC60 i toppskick! Denna välskötta bil kommer med en imponerande utrustningslista: navigation, läderklädsel, backkamera, parkeringssensorer, adaptiv farthållare, Apple CarPlay och panoramatak.

Bilen är i utmärkt skick med fullständig servicehistorik hos auktoriserad verkstad. Senaste service utförd januari 2024, nästa besiktning senast juni 2025. Låg skatt på endast 1 200 kr/år!

Volvo XC60 2020 med endast 45 000 mil. Pris: 299 000 kr.

Just nu har vi Decemberkampanj med endast 3,95% i ränta! I samarbete med Länsförsäkringar erbjuder vi en månads helförsäkring gratis. Förmånlig finansiering via DNB Finans och Santander.

2 års MRF-garanti ingår! Vi erbjuder hemleverans i hela Sverige. Betalning via Swish, kort eller banköverföring.

Varmt välkomna!
</example_output>`,
  },
  {
    id: "mixed",
    label: "Balanserad mix",
    icon: "⚖️",
    description: "Jämn fördelning mellan alla delar",
    prompt: `<role>
Du är en svensk bilannonsexpert som skriver professionella, säljande bilannonser för Blocket och Bytbil.
</role>

<critical_rules>
- Generera ALLTID en komplett bilannons direkt utan att ställa frågor
- Skriv ENDAST annonsen - ingen meta-text, förklaringar eller kommentarer
- Skriv i FLÖDANDE PROSA - ALDRIG numrerade listor, rubriker eller sektionsmarkeringar
- Annonsen ska vara en sammanhängande, säljande text som flyter naturligt
- Om viss information saknas, skriv annonsen ändå med det som finns tillgängligt
- Annonsen ska kunna kopieras direkt till Blocket/Bytbil
- Ställ ALDRIG frågor eller be om bekräftelse
</critical_rules>

<content_order>
Strukturera innehållet i denna ordning (men skriv som flödande text, INTE som numrerade sektioner):

FÖRST: Balanserad presentation av bilen - märke, modell, årsmodell, miltal, pris
SEDAN: Utrustning och skick - lista features naturligt
SEDAN: Finansiering, kampanj och försäkringserbjudande
SIST: Garanti, kontaktinfo och välkomnande avslutning
</content_order>

<available_variables>
Använd dessa variabler när de har värden:
- Märke, Modell (alltid)
- Årsmodell, Miltal, Pris (om angivna)
- Utrustning, Skick (om angivna)
- Ränta, Kampanj, Försäkringserbjudande, Finansieringsinfo, Garanti (om angivna)
- Företagsnamn (om inloggad)
</available_variables>

<example_output>
Nu i lager: Volvo XC60 2020 — en välskött och populär SUV med endast 45 000 mil på mätaren. Pris: 299 000 kr.

Bilen är utrustad med bland annat navigation, läderklädsel, backkamera, parkeringssensorer, adaptiv farthållare och Apple CarPlay. Bilen är i mycket fint skick med fullständig servicehistorik. Senaste service utförd januari 2024, nästa besiktning senast juni 2025.

Just nu har vi Decemberkampanj med endast 3,95% i ränta! I samarbete med Länsförsäkringar erbjuder vi en månads helförsäkring gratis. Förmånlig finansiering via DNB Finans och Santander.

2 års MRF-garanti ingår! Vi erbjuder hemleverans i hela Sverige. Betalning via Swish, kort eller banköverföring.

Varmt välkomna!
</example_output>`,
  },
];

// Color coding for each focus type
const FOCUS_COLORS = {
  financing: {
    bg: "bg-red-500",
    bgLight: "bg-red-100",
    border: "border-red-500",
    borderLight: "border-red-200",
  },
  equipment: {
    bg: "bg-green-500",
    bgLight: "bg-green-100",
    border: "border-green-500",
    borderLight: "border-green-200",
  },
  mixed: {
    bg: "bg-yellow-500",
    bgLight: "bg-yellow-100",
    border: "border-yellow-500",
    borderLight: "border-yellow-200",
  },
};

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
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [carLookupSuccess, setCarLookupSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    registrationNumber: "",
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

  // Format registration number as user types (ABC 123 or ABC 12D)
  const formatRegNumber = (value: string): string => {
    const cleaned = value.replace(/\s/g, '').toUpperCase();
    if (cleaned.length <= 3) {
      return cleaned;
    }
    return cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 6);
  };

  const handleRegNumberChange = (value: string) => {
    const formatted = formatRegNumber(value);
    if (formatted.replace(/\s/g, '').length <= 6) {
      handleInputChange("registrationNumber", formatted);
      setCarLookupSuccess(false);
    }
  };

  const handleCarLookup = async () => {
    const regNumber = formData.registrationNumber.replace(/\s/g, '');
    
    if (regNumber.length !== 6) {
      toast({
        title: "Ogiltigt registreringsnummer",
        description: "Ange ett komplett svenskt registreringsnummer (6 tecken)",
        variant: "destructive",
      });
      return;
    }

    setIsLookingUp(true);
    setCarLookupSuccess(false);

    try {
      const { data, error } = await supabase.functions.invoke('car-lookup', {
        body: { registrationNumber: regNumber },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        toast({
          title: "Kunde inte hitta bilen",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (data.carData) {
        setFormData(prev => ({
          ...prev,
          brand: data.carData.brand || prev.brand,
          model: data.carData.model || prev.model,
          year: data.carData.year || prev.year,
        }));
        setCarLookupSuccess(true);
        toast({
          title: "Bilinfo hämtad!",
          description: `${data.carData.brand} ${data.carData.model} ${data.carData.year}`,
        });
      }
    } catch (error) {
      console.error("Car lookup error:", error);
      toast({
        title: "Fel vid hämtning",
        description: "Kunde inte hämta bilinfo. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && (!formData.brand.trim() || !formData.model.trim())) {
      toast({
        title: "Fyll i obligatoriska fält",
        description: "Hämta bilinfo med registreringsnummer eller ange märke och modell manuellt",
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

  // Visual Preview Component for Focus Step - All sections keep their colors, smooth reorder animation
  const FocusPreview = () => {
    // Define all sections with their permanent colors
    const allSections = {
      financing: { id: "financing", label: "Finansiering", color: FOCUS_COLORS.financing.bg },
      car: { id: "car", label: "Bilinfo", color: "bg-gray-400" },
      equipment: { id: "equipment", label: "Utrustning", color: FOCUS_COLORS.equipment.bg },
      contact: { id: "contact", label: "Kontakt", color: "bg-gray-400" },
      mixed: { id: "mixed", label: "Balanserad", color: FOCUS_COLORS.mixed.bg },
    };

    // Determine order based on selected focus - focused item moves to top
    const getOrderedSections = () => {
      if (selectedFocus === "financing") {
        return [allSections.financing, allSections.car, allSections.equipment, allSections.contact];
      } else if (selectedFocus === "equipment") {
        return [allSections.equipment, allSections.car, allSections.financing, allSections.contact];
      } else {
        // mixed - balanced, show mix block first
        return [allSections.mixed, allSections.financing, allSections.equipment, allSections.contact];
      }
    };

    const orderedSections = getOrderedSections();

    return (
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <p className="text-xs text-muted-foreground mb-4 text-center font-medium">
          Förhandsgranskning av annonsstruktur
        </p>
        <div className="relative flex flex-col gap-2.5">
          {orderedSections.map((section, index) => {
            const isSelected = 
              (selectedFocus === "financing" && section.id === "financing") ||
              (selectedFocus === "equipment" && section.id === "equipment") ||
              (selectedFocus === "mixed" && section.id === "mixed");
            
            return (
              <div
                key={section.id}
                className={`rounded-lg transition-all duration-500 ease-out ${section.color} ${
                  isSelected 
                    ? "h-14 scale-[1.02] ring-2 ring-foreground/10 animate-subtle-pulse" 
                    : "h-9 opacity-70"
                }`}
                style={{
                  transitionDelay: `${index * 75}ms`,
                  color: isSelected 
                    ? selectedFocus === "financing" 
                      ? "hsl(0 84% 60%)" 
                      : selectedFocus === "equipment" 
                        ? "hsl(142 76% 36%)" 
                        : "hsl(45 93% 47%)"
                    : undefined,
                }}
              >
                <span className={`flex items-center justify-center h-full text-xs font-medium ${
                  section.id === "car" || section.id === "contact" 
                    ? "text-gray-600" 
                    : "text-white"
                }`}>
                  {section.label}
                </span>
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
                
                {/* Swedish License Plate Input */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="regNumber" className="text-sm text-muted-foreground">
                      Registreringsnummer
                    </Label>
                    <div className="flex gap-3 items-stretch">
                      {/* Swedish license plate styled input */}
                      <div className="flex-1 flex rounded-lg overflow-hidden border-2 border-foreground/20 bg-white shadow-sm hover:border-foreground/40 transition-colors focus-within:border-foreground focus-within:ring-2 focus-within:ring-foreground/20">
                        {/* EU Blue stripe with Swedish flag */}
                        <div className="w-10 bg-[#003399] flex flex-col items-center justify-center gap-0.5 py-2">
                          {/* EU stars circle */}
                          <div className="text-[8px] text-yellow-400 leading-none">★★★</div>
                          <div className="text-[8px] text-yellow-400 leading-none">★ ★</div>
                          <div className="text-[8px] text-yellow-400 leading-none">★★★</div>
                          {/* S letter */}
                          <span className="text-white font-bold text-sm mt-0.5">S</span>
                        </div>
                        {/* Registration number input */}
                        <input
                          id="regNumber"
                          type="text"
                          placeholder="ABC 123"
                          value={formData.registrationNumber}
                          onChange={(e) => handleRegNumberChange(e.target.value)}
                          className="flex-1 px-4 py-3 text-2xl font-bold tracking-widest text-center bg-white text-foreground placeholder:text-muted-foreground/40 focus:outline-none uppercase"
                          style={{ fontFamily: "'DIN Alternate', 'Arial Black', sans-serif" }}
                          maxLength={7}
                        />
                      </div>
                      {/* Lookup button */}
                      <Button
                        type="button"
                        onClick={handleCarLookup}
                        disabled={isLookingUp || formData.registrationNumber.replace(/\s/g, '').length !== 6}
                        className="px-6 h-auto"
                      >
                        {isLookingUp ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <Search className="h-5 w-5 mr-2" />
                            Hämta bilinfo
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Car info display after successful lookup */}
                  {carLookupSuccess && formData.brand && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="font-medium">
                        {formData.brand} {formData.model} {formData.year && `(${formData.year})`}
                      </span>
                    </div>
                  )}

                  {/* Manual input fallback - collapsed by default, shown if lookup failed or user wants to edit */}
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-3">
                      Eller ange manuellt:
                    </p>
                    <div className="grid gap-4 sm:grid-cols-3">
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
                          Årsmodell
                        </Label>
                        <Input
                          id="year"
                          placeholder="t.ex. 2020"
                          value={formData.year}
                          onChange={(e) => handleInputChange("year", e.target.value)}
                          className="transition-all duration-200 focus:ring-2 focus:ring-foreground/50"
                        />
                      </div>
                    </div>
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
                    {FOCUS_OPTIONS.map((focus) => {
                      const colors = FOCUS_COLORS[focus.id];
                      const isSelected = selectedFocus === focus.id;
                      
                      return (
                        <button
                          key={focus.id}
                          onClick={() => handleFocusChange(focus.id)}
                          className={`relative w-full group flex items-center gap-4 rounded-xl p-4 text-left transition-all duration-300 border-l-4 ${colors.border} ${
                            isSelected
                              ? `border-2 ${colors.border} bg-card shadow-md`
                              : "border border-border hover:border-foreground/50 bg-card"
                          }`}
                        >
                          {/* Populärt val badge for financing */}
                          {focus.id === "financing" && (
                            <span className="absolute -top-2 right-3 bg-red-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm">
                              ⭐ Populärt val
                            </span>
                          )}
                          <span className="text-3xl">{focus.icon}</span>
                          <div className="flex-1">
                            <span className="block text-base font-medium text-foreground">
                              {focus.label}
                            </span>
                            <span className="block text-sm text-muted-foreground mt-0.5">
                              {focus.description}
                            </span>
                          </div>
                          {isSelected && (
                            <Check className={`h-5 w-5 ${colors.border.replace('border-', 'text-')}`} />
                          )}
                        </button>
                      );
                    })}
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
