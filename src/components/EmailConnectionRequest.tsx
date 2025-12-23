import { useState, useEffect } from "react";
import { Mail, Loader2, CheckCircle, Clock, ArrowLeft, HelpCircle, BookOpen, Key, Server, Phone, Building, User, X, Shield, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
interface EmailConnectionRequestProps {
  userId: string;
}

interface ExistingRequest {
  id: string;
  request_type: "google" | "other";
  email_address: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

type ViewState = "select-provider" | "options" | "guide" | "pending" | "help-form";
type ProviderType = "google" | "other" | null;

const EmailConnectionRequest = ({ userId }: EmailConnectionRequestProps) => {
  const { toast } = useToast();
  const [viewState, setViewState] = useState<ViewState>("select-provider");
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [existingRequest, setExistingRequest] = useState<ExistingRequest | null>(null);
  const [isLoadingRequest, setIsLoadingRequest] = useState(true);
  
  // IMAP form state
  const [imapServer, setImapServer] = useState("");
  const [imapPort, setImapPort] = useState("");
  const [imapUsername, setImapUsername] = useState("");
  const [imapPassword, setImapPassword] = useState("");
  
  // Help form state
  const [contactName, setContactName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    fetchExistingRequest();
  }, [userId]);

  const fetchExistingRequest = async () => {
    try {
      const { data, error } = await supabase
        .from("email_connection_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching request:", error);
      }

      if (data) {
        setExistingRequest(data as ExistingRequest);
        if (data.status === "pending") {
          setViewState("pending");
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoadingRequest(false);
    }
  };

  const handleSelectProvider = (provider: ProviderType) => {
    setSelectedProvider(provider);
    setViewState("options");
    
    // Pre-fill IMAP settings for known providers
    if (provider === "google") {
      setImapServer("imap.gmail.com");
      setImapPort("993");
    } else {
      setImapServer("");
      setImapPort("993");
    }
  };

  const handleConnect = async () => {
    if (!imapServer || !imapPort || !imapUsername || !imapPassword) {
      toast({
        title: "Fyll i alla fält",
        description: "Alla IMAP-uppgifter krävs för att ansluta.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      // First, save the email credentials to the new table
      const { error: credError } = await supabase
        .from("email_credentials")
        .upsert({
          user_id: userId,
          imap_host: imapServer,
          imap_port: parseInt(imapPort) || 993,
          imap_username: imapUsername,
          imap_password: imapPassword,
          smtp_host: imapServer.replace("imap.", "smtp."),
          smtp_port: 465,
        }, { onConflict: "user_id" });

      if (credError) throw credError;

      // Update the user's profile with email connection info
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          email_connected: true,
          connected_email: imapUsername,
        })
        .eq("user_id", userId);

      if (profileError) throw profileError;

      toast({
        title: "E-post ansluten!",
        description: "Dina IMAP-uppgifter har sparats säkert.",
      });

      // Reload the page to show the inbox
      window.location.reload();
    } catch (error) {
      console.error("Error connecting email:", error);
      toast({
        title: "Fel",
        description: "Kunde inte ansluta e-posten. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRequestHelp = async () => {
    if (!contactName || !phoneNumber || !companyName) {
      toast({
        title: "Fyll i alla fält",
        description: "Namn, telefonnummer och företagsnamn krävs.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const requestType = selectedProvider === "google" ? "request_help_gmail" : "request_help_other";
      
      const { error } = await supabase.from("email_connection_requests").insert({
        user_id: userId,
        request_type: requestType,
        email_address: null,
        contact_name: contactName,
        phone_number: phoneNumber,
        company_name: companyName,
      });

      if (error) throw error;

      toast({
        title: "Förfrågan skickad!",
        description: "Vi kontaktar dig snart för att hjälpa dig ansluta din e-post.",
      });

      setViewState("pending");
      fetchExistingRequest();
    } catch (error) {
      console.error("Error submitting request:", error);
      toast({
        title: "Fel",
        description: "Kunde inte skicka förfrågan. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (viewState === "guide") {
      setViewState("options");
    } else if (viewState === "options") {
      setViewState("select-provider");
      setSelectedProvider(null);
    } else if (viewState === "help-form") {
      setViewState("options");
    }
  };

  if (isLoadingRequest) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Show pending request status
  if (viewState === "pending" || (existingRequest && existingRequest.status === "pending")) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 max-w-lg text-center border border-gray-200">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Din förfrågan behandlas
        </h2>
        <p className="text-muted-foreground mb-4">
          Vi har mottagit din förfrågan och kontaktar dig snart.
        </p>
        <p className="text-sm text-muted-foreground">
          Vi hjälper dig ansluta din e-post så fort som möjligt.
        </p>
      </div>
    );
  }

  // Show approved status
  if (existingRequest && existingRequest.status === "approved") {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 max-w-lg text-center border border-gray-200">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Din e-post är godkänd!
        </h2>
        <p className="text-muted-foreground">
          Snart kommer du kunna använda inkorgen. Vi arbetar på att slutföra anslutningen.
        </p>
      </div>
    );
  }

  // Guide view
  if (viewState === "guide") {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 max-w-2xl border border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tillbaka
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Key className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Guide: Anslut din e-post
            </h2>
            <p className="text-sm text-muted-foreground">
              Följ stegen nedan för att konfigurera din e-postanslutning
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {selectedProvider === "google" ? (
            <>
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">Steg 1: Aktivera IMAP i Gmail</h3>
                <p className="text-sm text-muted-foreground">
                  Gå till Gmail-inställningar → "Se alla inställningar" → "Vidarebefordran och POP/IMAP" → Aktivera IMAP.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">Steg 2: Skapa ett App-lösenord</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Eftersom Gmail kräver 2-stegsverifiering, behöver du ett app-lösenord:
                </p>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                  <li>Gå till Google-kontoinställningar → Säkerhet</li>
                  <li>Under "Logga in på Google", välj "App-lösenord"</li>
                  <li>Välj "E-post" och "Windows-dator" (eller annan)</li>
                  <li>Klicka "Generera" och spara lösenordet</li>
                </ol>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">Steg 3: IMAP-inställningar</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono">
                  <p><strong>Server:</strong> imap.gmail.com</p>
                  <p><strong>Port:</strong> 993</p>
                  <p><strong>Kryptering:</strong> SSL/TLS</p>
                  <p><strong>Användarnamn:</strong> din.email@gmail.com</p>
                  <p><strong>Lösenord:</strong> [App-lösenord från steg 2]</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">Steg 1: Hitta IMAP-inställningar</h3>
                <p className="text-sm text-muted-foreground">
                  Kontakta din e-postleverantör eller sök efter "[din leverantör] IMAP settings" för att hitta rätt serveradress och port.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">Steg 2: Aktivera IMAP</h3>
                <p className="text-sm text-muted-foreground">
                  De flesta e-postleverantörer kräver att du aktiverar IMAP-åtkomst i inställningarna. Leta efter "IMAP" eller "E-postklienter" i ditt kontos inställningar.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold mb-2">Steg 3: Vanliga IMAP-inställningar</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                  <div>
                    <p className="font-semibold">Outlook/Hotmail:</p>
                    <p className="font-mono text-muted-foreground">imap-mail.outlook.com:993</p>
                  </div>
                  <div>
                    <p className="font-semibold">Yahoo:</p>
                    <p className="font-mono text-muted-foreground">imap.mail.yahoo.com:993</p>
                  </div>
                  <div>
                    <p className="font-semibold">iCloud:</p>
                    <p className="font-mono text-muted-foreground">imap.mail.me.com:993</p>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Behöver du hjälp?</strong> Om du kör fast, klicka på "Tillbaka" och välj "Ska vi hjälpa dig?" så hjälper vi dig med anslutningen.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Help form view
  if (viewState === "help-form") {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 max-w-lg border border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tillbaka
        </Button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Vi hjälper dig
          </h2>
          <p className="text-muted-foreground">
            Fyll i dina uppgifter så kontaktar vi dig för att hjälpa dig ansluta din {selectedProvider === "google" ? "Gmail" : "e-post"}.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Namn
            </Label>
            <Input
              id="contact-name"
              placeholder="Ditt namn"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone-number" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Telefonnummer
            </Label>
            <Input
              id="phone-number"
              type="tel"
              placeholder="070-123 45 67"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-name" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Företagsnamn
            </Label>
            <Input
              id="company-name"
              placeholder="Ditt företag"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleRequestHelp} 
            disabled={isSubmitting}
            className="w-full mt-6"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Skickar...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Skicka förfrågan
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Options view (after selecting provider)
  if (viewState === "options") {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 max-w-lg border border-gray-200 max-h-[85vh] overflow-y-auto relative">
        {/* What is API? button in top right */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="absolute top-4 right-4 text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1.5 transition-colors">
              <HelpCircle className="h-4 w-4" />
              Vad är API?
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Vad är en API-nyckel?
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                En <strong className="text-foreground">API-nyckel</strong> är ett unikt lösenord som låter vår tjänst säkert kommunicera med din e-post. Det fungerar som en digital nyckel som ger oss tillåtelse att läsa dina mejl och skicka svar åt dig.
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 mb-1">Viktigt att veta</p>
                  <p className="text-amber-700 text-xs">
                    Din API-nyckel är personlig och ska aldrig delas med någon annan. Den ger åtkomst till ditt e-postkonto.
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Säkerhet</p>
                    <p className="text-xs">Dina uppgifter krypteras och lagras säkert. Vi har aldrig åtkomst till ditt vanliga lösenord.</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Lock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">App-lösenord</p>
                    <p className="text-xs">För Gmail skapar du ett speciellt "app-lösenord" som bara fungerar för denna tjänst – inte ditt vanliga lösenord.</p>
                  </div>
                </div>
              </div>
              
              <p className="text-xs border-t pt-3">
                Har du frågor? Välj "Ska vi hjälpa dig?" så kontaktar vi dig och guidar dig genom processen.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tillbaka
        </Button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            API-nyckel krävs
          </h2>
          <p className="text-muted-foreground">
            För att ansluta din {selectedProvider === "google" ? "Gmail" : "e-post"} behöver vi dina IMAP-inloggningsuppgifter.
          </p>
        </div>

        {/* IMAP Configuration Form */}
        <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Server className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Fyll i dina IMAP-uppgifter</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="imap-server">Server</Label>
                <Input
                  id="imap-server"
                  placeholder="imap.example.com"
                  value={imapServer}
                  onChange={(e) => setImapServer(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imap-port">Port</Label>
                <Input
                  id="imap-port"
                  placeholder="993"
                  value={imapPort}
                  onChange={(e) => setImapPort(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imap-username">Användarnamn (e-post)</Label>
              <Input
                id="imap-username"
                type="email"
                placeholder="din.email@example.com"
                value={imapUsername}
                onChange={(e) => setImapUsername(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imap-password">Lösenord / App-lösenord</Label>
              <Input
                id="imap-password"
                type="password"
                placeholder="••••••••••••"
                value={imapPassword}
                onChange={(e) => setImapPassword(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ansluter...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Anslut
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white/80 text-muted-foreground">eller</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={() => setViewState("help-form")}
            className="w-full h-auto py-3"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 shrink-0" />
              <div className="text-left">
                <p className="font-semibold">Ska vi hjälpa dig?</p>
                <p className="text-xs font-normal text-muted-foreground">
                  Vi kontaktar dig och hjälper dig ansluta
                </p>
              </div>
            </div>
          </Button>

          <Button
            variant="ghost"
            onClick={() => setViewState("guide")}
            className="w-full h-auto py-3"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 shrink-0" />
              <div className="text-left">
                <p className="font-semibold">Guide</p>
                <p className="text-xs font-normal text-muted-foreground">
                  Läs hur du ansluter din e-post själv
                </p>
              </div>
            </div>
          </Button>
        </div>
      </div>
    );
  }

  // Select provider view (default)
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Anslut din e-post
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          För att kunna se och besvara mejl direkt i Email Assistenten behöver du ansluta din e-post.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Google Mail */}
        <button
          onClick={() => handleSelectProvider("google")}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 border border-gray-200 hover:border-primary/50 hover:shadow-lg transition-all text-left group"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" className="h-6 w-6">
                <path
                  fill="#EA4335"
                  d="M5.47 8.5L12 13l6.53-4.5V7L12 11.5 5.47 7z"
                />
                <path
                  fill="#4285F4"
                  d="M20 7v10c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V7l8 5.5z"
                />
                <path
                  fill="#34A853"
                  d="M5.47 8.5L12 13l6.53-4.5V7L12 11.5 5.47 7z"
                />
                <path
                  fill="#FBBC05"
                  d="M4 7v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7l-8 5.5z"
                  opacity="0.25"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">Google Mail</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Anslut din Gmail för att automatiskt se och besvara mejl.
          </p>
        </button>

        {/* Other Email */}
        <button
          onClick={() => handleSelectProvider("other")}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 border border-gray-200 hover:border-primary/50 hover:shadow-lg transition-all text-left group"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Annan e-post</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Outlook, Yahoo, företags-e-post eller annan leverantör.
          </p>
        </button>
      </div>
    </div>
  );
};

export default EmailConnectionRequest;
