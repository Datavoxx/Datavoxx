import { useState } from "react";
import { Mail, Send, ChevronRight, ChevronLeft, Sparkles, RotateCcw, Copy, Check, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Interactive Step-by-Step Email Demo
 * Users click through: Välj mejl → Direktiv → Resultat
 */
const EmailDemo = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEmail, setSelectedEmail] = useState<number | null>(null);
  const [selectedDirective, setSelectedDirective] = useState<'polite' | 'booking' | 'price'>('polite');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const navigate = useNavigate();

  // Track demo actions
  const trackDemoAction = async (action: string, stepFrom: number) => {
    try {
      const sessionId = localStorage.getItem('bilgen_session_id') || 'unknown';
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('demo_tests').insert({
        session_id: sessionId,
        action: `email_${action}`,
        step_from: stepFrom,
        user_id: user?.id || null
      });
    } catch (error) {
      console.error("Error tracking demo action:", error);
    }
  };

  const demoEmails = [
    { 
      id: 1,
      from: "Anders Svensson", 
      subject: "Fråga om BMW X3", 
      preview: "Hej! Jag såg er annons för BMW X3:an. Finns bilen kvar och går det att pruta något på priset?" 
    },
    { 
      id: 2,
      from: "Maria Lindberg", 
      subject: "Provkörning?", 
      preview: "Hej, jag är intresserad av Volvo V60:n. Kan jag boka en provkörning denna vecka?" 
    },
    { 
      id: 3,
      from: "Företag AB", 
      subject: "Inköpsförfrågan", 
      preview: "Vi söker 3 st Volvo V90 till vår fordonsflotta. Vad kan ni erbjuda för företagspriser?" 
    }
  ];

  const directiveOptions = [
    { id: 'polite' as const, label: "Svara artigt", description: "Vänligt och professionellt svar" },
    { id: 'booking' as const, label: "Boka visning", description: "Föreslå tid för provkörning" },
    { id: 'price' as const, label: "Ge prisinformation", description: "Inkludera prisdetaljer och erbjudanden" },
  ];

  const responseTexts = {
    polite: {
      1: `Hej Anders!

Tack för ditt intresse för BMW X3:an! Ja, bilen finns fortfarande tillgänglig hos oss.

Gällande priset har vi redan prissatt den konkurrenskraftigt, men vi kan absolut diskutera villkoren vid en visning. Välkommen in för att titta närmare på bilen!

Med vänliga hälsningar`,
      2: `Hej Maria!

Tack för ditt intresse för Volvo V60:n! Vi ser fram emot att visa dig bilen.

Hör av dig så bokar vi in en tid som passar dig.

Med vänliga hälsningar`,
      3: `Hej!

Tack för er förfrågan om Volvo V90. Vi har goda möjligheter att hjälpa er med fordonsflottan.

Jag återkommer med ett detaljerat förslag inom kort.

Med vänliga hälsningar`
    },
    booking: {
      1: `Hej Anders!

Självklart! BMW X3:an finns kvar och jag föreslår att du kommer förbi för en provkörning. 

Passar det på torsdag kl 14:00 eller fredag kl 10:00? Då kan vi även diskutera pris och finansiering på plats.

Med vänliga hälsningar`,
      2: `Hej Maria!

Absolut, vi bokar gärna in en provkörning av Volvo V60:n!

Jag har lediga tider på onsdag kl 15:00, torsdag kl 11:00 eller fredag kl 14:00. Vilken tid passar dig bäst?

Med vänliga hälsningar`,
      3: `Hej!

Tack för intresset! För en genomgång av våra Volvo V90 föreslår jag ett möte på plats.

Passar det med ett möte nästa vecka? Vi kan då gå igenom era behov och visa bilarna.

Med vänliga hälsningar`
    },
    price: {
      1: `Hej Anders!

BMW X3:an är prissatt till 389 000 kr. Just nu erbjuder vi dessutom förmånlig finansiering med 3,95% ränta.

Vid affär kan vi diskutera eventuella tillbehör eller servicepaket. Välkommen in för provkörning!

Med vänliga hälsningar`,
      2: `Hej Maria!

Volvo V60:n kostar 285 000 kr. Vi har just nu januarikampanj med ränta från 3,95% och inkluderad vinterförvaring första året.

Välkommen på provkörning så berättar jag mer!

Med vänliga hälsningar`,
      3: `Hej!

För 3 st Volvo V90 kan vi erbjuda ett attraktivt företagspaket:
• Rabatterat styckpris vid köp av 3+
• Förmånlig företagsfinansiering
• Serviceavtal ingår

Jag skickar ett detaljerat förslag via mejl.

Med vänliga hälsningar`
    }
  };

  const generatedResponse = selectedEmail !== null 
    ? responseTexts[selectedDirective][selectedEmail as 1 | 2 | 3]
    : '';

  const handleNext = async () => {
    if (currentStep === 1 && selectedEmail !== null) {
      await trackDemoAction('next', currentStep);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      await trackDemoAction('generate', currentStep);
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
        setShowResult(true);
        setCurrentStep(3);
      }, 1200);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setShowResult(false);
    }
  };

  const handleReset = async () => {
    await trackDemoAction('reset', 3);
    setCurrentStep(1);
    setShowResult(false);
    setSelectedEmail(null);
    setSelectedDirective('polite');
  };

  const handleCopy = async () => {
    await trackDemoAction('copy', 3);
    navigator.clipboard.writeText(generatedResponse);
    toast.success("Kopierat till urklipp!");
  };

  const handleCreateReal = async () => {
    await trackDemoAction('create_real', 3);
    navigate('/email');
  };

  const totalSteps = 3;
  const progressPercentage = showResult ? 100 : ((currentStep - 1) / totalSteps) * 100 + (100 / totalSteps / 2);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {showResult ? "Klart!" : `Steg ${currentStep} av ${totalSteps}`}
          </span>
        </div>
        
        <div className="relative h-1.5 bg-muted/50 rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="flex justify-between mt-4">
          {[
            { num: 1, label: 'Välj mejl' },
            { num: 2, label: 'Direktiv' },
            { num: 3, label: 'Resultat' }
          ].map((step) => (
            <div 
              key={step.num}
              className="flex flex-col items-center gap-1"
            >
              <div className={`text-3xl font-bold transition-all duration-300 ${
                step.num < currentStep || showResult
                  ? 'text-primary'
                  : step.num === currentStep
                    ? 'text-foreground'
                    : 'text-muted-foreground/30'
              }`}>
                {step.num}
              </div>
              <span className={`text-xs transition-colors duration-300 ${
                step.num < currentStep || showResult
                  ? 'text-primary'
                  : step.num === currentStep
                    ? 'text-foreground'
                    : 'text-muted-foreground/50'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content card */}
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent rounded-3xl blur-2xl" />
        
        <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="p-6 md:p-8 min-h-[320px] flex flex-col">
            
            {/* Step 1: Select email */}
            {currentStep === 1 && !showResult && (
              <div className="flex-1 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Välj ett mejl att svara på</h3>
                    <p className="text-sm text-muted-foreground">Klicka på ett mejl i listan</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {demoEmails.map((email, index) => (
                    <button
                      key={email.id}
                      onClick={() => setSelectedEmail(email.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedEmail === email.id
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-border/50 bg-muted/20 hover:border-border hover:bg-muted/40'
                      }`}
                      style={{
                        animation: 'fade-in 0.3s ease-out forwards',
                        animationDelay: `${index * 0.1}s`,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          selectedEmail === email.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {email.from.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-medium text-sm ${selectedEmail === email.id ? 'text-foreground' : 'text-foreground/80'}`}>
                              {email.from}
                            </span>
                          </div>
                          <p className={`text-sm font-medium ${selectedEmail === email.id ? 'text-primary' : 'text-foreground/70'}`}>
                            {email.subject}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {email.preview}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Directive */}
            {currentStep === 2 && !showResult && !isGenerating && (
              <div className="flex-1 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Edit3 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Välj typ av svar</h3>
                    <p className="text-sm text-muted-foreground">Hur vill du svara på mejlet?</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4">
                  {directiveOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedDirective(option.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        selectedDirective === option.id
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-border/50 bg-muted/20 hover:border-border hover:bg-muted/40'
                      }`}
                    >
                      <p className={`font-medium text-sm ${
                        selectedDirective === option.id ? 'text-foreground' : 'text-foreground/80'
                      }`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Selected email preview */}
                {selectedEmail && (
                  <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <span className="text-xs text-muted-foreground">Svarar på:</span>
                    <p className="text-sm font-medium text-foreground">
                      {demoEmails.find(e => e.id === selectedEmail)?.subject}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Generating state */}
            {isGenerating && (
              <div className="flex-1 flex flex-col items-center justify-center animate-fade-in py-12">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                  </div>
                </div>
                <p className="mt-6 text-foreground font-medium">Genererar svar...</p>
                <p className="text-sm text-muted-foreground mt-1">AI skriver ett professionellt svar</p>
              </div>
            )}

            {/* Step 3: Result */}
            {showResult && (
              <div className="flex-1 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                      Ditt genererade svar
                    </span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">Kopiera</span>
                  </button>
                </div>
                
                <div className="rounded-xl bg-background border border-border p-4 mb-4 max-h-[200px] overflow-y-auto">
                  {generatedResponse.split('\n\n').map((paragraph, index) => (
                    <p 
                      key={index}
                      className="text-sm leading-relaxed text-foreground/90 mb-3 last:mb-0"
                      style={{
                        animation: 'fade-in 0.4s ease-out forwards',
                        animationDelay: `${index * 0.15}s`,
                        opacity: 0,
                      }}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs">Redo att skicka eller redigera vidare</span>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
              {currentStep > 1 && !showResult ? (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Tillbaka
                </Button>
              ) : (
                <div />
              )}
              
              {!showResult ? (
                <Button
                  onClick={handleNext}
                  disabled={isGenerating || (currentStep === 1 && selectedEmail === null)}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  {currentStep === 2 ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generera svar
                    </>
                  ) : (
                    <>
                      Nästa
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    className="flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Börja om
                  </Button>
                  <Button
                    onClick={handleCreateReal}
                    className="gap-2 bg-primary hover:bg-primary/90"
                  >
                    Testa på riktigt
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className="text-center mt-8">
        <p className="text-sm md:text-base text-muted-foreground">
          Från kundmejl till professionellt svar – <span className="text-foreground font-medium">på sekunder.</span>
        </p>
      </div>
    </div>
  );
};

export default EmailDemo;
