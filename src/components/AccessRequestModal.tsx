import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Lock, Send, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface AccessRequestModalProps {
  open: boolean;
  onClose: () => void;
  toolName: string;
}

export const AccessRequestModal = ({
  open,
  onClose,
  toolName,
}: AccessRequestModalProps) => {
  const { user, profile } = useAuth();
  const { hasMinRole, isGuest } = useUserRole();
  const [antalAnnonser, setAntalAnnonser] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Check if user is gen_1 (can request access)
  const isGen1 = hasMinRole("gen_1") && !hasMinRole("gen_2");

  // Validation
  const isFormValid = antalAnnonser.trim() !== "";

  const handleSubmit = async () => {
    if (!user || !isFormValid) return;

    setIsSubmitting(true);
    try {
      // Get user info from profile
      const userName = profile?.display_name || user.email || "Okänd";
      const userEmail = profile?.email || user.email || "";

      // Send to n8n webhook
      const webhookResponse = await fetch(
        "https://datavox.app.n8n.cloud/webhook-test/atkomstbildgenerator",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: userName,
            email: userEmail,
            antalAnnonser: antalAnnonser.trim(),
            toolName: toolName,
          }),
        }
      );

      if (!webhookResponse.ok) {
        throw new Error("Webhook request failed");
      }

      // Also save to database for backup/logging
      const { error } = await supabase.from("tool_access_requests").insert({
        user_id: user.id,
        tool_name: toolName,
        note: `Antal annonser per vecka: ${antalAnnonser.trim()}`,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Din förfrågan har skickats!");
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Något gick fel. Försök igen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAntalAnnonser("");
    setIsSubmitted(false);
    onClose();
  };

  // Different content based on user role
  const renderContent = () => {
    // Guest users - need to create account
    if (isGuest) {
      return (
        <>
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>
            <DialogTitle className="text-center">{toolName} är låst</DialogTitle>
            <DialogDescription className="text-center">
              Du måste skapa ett konto för att använda detta verktyg.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={handleClose} variant="outline">
              Stäng
            </Button>
            <Button onClick={() => (window.location.href = "/auth")}>
              Skapa konto
            </Button>
          </DialogFooter>
        </>
      );
    }

    // Gen 1 users - can request access
    if (isGen1) {
      if (isSubmitted) {
        return (
          <>
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <DialogTitle className="text-center">Förfrågan skickad!</DialogTitle>
              <DialogDescription className="text-center">
                Vi har tagit emot din förfrågan om tillgång till Bildgenerator. Vi
                återkommer så snart som möjligt.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <Button onClick={handleClose}>Stäng</Button>
            </DialogFooter>
          </>
        );
      }

      return (
        <>
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center">
              Be om tillgång till Bildgenerator
            </DialogTitle>
            <DialogDescription className="text-center">
              Fyll i informationen nedan så återkommer vi så snart som möjligt.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Antal annonser per vecka <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="t.ex. 8"
                value={antalAnnonser}
                onChange={(e) => setAntalAnnonser(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="sm:justify-center gap-2">
            <Button variant="outline" onClick={handleClose}>
              Avbryt
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !isFormValid}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Skickar...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Skicka förfrågan
                </>
              )}
            </Button>
          </DialogFooter>
        </>
      );
    }

    // Intro or user role - just locked, no request option
    return (
      <>
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <DialogTitle className="text-center">{toolName} är låst</DialogTitle>
          <DialogDescription className="text-center">
            Detta verktyg är inte tillgängligt för din nuvarande roll. Kontakta
            oss om du har frågor.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={handleClose}>Stäng</Button>
        </DialogFooter>
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">{renderContent()}</DialogContent>
    </Dialog>
  );
};
