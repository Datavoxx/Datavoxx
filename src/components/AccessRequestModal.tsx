import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Lock, Send, Loader2, CheckCircle, LogIn, UserPlus, Upload, Eye, X } from "lucide-react";
import { toast } from "sonner";
import genericMall4 from "@/assets/generic-mall-4.png";

const a2bilShowroomLjus = "https://bdzszxhhkktqmekmlkpv.supabase.co/storage/v1/object/public/exempel/showroom_ljust";

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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Check if user is gen_1 (can request access)
  const isGen1 = hasMinRole("gen_1") && !hasMinRole("gen_2");

  // Validation
  const isFormValid = antalAnnonser.trim() !== "";

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!user || !isFormValid) return;

    setIsSubmitting(true);
    try {
      // Get user info from profile
      const userName = profile?.display_name || user.email || "Okänd";
      const userEmail = profile?.email || user.email || "";

      // Send to n8n webhook with logo as binary file (FormData)
      const formData = new FormData();
      formData.append("name", userName);
      formData.append("email", userEmail);
      formData.append("antalAnnonser", antalAnnonser.trim());
      formData.append("toolName", toolName);
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const webhookResponse = await fetch(
        "https://datavox.app.n8n.cloud/webhook/atkomstbildgenerator",
        {
          method: "POST",
          body: formData, // Browser sätter rätt Content-Type: multipart/form-data
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
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
          <DialogFooter className="sm:justify-center gap-2">
            <Button onClick={handleClose} variant="outline">
              Stäng
            </Button>
            <Button 
              onClick={() => (window.location.href = "/auth")} 
              variant="secondary"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Logga in
            </Button>
            <Button onClick={() => (window.location.href = "/auth?mode=signup")}>
              <UserPlus className="h-4 w-4 mr-2" />
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

          <div className="py-4 space-y-4">
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

            {/* Logo upload */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Ladda upp din logotyp
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
              />
              {logoPreview ? (
                <div className="relative w-full h-24 border border-border rounded-lg overflow-hidden bg-muted">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-contain p-2"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                >
                  <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Klicka för att ladda upp
                  </p>
                </div>
              )}
            </div>

            {/* Se exempel */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Se exempel</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div 
                    className="border border-border rounded-lg overflow-hidden bg-slate-100 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                    onClick={() => setLightboxImage(genericMall4)}
                  >
                    <img
                      src={genericMall4}
                      alt="Din logga exempel"
                      className="w-full h-24 object-cover"
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Din logga</p>
                </div>
                <div className="space-y-1">
                  <div 
                    className="border border-border rounded-lg overflow-hidden bg-slate-100 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                    onClick={() => setLightboxImage(a2bilShowroomLjus)}
                  >
                    <img
                      src={a2bilShowroomLjus}
                      alt="A2BIL exempel"
                      className="w-full h-24 object-cover"
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground">A2BIL</p>
                </div>
              </div>
            </div>

            {/* Lightbox */}
            {lightboxImage && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                onClick={() => setLightboxImage(null)}
              >
                <div className="relative max-w-4xl max-h-[90vh]">
                  <img
                    src={lightboxImage}
                    alt="Exempel i fullstorlek"
                    className="max-w-full max-h-[90vh] object-contain rounded-lg"
                  />
                  <button
                    onClick={() => setLightboxImage(null)}
                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
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
