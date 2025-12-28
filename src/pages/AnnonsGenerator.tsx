import { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Check, Sparkles, History, CreditCard, Focus, Loader2, Search, LogIn } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
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
  car: string;
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

<specification_note>
Inkludera en rad i annonsen som säger: "För specifikation och utrustning, scrolla ner."
</specification_note>

<content_order>
Strukturera innehållet i denna ordning (men skriv som flödande text, INTE som numrerade sektioner):

FÖRST (hook): Kampanj och ränta - börja starkt med finansieringserbjudandet
SEDAN: Försäkringserbjudande och trygghetspaket
SEDAN: Kort om bilen - märke, modell, årsmodell, miltal, pris
SEDAN: "För specifikation och utrustning, scrolla ner."
SIST: Garanti, kontaktinfo och välkomnande avslutning
</content_order>

<available_variables>
Använd dessa variabler när de har värden:
- Bilen (alltid)
- Årsmodell, Miltal, Pris (om angivna)
- Utrustning, Skick (om angivna)
- Ränta, Kampanj, Försäkringserbjudande, Finansieringsinfo, Garanti (om angivna)
- Företagsnamn (om inloggad)
</available_variables>

<example_output>
Nu har vi Decemberkampanj med endast 3,95% i ränta! Gäller utvalda bilar som köps med trygghetspaketet.

I samarbete med Länsförsäkringar erbjuder vi en månads helförsäkring helt utan kostnad! Missa inte vårt förmånliga Trygghetspaket med lägre ränta via DNB Finans och Santander.

Nu i lager har vi denna fina Volvo XC60 2020 med endast 45 000 mil. Pris: 299 000 kr.

För specifikation och utrustning, scrolla ner.

2 års MRF-garanti ingår! Vi erbjuder hemleverans i hela Sverige. Betalning via Swish, kort eller banköverföring.

Varmt välkomna till oss!
</example_output>`,
  },
  {
    id: "equipment",
    label: "Bolag & Service",
    icon: "🚚",
    description: "Lyft fram ert företags service och trygghet",
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

<important_service_highlight>
Inkludera ALLTID dessa två viktiga budskap framträdande i annonsen:
1. "Vi erbjuder transport och hemleverans över hela landet!"
2. "VI SVARAR INOM EN TIMMA!" (skriv detta med versaler/stora bokstäver)
</important_service_highlight>

<specification_note>
Inkludera en rad i annonsen som säger: "För specifikation och utrustning, scrolla ner."
</specification_note>

<content_order>
Strukturera innehållet i denna ordning (men skriv som flödande text, INTE som numrerade sektioner):

FÖRST (hook): Företagets service och tillgänglighet - transport och snabb respons
SEDAN: Kort om bilen - märke, modell, årsmodell, miltal, pris
SEDAN: "För specifikation och utrustning, scrolla ner."
SEDAN: Finansiering, kampanj och försäkringserbjudande
SIST: Garanti, kontaktinfo och välkomnande avslutning
</content_order>

<available_variables>
Använd dessa variabler när de har värden:
- Bilen (alltid)
- Årsmodell, Miltal, Pris (om angivna)
- Utrustning, Skick (om angivna)
- Ränta, Kampanj, Försäkringserbjudande, Finansieringsinfo, Garanti (om angivna)
- Företagsnamn (om inloggad)
</available_variables>

<example_output>
VI SVARAR INOM EN TIMMA! Har du frågor om bilen? Kontakta oss direkt så återkommer vi snabbt.

Vi erbjuder transport och hemleverans över hela landet! Oavsett var du befinner dig i Sverige ordnar vi leverans till dig.

Nu i lager har vi denna fina Volvo XC60 2020 med endast 45 000 mil. Pris: 299 000 kr.

För specifikation och utrustning, scrolla ner.

Just nu har vi Decemberkampanj med endast 3,95% i ränta! I samarbete med Länsförsäkringar erbjuder vi en månads helförsäkring gratis.

2 års MRF-garanti ingår! Betalning via Swish, kort eller banköverföring.

Varmt välkomna till oss!
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

<specification_note>
Inkludera en rad i annonsen som säger: "För specifikation och utrustning, scrolla ner."
</specification_note>

<content_order>
Strukturera innehållet i denna ordning (men skriv som flödande text, INTE som numrerade sektioner):

FÖRST: Balanserad presentation av bilen - märke, modell, årsmodell, miltal, pris
SEDAN: "För specifikation och utrustning, scrolla ner."
SEDAN: Finansiering, kampanj och försäkringserbjudande
SIST: Garanti, kontaktinfo och välkomnande avslutning
</content_order>

<available_variables>
Använd dessa variabler när de har värden:
- Bilen (alltid)
- Årsmodell, Miltal, Pris (om angivna)
- Utrustning, Skick (om angivna)
- Ränta, Kampanj, Försäkringserbjudande, Finansieringsinfo, Garanti (om angivna)
- Företagsnamn (om inloggad)
</available_variables>

<example_output>
Nu i lager: Volvo XC60 2020 — en välskött och populär SUV med endast 45 000 mil på mätaren. Pris: 299 000 kr.

För specifikation och utrustning, scrolla ner.

Just nu har vi Decemberkampanj med endast 3,95% i ränta! I samarbete med Länsförsäkringar erbjuder vi en månads helförsäkring gratis. Förmånlig finansiering via DNB Finans och Santander.

2 års MRF-garanti ingår! Vi erbjuder hemleverans i hela Sverige. Betalning via Swish, kort eller banköverföring.

Varmt välkomna!
</example_output>`,
  },
];

// Color coding for each focus type - using theme gradient colors
const FOCUS_COLORS = {
  financing: {
    bg: "bg-primary",
    bgLight: "bg-primary/10",
    border: "border-primary",
    borderLight: "border-primary/30",
  },
  equipment: {
    bg: "bg-[hsl(280,75%,55%)]",
    bgLight: "bg-[hsl(280,75%,55%)]/10",
    border: "border-[hsl(280,75%,55%)]",
    borderLight: "border-[hsl(280,75%,55%)]/30",
  },
  mixed: {
    bg: "bg-[hsl(320,70%,60%)]",
    bgLight: "bg-[hsl(320,70%,60%)]/10",
    border: "border-[hsl(320,70%,60%)]",
    borderLight: "border-[hsl(320,70%,60%)]/30",
  },
};

const STEPS = [
  { num: 1, label: "Bilinfo", icon: Car },
  { num: 2, label: "Finansiering", icon: CreditCard },
  { num: 3, label: "Fokus", icon: Focus },
];

const AnnonsGenerator = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { isGuest } = useUserRole();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [selectedFocus, setSelectedFocus] = useState<FocusType>("mixed");
  const [systemPrompt, setSystemPrompt] = useState(FOCUS_OPTIONS[2].prompt);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [carLookupSuccess, setCarLookupSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    registrationNumber: "",
    car: "",
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
          car: data.carData.description || prev.car,
          year: data.carData.year || prev.year,
        }));
        setCarLookupSuccess(true);
        toast({
          title: "Bilinfo hämtad!",
          description: `${data.carData.description} ${data.carData.year}`,
        });
        
        // Auto-slide till Finansiering efter kort fördröjning
        setTimeout(() => {
          setCurrentStep(2);
        }, 800);
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
    if (currentStep === 1 && !formData.car.trim()) {
      toast({
        title: "Fyll i obligatoriska fält",
        description: "Hämta bilinfo med registreringsnummer eller ange bilen manuellt",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigate("/start");
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
    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2">
      {STEPS.map((step, index) => (
        <Fragment key={step.num}>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                step.num < currentStep
                  ? "bg-foreground text-background"
                  : step.num === currentStep
                  ? "bg-foreground text-background"
                  : "border-2 border-muted-foreground/30 text-muted-foreground"
              }`}
            >
              {step.num < currentStep ? (
                <Check className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <step.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </div>
            <span
              className={`text-[10px] sm:text-xs mt-1 sm:mt-1.5 font-medium transition-colors duration-300 ${
                step.num <= currentStep ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div
              className={`hidden sm:block w-6 sm:w-8 h-0.5 mb-6 transition-all duration-300 ${
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
      equipment: { id: "equipment", label: "Bolag & Service", color: FOCUS_COLORS.equipment.bg },
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
      
      <div className="mx-auto max-w-3xl relative z-10 px-4 py-5 sm:p-6">

        {/* Title */}
        <div className="mb-4 sm:mb-6 text-center animate-fade-in">
          <h1 className="text-xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Annonstextgenerator</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">Skapa professionella annonstextar på sekunder</p>
          
          {/* Step Indicator */}
          <StepIndicator />
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Steg {currentStep} av {totalSteps}
          </p>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Car Information */}
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                <h2 className="mb-4 sm:mb-6 flex items-center gap-2 text-lg sm:text-2xl font-semibold tracking-tight text-foreground">
                  <Car className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
                  Bilinformation
                </h2>
                
                {/* Swedish License Plate Input */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="regNumber" className="text-sm text-muted-foreground">
                      Registreringsnummer
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Swedish license plate styled input */}
                      <div className="flex-1 flex rounded-lg overflow-hidden border-2 border-foreground/20 bg-white shadow-sm hover:border-foreground/40 transition-colors focus-within:border-foreground focus-within:ring-2 focus-within:ring-foreground/20">
                        {/* EU Blue stripe with Swedish flag */}
                        <div className="w-8 sm:w-10 bg-[#003399] flex flex-col items-center justify-center gap-0.5 py-2">
                          {/* EU stars circle */}
                          <div className="text-[6px] sm:text-[8px] text-yellow-400 leading-none">★★★</div>
                          <div className="text-[6px] sm:text-[8px] text-yellow-400 leading-none">★ ★</div>
                          <div className="text-[6px] sm:text-[8px] text-yellow-400 leading-none">★★★</div>
                          {/* S letter */}
                          <span className="text-white font-bold text-xs sm:text-sm mt-0.5">S</span>
                        </div>
                        {/* Registration number input */}
                        <input
                          id="regNumber"
                          type="text"
                          placeholder="ABC 123"
                          value={formData.registrationNumber}
                          onChange={(e) => handleRegNumberChange(e.target.value)}
                          className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-xl sm:text-2xl font-bold tracking-widest text-center bg-white text-foreground placeholder:text-muted-foreground/40 focus:outline-none uppercase"
                          style={{ fontFamily: "'DIN Alternate', 'Arial Black', sans-serif" }}
                          maxLength={7}
                        />
                      </div>
                      {/* Lookup button */}
                      <Button
                        type="button"
                        onClick={handleCarLookup}
                        disabled={isLookingUp || formData.registrationNumber.replace(/\s/g, '').length !== 6}
                        className="w-full sm:w-auto px-6 py-3 sm:h-auto"
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
                  {carLookupSuccess && formData.car && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="font-medium">
                        {formData.car} {formData.year && `(${formData.year})`}
                      </span>
                    </div>
                  )}

                  {/* Manual input fallback - collapsed by default, shown if lookup failed or user wants to edit */}
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-3">
                      Eller ange manuellt:
                    </p>
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="car" className="text-sm text-muted-foreground">
                          Bilen <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="car"
                          placeholder="t.ex. Volvo XC60"
                          value={formData.car}
                          onChange={(e) => handleInputChange("car", e.target.value)}
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
              <div className="flex justify-end mt-4 sm:mt-6">
                <Button
                  onClick={handleNext}
                  className="w-full sm:max-w-[380px] py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-xl transition-all duration-300 hover:shadow-lg"
                >
                  Nästa
                  <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Financing & Insurance */}
          {currentStep === 2 && (
            <div className="animate-fade-in">
              <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                <h2 className="mb-1 sm:mb-2 flex items-center gap-2 text-lg sm:text-2xl font-semibold tracking-tight text-foreground">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
                  Finansiering & Försäkring
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                  Lägg till information om ränta, kampanjer och försäkringserbjudanden
                </p>
                
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
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
                      className="min-h-[70px] sm:min-h-[80px] transition-all duration-200 focus:ring-2 focus:ring-foreground/50"
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
              <div className="flex justify-between mt-4 sm:mt-6 gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="py-3 sm:py-6 px-4 sm:px-8 text-sm sm:text-lg font-semibold rounded-xl transition-all duration-300"
                >
                  <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Tillbaka</span>
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 sm:max-w-[380px] py-3 sm:py-6 text-sm sm:text-lg font-semibold rounded-xl transition-all duration-300 hover:shadow-lg"
                >
                  Nästa
                  <ArrowLeft className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 rotate-180" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Focus Selection with Visual Preview */}
          {currentStep === 3 && (
            <div className="animate-fade-in">
              <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-sm transition-all duration-300 hover:shadow-md">
                <h2 className="mb-1 sm:mb-2 flex items-center gap-2 text-lg sm:text-2xl font-semibold tracking-tight text-foreground">
                  <Focus className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
                  Vad vill du lyfta upp mest?
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                  Välj vad som ska synas först och mest i din annons
                </p>
                
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                  {/* Focus Options */}
                  <div className="space-y-2 sm:space-y-3">
                    {FOCUS_OPTIONS.map((focus) => {
                      const colors = FOCUS_COLORS[focus.id];
                      const isSelected = selectedFocus === focus.id;
                      
                      return (
                        <button
                          key={focus.id}
                          onClick={() => handleFocusChange(focus.id)}
                          className={`relative w-full group flex items-center gap-3 sm:gap-4 rounded-xl p-3 sm:p-4 text-left transition-all duration-300 border-l-4 ${colors.border} ${
                            isSelected
                              ? `border-2 ${colors.border} bg-card shadow-md`
                              : "border border-border hover:border-foreground/50 bg-card"
                          }`}
                        >
                          {/* Populärt val badge for equipment */}
                          {focus.id === "equipment" && (
                            <span className="absolute -top-2 right-2 sm:right-3 bg-primary text-primary-foreground text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-0.5 rounded-full shadow-sm">
                              ⭐ Populärt
                            </span>
                          )}
                          <span className="text-2xl sm:text-3xl">{focus.icon}</span>
                          <div className="flex-1 min-w-0">
                            <span className="block text-sm sm:text-base font-medium text-foreground">
                              {focus.label}
                            </span>
                            <span className="block text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2">
                              {focus.description}
                            </span>
                          </div>
                          {isSelected && (
                            <Check className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 ${colors.border.replace('border-', 'text-')}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Visual Preview - hidden on mobile */}
                  <div className="hidden sm:block lg:sticky lg:top-4">
                    <FocusPreview />
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between mt-4 sm:mt-6 gap-3 sm:gap-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="py-3 sm:py-6 px-4 sm:px-8 text-sm sm:text-lg font-semibold rounded-xl transition-all duration-300"
                >
                  <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Tillbaka</span>
                </Button>
                <Button
                  onClick={handleGenerate}
                  className="flex-1 sm:max-w-[380px] py-3 sm:py-6 text-sm sm:text-lg font-semibold rounded-xl transition-all duration-300 hover:shadow-lg"
                >
                  <Sparkles className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Generera Annons
                </Button>
              </div>
            </div>
          )}

          {/* Guest CTA */}
          {isGuest && (
            <div className="mt-6 text-center p-4 bg-muted/50 rounded-xl border border-border/50 animate-fade-in">
              <p className="text-sm text-muted-foreground mb-2">
                🎉 Gäst-läge — logga in för historik och fler funktioner
              </p>
              <Button 
                variant="link" 
                onClick={() => navigate("/auth")}
                className="gap-1"
              >
                <LogIn className="h-4 w-4" />
                Logga in eller skapa konto
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnonsGenerator;
