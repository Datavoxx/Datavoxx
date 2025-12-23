import { useState } from "react";
import { Mail, Inbox, ChevronRight, Sparkles, Copy, Send, ArrowLeft, User, Calendar, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface DemoEmail {
  id: number;
  from: string;
  fromName: string;
  subject: string;
  date: string;
  preview: string;
  body: string;
  isRead: boolean;
}

const demoEmails: DemoEmail[] = [
  { 
    id: 1,
    from: "anders.svensson@email.se",
    fromName: "Anders Svensson", 
    subject: "Fråga om BMW X3", 
    date: new Date().toISOString(),
    preview: "Hej! Jag såg er annons för BMW X3:an...",
    body: "Hej!\n\nJag såg er annons för BMW X3:an. Finns bilen kvar och går det att pruta något på priset?\n\nMvh\nAnders",
    isRead: false
  },
  { 
    id: 2,
    from: "maria.lindberg@gmail.com",
    fromName: "Maria Lindberg", 
    subject: "Provkörning Volvo V60?", 
    date: new Date(Date.now() - 86400000).toISOString(),
    preview: "Hej, jag är intresserad av Volvo V60:n...",
    body: "Hej!\n\nJag är intresserad av Volvo V60:n ni har ute. Kan jag boka en provkörning denna vecka?\n\nVänliga hälsningar\nMaria",
    isRead: true
  },
  { 
    id: 3,
    from: "info@foretagab.se",
    fromName: "Företag AB", 
    subject: "Inköpsförfrågan flottan", 
    date: new Date(Date.now() - 172800000).toISOString(),
    preview: "Vi söker 3 st Volvo V90 till vår...",
    body: "Hej,\n\nVi söker 3 st Volvo V90 till vår fordonsflotta. Vad kan ni erbjuda för företagspriser?\n\nMed vänlig hälsning\nFöretag AB",
    isRead: true
  }
];

const quickDirectives = [
  { label: "Boka visning", value: "Föreslå att boka en visning/provkörning" },
  { label: "Bekräfta pris", value: "Bekräfta pris och tillgänglighet" },
  { label: "Neka bud", value: "Tacka artigt men avböj budet" },
];

const responseTexts: Record<string, Record<number, string>> = {
  "Föreslå att boka en visning/provkörning": {
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
  "Bekräfta pris och tillgänglighet": {
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
  },
  "Tacka artigt men avböj budet": {
    1: `Hej Anders!

Tack för ditt intresse för BMW X3:an! Vi uppskattar att du hört av dig.

Tyvärr har vi redan prissatt bilen konkurrenskraftigt och kan inte gå ner ytterligare i pris. Du är varmt välkommen att kontakta oss om du ändrar dig.

Med vänliga hälsningar`,
    2: `Hej Maria!

Tack för att du hört av dig angående Volvo V60:n!

Just nu har vi tyvärr inte möjlighet att erbjuda några ytterligare rabatter, men hör gärna av dig om det dyker upp andra frågor.

Med vänliga hälsningar`,
    3: `Hej!

Tack för er förfrågan om Volvo V90. Vi uppskattar ert intresse.

Tyvärr kan vi inte matcha den prisbild ni efterfrågar just nu, men vi återkommer gärna om situationen ändras.

Med vänliga hälsningar`
  }
};

const defaultResponse: Record<number, string> = {
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
};

interface EmailDemoProps {
  onStepChange?: (step: number) => void;
}

const EmailDemo = ({ onStepChange }: EmailDemoProps = {}) => {
  const [selectedEmail, setSelectedEmailInternal] = useState<DemoEmail | null>(null);
  
  const setSelectedEmail = (email: DemoEmail | null) => {
    setSelectedEmailInternal(email);
    if (email) {
      onStepChange?.(2); // Step 2: Give directive
    } else {
      onStepChange?.(1); // Step 1: Select email
    }
  };
  const [directive, setDirective] = useState("");
  const [generatedReply, setGeneratedReply] = useState("");
  const [editableReply, setEditableReply] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  const trackDemoAction = async (action: string) => {
    try {
      const sessionId = localStorage.getItem('bilgen_session_id') || 'unknown';
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('demo_tests').insert({
        session_id: sessionId,
        action: `email_demo_${action}`,
        step_from: selectedEmail?.id || 0,
        user_id: user?.id || null
      });
    } catch (error) {
      console.error("Error tracking demo action:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      
      if (isToday) {
        return date.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
      }
      return date.toLocaleDateString("sv-SE", { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  };

  const formatFullDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("sv-SE", { 
        day: "numeric", 
        month: "long", 
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "";
    }
  };

  const handleSelectEmail = (email: DemoEmail) => {
    setSelectedEmail(email);
    setGeneratedReply("");
    setEditableReply("");
    setDirective("");
    trackDemoAction("select_email");
  };

  const handleBack = () => {
    setSelectedEmail(null);
    setGeneratedReply("");
    setEditableReply("");
    setDirective("");
  };

  const handleQuickDirective = (value: string) => {
    setDirective(value);
  };

  const handleGenerate = async () => {
    if (!directive.trim() || !selectedEmail || isGenerating) return;
    
    trackDemoAction("generate");
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const response = responseTexts[directive]?.[selectedEmail.id] || defaultResponse[selectedEmail.id];
    setGeneratedReply(response);
    setEditableReply(response);
    setIsGenerating(false);
    onStepChange?.(3); // Step 3: Review reply
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableReply);
    toast.success("Kopierat till urklipp!");
    trackDemoAction("copy");
  };

  const handleCreateReal = () => {
    trackDemoAction("create_real");
    navigate('/email');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent rounded-3xl blur-2xl" />
        
        <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] min-h-[420px]">
            
            {/* Inbox Column */}
            <div className={cn(
              "flex flex-col border-r border-border/50",
              selectedEmail && "hidden md:flex"
            )}>
              {/* Inbox Header */}
              <div className="flex items-center gap-2 p-4 border-b border-border/50">
                <Inbox className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Inkorg</h3>
                <span className="text-sm text-muted-foreground">({demoEmails.length})</span>
              </div>

              {/* Email List */}
              <ScrollArea className="flex-1">
                <div className="divide-y divide-border/50">
                  {demoEmails.map((email) => (
                    <button
                      key={email.id}
                      onClick={() => handleSelectEmail(email)}
                      className={cn(
                        "w-full text-left p-4 hover:bg-muted/50 transition-colors group",
                        selectedEmail?.id === email.id && "bg-primary/5 border-l-2 border-primary",
                        !email.isRead && "bg-primary/5"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={cn(
                              "text-sm truncate",
                              !email.isRead ? "font-semibold text-foreground" : "text-muted-foreground"
                            )}>
                              {email.fromName}
                            </span>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {formatDate(email.date)}
                            </span>
                          </div>
                          <p className={cn(
                            "text-sm truncate mb-1",
                            !email.isRead ? "font-medium text-foreground" : "text-muted-foreground"
                          )}>
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

            {/* Reply Panel Column */}
            <div className={cn(
              "flex flex-col",
              !selectedEmail && "hidden md:flex"
            )}>
              {selectedEmail ? (
                <>
                  {/* Header */}
                  <div className="flex items-center gap-3 p-4 border-b border-border/50">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleBack} 
                      className="h-8 w-8 shrink-0 md:hidden"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{selectedEmail.subject}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1 truncate">
                          <User className="h-3 w-3" />
                          {selectedEmail.fromName}
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                          <Calendar className="h-3 w-3" />
                          {formatFullDate(selectedEmail.date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Email Content */}
                  <ScrollArea className="flex-1 min-h-0">
                    <div className="p-4 space-y-4">
                      {/* Original Email */}
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-2">Inkommande mejl:</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                          {selectedEmail.body}
                        </p>
                      </div>

                      {/* Generated/Editable Reply */}
                      {(generatedReply || editableReply) && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 animate-fade-in">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-primary font-medium">Ditt svar:</p>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                              >
                                <Pencil className="h-3 w-3 mr-1" />
                                Redigera
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopy}
                                className="h-7 px-2 text-xs"
                                disabled={!editableReply.trim()}
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Kopiera
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 px-3 text-xs"
                                disabled
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Skicka
                              </Button>
                            </div>
                          </div>
                          <textarea
                            value={editableReply}
                            onChange={(e) => setEditableReply(e.target.value)}
                            className="w-full min-h-[120px] text-sm bg-transparent border-0 
                                       focus:outline-none focus:ring-0 resize-none text-foreground
                                       placeholder:text-muted-foreground"
                            placeholder="Redigera ditt svar här..."
                          />
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Reply Input */}
                  <div className="border-t border-border/50 p-4 space-y-3">
                    {/* Quick Directives */}
                    <div className="flex flex-wrap gap-2">
                      {quickDirectives.map((qd) => (
                        <Button
                          key={qd.label}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickDirective(qd.value)}
                          className={cn(
                            "text-xs h-7 px-2.5",
                            directive === qd.value && "border-primary bg-primary/10"
                          )}
                        >
                          {qd.label}
                        </Button>
                      ))}
                    </div>

                    {/* Directive Input */}
                    <div className="relative flex items-end gap-2">
                      <textarea
                        value={directive}
                        onChange={(e) => setDirective(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleGenerate();
                          }
                        }}
                        placeholder="Skriv ditt direktiv... t.ex. 'Tacka och föreslå provkörning på fredag'"
                        className="flex-1 min-h-[44px] max-h-[80px] px-3 py-2.5 text-sm bg-muted/50 border border-border rounded-lg
                                   focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 
                                   transition-all resize-none"
                        disabled={isGenerating}
                        rows={1}
                      />
                      <Button
                        onClick={handleGenerate}
                        disabled={!directive.trim() || isGenerating}
                        className="h-[44px] px-4"
                      >
                        {isGenerating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generera
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="p-4 pt-0">
                    <Button
                      onClick={handleCreateReal}
                      variant="outline"
                      className="w-full border-primary/30 text-primary hover:bg-primary/10 hover:border-primary"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Testa på riktigt
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <Mail className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Välj ett mejl</h3>
                  <p className="text-sm text-muted-foreground max-w-[200px]">
                    Klicka på ett mejl i inkorgen för att se hur AI-assistenten kan hjälpa dig svara
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDemo;
