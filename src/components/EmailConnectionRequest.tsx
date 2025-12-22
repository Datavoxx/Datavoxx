import { useState, useEffect } from "react";
import { Mail, Loader2, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const EmailConnectionRequest = ({ userId }: EmailConnectionRequestProps) => {
  const { toast } = useToast();
  const [emailAddress, setEmailAddress] = useState("");
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);
  const [isSubmittingOther, setIsSubmittingOther] = useState(false);
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
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching request:", error);
      }

      if (data) {
        setExistingRequest(data as ExistingRequest);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoadingRequest(false);
    }
  };

  const handleGoogleRequest = async () => {
    setIsSubmittingGoogle(true);
    try {
      const { error } = await supabase.from("email_connection_requests").insert({
        user_id: userId,
        request_type: "google",
        email_address: null,
      });

      if (error) throw error;

      toast({
        title: "Förfrågan skickad!",
        description: "Vi kontaktar dig när din Google Mail är redo att kopplas.",
      });

      fetchExistingRequest();
    } catch (error) {
      console.error("Error submitting request:", error);
      toast({
        title: "Fel",
        description: "Kunde inte skicka förfrågan. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingGoogle(false);
    }
  };

  const handleOtherRequest = async () => {
    if (!emailAddress.trim() || !emailAddress.includes("@")) {
      toast({
        title: "Ogiltig e-postadress",
        description: "Ange en giltig e-postadress.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingOther(true);
    try {
      const { error } = await supabase.from("email_connection_requests").insert({
        user_id: userId,
        request_type: "other",
        email_address: emailAddress.trim(),
      });

      if (error) throw error;

      toast({
        title: "Förfrågan skickad!",
        description: "Vi kontaktar dig när din e-post är redo att kopplas.",
      });

      setEmailAddress("");
      fetchExistingRequest();
    } catch (error) {
      console.error("Error submitting request:", error);
      toast({
        title: "Fel",
        description: "Kunde inte skicka förfrågan. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingOther(false);
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
  if (existingRequest && existingRequest.status === "pending") {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 max-w-lg text-center border border-gray-200">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Din förfrågan behandlas
        </h2>
        <p className="text-muted-foreground mb-4">
          {existingRequest.request_type === "google" 
            ? "Du har begärt att ansluta din Google Mail." 
            : `Du har begärt att ansluta ${existingRequest.email_address}.`}
        </p>
        <p className="text-sm text-muted-foreground">
          Vi kontaktar dig när din e-post är redo att användas.
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
        {/* Google Mail Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
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
          <p className="text-sm text-muted-foreground mb-4">
            Anslut din Gmail för att automatiskt se och besvara mejl. Kräver Google-inloggning.
          </p>
          <Button
            onClick={handleGoogleRequest}
            disabled={isSubmittingGoogle}
            className="w-full"
          >
            {isSubmittingGoogle ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Skickar...
              </>
            ) : (
              "Begär Google-anslutning"
            )}
          </Button>
        </div>

        {/* Other Email Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Annan e-post</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Har du en annan e-postleverantör? Ange din e-postadress så hjälper vi dig ansluta.
          </p>
          <div className="space-y-3">
            <div>
              <Label htmlFor="email" className="sr-only">
                E-postadress
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="din@epost.se"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
              />
            </div>
            <Button
              onClick={handleOtherRequest}
              disabled={isSubmittingOther || !emailAddress.trim()}
              variant="outline"
              className="w-full"
            >
              {isSubmittingOther ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Skickar...
                </>
              ) : (
                "Skicka förfrågan"
              )}
            </Button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6">
        Efter att du skickat en förfrågan kommer vi kontakta dig för att slutföra anslutningen.
      </p>
    </div>
  );
};

export default EmailConnectionRequest;
