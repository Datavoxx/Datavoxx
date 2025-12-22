import { useState, useRef, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send, Loader2, Car, History, Check, Search, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import DecorativeBackground from "@/components/DecorativeBackground";
import AppHeader from "@/components/AppHeader";
import HistoryPanel from "@/components/HistoryPanel";
import FeedbackWidget from "@/components/FeedbackWidget";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ResearchFormData {
  registrationNumber: string;
  car: string;
  year: string;
  researchQuestion: string;
}

const STEPS = [
  { num: 1, label: "Bilinfo", icon: Car },
  { num: 2, label: "Fråga", icon: Search },
];

const BilResearch = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [carLookupSuccess, setCarLookupSuccess] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<ResearchFormData>({
    registrationNumber: "",
    car: "",
    year: "",
    researchQuestion: "",
  });

  const handleInputChange = (field: keyof ResearchFormData, value: string) => {
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
        
        // Auto-slide till nästa steg efter kort fördröjning
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
    if (showResult) {
      setShowResult(false);
      setMessages([]);
    } else if (currentStep === 1) {
      navigate("/");
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSearch = async () => {
    if (!formData.researchQuestion.trim()) {
      toast({
        title: "Skriv en fråga",
        description: "Beskriv vad du vill veta om bilen",
        variant: "destructive",
      });
      return;
    }

    // Build the full question with car context
    const carInfo = formData.year 
      ? `${formData.car} ${formData.year}` 
      : formData.car;
    const fullQuestion = `Jag har en ${carInfo}. ${formData.researchQuestion}`;

    const userMessage: Message = { role: "user", content: fullQuestion };
    setMessages([userMessage]);
    setShowResult(true);
    setIsLoading(true);

    try {
      const requestBody: { messages: Message[]; companyName?: string; userName?: string } = {
        messages: [userMessage],
      };
      
      if (user && profile) {
        if (profile.company_name) requestBody.companyName = profile.company_name;
        if (profile.display_name) requestBody.userName = profile.display_name;
      }

      const { data, error } = await supabase.functions.invoke("car-research", {
        body: requestBody,
      });

      if (error) throw error;

      if (!data?.response) {
        throw new Error("Inget svar mottaget från AI");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
      };
      setMessages([userMessage, assistantMessage]);

      // Save conversation to database only if user is logged in
      if (user && data.response) {
        try {
          await supabase.from('research_conversations').insert({
            user_id: user.id,
            session_id: user.id,
            user_name: profile?.display_name || user.email || 'Anonym',
            question: fullQuestion,
            answer: data.response
          });
        } catch (saveError) {
          console.error("Error saving conversation:", saveError);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Tyvärr uppstod ett fel. Försök igen.",
      };
      setMessages([userMessage, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (item: { id: string; title: string; preview: string }) => {
    setMessages([
      { role: "user", content: item.title },
      { role: "assistant", content: item.preview.replace("...", "") }
    ]);
    setShowResult(true);
    setIsHistoryOpen(false);
  };

  const handleNewSearch = () => {
    setShowResult(false);
    setMessages([]);
    setCurrentStep(1);
    setFormData({
      registrationNumber: "",
      car: "",
      year: "",
      researchQuestion: "",
    });
    setCarLookupSuccess(false);
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

  // Result view (chat)
  if (showResult) {
    return (
      <div className="relative flex min-h-screen flex-col bg-slate-50">
        <DecorativeBackground />
        <FeedbackWidget />
        <AppHeader showBackButton={true} />

        <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
          {/* Back button and new search */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Tillbaka
            </Button>
            <Button variant="outline" onClick={handleNewSearch} className="gap-2">
              <Search className="h-4 w-4" />
              Ny sökning
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-white text-foreground border border-gray-100"
                  }`}
                >
                  <p className="text-sm font-medium mb-1 opacity-70">
                    {message.role === "user" ? "Du" : "🤖 Bil Research Expert"}
                  </p>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100">
                  <p className="text-sm font-medium mb-1 opacity-70">
                    🤖 Bil Research Expert
                  </p>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-gray-500">Söker information...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>
      </div>
    );
  }

  // Form view
  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50">
      <DecorativeBackground />
      <FeedbackWidget />
      <AppHeader showBackButton={true} />

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
          type="research"
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelect={handleHistorySelect}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start pt-8 px-4">
        {/* Title */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Car className="h-8 w-8 text-foreground" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Bilresearch
            </h1>
          </div>
          <p className="text-muted-foreground">
            Få djupgående information om valfri bil
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator />

        {/* Form Card */}
        <div className="w-full max-w-xl mt-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-lg p-6">
            
            {/* Step 1: Bilinfo */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold text-foreground">Vilken bil vill du researcha?</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Hämta info med regnummer eller ange manuellt
                  </p>
                </div>

                {/* Registration Number Lookup */}
                <div className="space-y-2">
                  <Label htmlFor="regNumber" className="text-sm font-medium">
                    Registreringsnummer
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="regNumber"
                      value={formData.registrationNumber}
                      onChange={(e) => handleRegNumberChange(e.target.value)}
                      placeholder="ABC 123"
                      className={`flex-1 text-lg font-mono tracking-wider uppercase transition-all ${
                        carLookupSuccess 
                          ? "border-green-500 bg-green-50" 
                          : ""
                      }`}
                      maxLength={7}
                    />
                    <Button
                      onClick={handleCarLookup}
                      disabled={isLookingUp || formData.registrationNumber.replace(/\s/g, '').length !== 6}
                      className="gap-2 min-w-[120px]"
                    >
                      {isLookingUp ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Hämtar...
                        </>
                      ) : carLookupSuccess ? (
                        <>
                          <Check className="h-4 w-4" />
                          Hämtad!
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4" />
                          Hämta
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      eller ange manuellt
                    </span>
                  </div>
                </div>

                {/* Manual Input */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="car" className="text-sm font-medium">
                      Bil (märke & modell) *
                    </Label>
                    <Input
                      id="car"
                      value={formData.car}
                      onChange={(e) => handleInputChange("car", e.target.value)}
                      placeholder="T.ex. Volvo XC60"
                      className={carLookupSuccess ? "border-green-500 bg-green-50" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-sm font-medium">
                      Årsmodell
                    </Label>
                    <Input
                      id="year"
                      value={formData.year}
                      onChange={(e) => handleInputChange("year", e.target.value)}
                      placeholder="T.ex. 2020"
                      className={carLookupSuccess ? "border-green-500 bg-green-50" : ""}
                    />
                  </div>
                </div>

                {/* Next Button */}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBack} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Tillbaka
                  </Button>
                  <Button onClick={handleNext} className="gap-2">
                    Nästa
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Research Question */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-semibold text-foreground">
                    Vad vill du veta om {formData.car}{formData.year ? ` ${formData.year}` : ""}?
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Beskriv vad du är nyfiken på
                  </p>
                </div>

                {/* Research Question */}
                <div className="space-y-2">
                  <Label htmlFor="question" className="text-sm font-medium">
                    Din fråga
                  </Label>
                  <Textarea
                    id="question"
                    value={formData.researchQuestion}
                    onChange={(e) => handleInputChange("researchQuestion", e.target.value)}
                    placeholder="T.ex. Vilka är de vanligaste problemen? Vad bör jag som säljare veta? Är det en bra bil?"
                    className="min-h-[120px] resize-none"
                  />
                </div>

                {/* Quick suggestions */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Snabbval:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Vanliga problem och svagheter?",
                      "Bra säljargument?",
                      "Vad bör jag veta som säljare?",
                      "Hur är driftkostnaderna?",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleInputChange("researchQuestion", suggestion)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          formData.researchQuestion === suggestion
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/50 border-border hover:bg-muted"
                        }`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleBack} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Tillbaka
                  </Button>
                  <Button 
                    onClick={handleSearch} 
                    disabled={isLoading || !formData.researchQuestion.trim()}
                    className="gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Söker...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Sök
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BilResearch;
