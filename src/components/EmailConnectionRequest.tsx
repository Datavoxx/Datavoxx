import { useState, useEffect } from "react";
import { Mail, Loader2, CheckCircle, Clock, ArrowLeft, HelpCircle, BookOpen, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

type ViewState = "select-provider" | "options" | "guide" | "pending";
type ProviderType = "google" | "other" | null;

const EmailConnectionRequest = ({ userId }: EmailConnectionRequestProps) => {
  const { toast } = useToast();
  const [viewState, setViewState] = useState<ViewState>("select-provider");
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState<ExistingRequest | null>(null);
  const [isLoadingRequest, setIsLoadingRequest] = useState(true);

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
  };

  const handleRequestHelp = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("email_connection_requests").insert({
        user_id: userId,
        request_type: selectedProvider || "other",
        email_address: null,
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

  // Options view (after selecting provider)
  if (viewState === "options") {
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

        <div className="text-center mb-8">
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

        <div className="space-y-4">
          <Button
            onClick={handleRequestHelp}
            disabled={isSubmitting}
            className="w-full h-auto py-4"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 shrink-0" />
              <div className="text-left">
                <p className="font-semibold">Ska vi hjälpa dig?</p>
                <p className="text-xs font-normal opacity-80">
                  {isSubmitting ? "Skickar förfrågan..." : "Vi kontaktar dig och hjälper dig ansluta"}
                </p>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => setViewState("guide")}
            className="w-full h-auto py-4"
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
