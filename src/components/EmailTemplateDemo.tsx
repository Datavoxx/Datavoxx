import { useState } from "react";
import { Mail, Inbox, ChevronRight, Sparkles, Copy, ArrowRight, Play, RotateCcw, Check, Lightbulb, User, Calendar, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DemoStep {
  title: string;
  description: string;
}

const steps: DemoStep[] = [
  { title: "Välj mejl", description: "Klicka på ett mejl i inkorgen" },
  { title: "Ge direktiv", description: "Välj snabbval eller skriv fritt" },
  { title: "Generera svar", description: "AI:n skapar ditt svar" },
];

interface DemoEmail {
  id: number;
  fromName: string;
  subject: string;
  preview: string;
  body: string;
}

const demoEmails: DemoEmail[] = [
  { 
    id: 1,
    fromName: "Anders Svensson", 
    subject: "Fråga om BMW X3", 
    preview: "Hej! Jag såg er annons för BMW X3:an...",
    body: "Hej!\n\nJag såg er annons för BMW X3:an. Finns bilen kvar och går det att pruta något på priset?\n\nMvh\nAnders"
  },
  { 
    id: 2,
    fromName: "Maria Lindberg", 
    subject: "Provkörning Volvo V60?", 
    preview: "Hej, jag är intresserad av Volvo V60:n...",
    body: "Hej!\n\nJag är intresserad av Volvo V60:n ni har ute. Kan jag boka en provkörning denna vecka?\n\nVänliga hälsningar\nMaria"
  }
];

const quickDirectives = [
  { label: "Boka visning", value: "Föreslå att boka en visning/provkörning" },
  { label: "Bekräfta pris", value: "Bekräfta pris och tillgänglighet" },
];

const responseTexts: Record<string, Record<number, string>> = {
  "Föreslå att boka en visning/provkörning": {
    1: `Hej Anders!

Självklart! BMW X3:an finns kvar och jag föreslår att du kommer förbi för en provkörning. 

Passar det på torsdag kl 14:00 eller fredag kl 10:00?

Med vänliga hälsningar`,
    2: `Hej Maria!

Absolut, vi bokar gärna in en provkörning av Volvo V60:n!

Jag har lediga tider på onsdag kl 15:00 eller fredag kl 14:00. Vilken tid passar dig bäst?

Med vänliga hälsningar`
  },
  "Bekräfta pris och tillgänglighet": {
    1: `Hej Anders!

BMW X3:an är prissatt till 389 000 kr. Just nu erbjuder vi dessutom förmånlig finansiering med 3,95% ränta.

Välkommen in för provkörning!

Med vänliga hälsningar`,
    2: `Hej Maria!

Volvo V60:n kostar 285 000 kr. Vi har just nu kampanj med ränta från 3,95%.

Välkommen på provkörning så berättar jag mer!

Med vänliga hälsningar`
  }
};

interface EmailTemplateDemoProps {
  onTryTemplate?: () => void;
}

const EmailTemplateDemo = ({ onTryTemplate }: EmailTemplateDemoProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedEmail, setSelectedEmail] = useState<DemoEmail | null>(null);
  const [selectedDirective, setSelectedDirective] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReply, setGeneratedReply] = useState<string | null>(null);

  const handleSelectEmail = (email: DemoEmail) => {
    setSelectedEmail(email);
    setCurrentStep(1);
    setSelectedDirective(null);
    setGeneratedReply(null);
  };

  const handleSelectDirective = async (directive: string) => {
    setSelectedDirective(directive);
    setCurrentStep(2);
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = selectedEmail ? responseTexts[directive]?.[selectedEmail.id] : null;
    setGeneratedReply(response || "Svar genererat...");
    setIsGenerating(false);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedEmail(null);
    setSelectedDirective(null);
    setGeneratedReply(null);
    setIsGenerating(false);
  };

  const handleCopy = () => {
    if (generatedReply) {
      navigator.clipboard.writeText(generatedReply);
      toast.success("Kopierat till urklipp!");
    }
  };

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Lightbulb className="h-4 w-4" />
          Så här fungerar det
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Generera mejlsvar på sekunder
        </h3>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Email Assistenten hjälper dig skriva professionella svar snabbt. 
          Prova demot nedan för att se hur det fungerar!
        </p>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all",
              currentStep === index && "bg-primary text-primary-foreground",
              currentStep > index && "bg-green-100 text-green-700",
              currentStep < index && "bg-muted text-muted-foreground"
            )}>
              {currentStep > index ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="w-4 h-4 flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
              )}
              <span className="hidden sm:inline">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
            )}
          </div>
        ))}
      </div>

      {/* Demo Container */}
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent rounded-3xl blur-2xl" />
        
        <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[350px]">
            
            {/* Inbox Column */}
            <div className="flex flex-col border-r border-border/50">
              <div className="flex items-center gap-2 p-3 border-b border-border/50 bg-muted/30">
                <Inbox className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Inkorg (demo)</span>
              </div>

              <ScrollArea className="flex-1">
                <div className="divide-y divide-border/50">
                  {demoEmails.map((email) => (
                    <button
                      key={email.id}
                      onClick={() => handleSelectEmail(email)}
                      disabled={currentStep > 0 && selectedEmail?.id !== email.id}
                      className={cn(
                        "w-full text-left p-3 hover:bg-muted/50 transition-colors group",
                        selectedEmail?.id === email.id && "bg-primary/10 border-l-2 border-primary",
                        currentStep > 0 && selectedEmail?.id !== email.id && "opacity-40"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="text-sm font-medium text-foreground truncate">
                              {email.fromName}
                            </span>
                          </div>
                          <p className="text-sm text-foreground truncate mb-0.5">
                            {email.subject}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {email.preview}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0 mt-1" />
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Reply Panel */}
            <div className="flex flex-col">
              {selectedEmail ? (
                <>
                  {/* Email Header */}
                  <div className="p-3 border-b border-border/50 bg-muted/30">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium text-foreground">{selectedEmail.fromName}</span>
                      <span className="text-muted-foreground">–</span>
                      <span className="text-muted-foreground truncate">{selectedEmail.subject}</span>
                    </div>
                  </div>

                  <ScrollArea className="flex-1 min-h-0">
                    <div className="p-3 space-y-3">
                      {/* Original Email */}
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1.5">Inkommande mejl:</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                          {selectedEmail.body}
                        </p>
                      </div>

                      {/* Generated Reply */}
                      {(isGenerating || generatedReply) && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 animate-fade-in">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-xs text-primary font-medium flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              AI-genererat svar
                            </p>
                            {generatedReply && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopy}
                                className="h-6 px-2 text-xs"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Kopiera
                              </Button>
                            )}
                          </div>
                          {isGenerating ? (
                            <div className="flex items-center gap-2 py-4">
                              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                              <span className="text-sm text-muted-foreground">Genererar svar...</span>
                            </div>
                          ) : (
                            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                              {generatedReply}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Directives */}
                  {currentStep === 1 && !generatedReply && (
                    <div className="border-t border-border/50 p-3 space-y-2 animate-fade-in">
                      <p className="text-xs text-muted-foreground">Välj ett snabbval:</p>
                      <div className="flex flex-wrap gap-2">
                        {quickDirectives.map((qd) => (
                          <Button
                            key={qd.label}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectDirective(qd.value)}
                            className="text-xs h-8"
                          >
                            {qd.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Play className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">Börja demot</p>
                  <p className="text-xs text-muted-foreground">
                    Klicka på ett mejl till vänster för att prova
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          {generatedReply && (
            <div className="border-t border-border/50 p-3 bg-muted/30 flex items-center justify-between gap-3">
              <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Börja om
              </Button>
              {onTryTemplate && (
                <Button size="sm" onClick={onTryTemplate} className="gap-2">
                  <Send className="h-4 w-4" />
                  Prova på riktigt
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <div className="text-center p-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <h4 className="font-medium text-foreground text-sm mb-1">AI-drivna svar</h4>
          <p className="text-xs text-muted-foreground">
            Generera professionella svar anpassade till varje mejl
          </p>
        </div>
        <div className="text-center p-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <h4 className="font-medium text-foreground text-sm mb-1">Snabbval</h4>
          <p className="text-xs text-muted-foreground">
            Vanliga svar med ett klick – boka visning, bekräfta pris m.m.
          </p>
        </div>
        <div className="text-center p-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Copy className="h-5 w-5 text-primary" />
          </div>
          <h4 className="font-medium text-foreground text-sm mb-1">Redigera & kopiera</h4>
          <p className="text-xs text-muted-foreground">
            Justera svaret och kopiera eller skicka direkt
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateDemo;
