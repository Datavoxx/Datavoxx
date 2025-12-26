import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Upload, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface TemplateRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateName: string;
}

const WEBHOOK_URL = "https://datavox.app.n8n.cloud/webhook/mallvaljande";

const getResponseTimeMessage = (): string => {
  const now = new Date();
  const hour = now.getHours();
  
  // Between 09:00 and 00:00 (midnight)
  if (hour >= 9 && hour < 24) {
    return "Vi svarar inom 2 timmar";
  }
  // Between 00:00 and 09:00
  return "Vi svarar senast kl 09:00";
};

const TemplateRequestForm = ({ open, onOpenChange, templateName }: TemplateRequestFormProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName || !email) {
      toast.error("Fyll i företagsnamn och e-post");
      return;
    }

    if (!logoFile) {
      toast.error("Ladda upp din logga");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload logo to storage
      const logoFileName = `${user?.id || 'anonymous'}-${Date.now()}-${logoFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("templates")
        .upload(`logo-requests/${logoFileName}`, logoFile);

      if (uploadError) {
        throw new Error("Kunde inte ladda upp loggan");
      }

      // Get public URL for the logo
      const { data: urlData } = supabase.storage
        .from("templates")
        .getPublicUrl(`logo-requests/${logoFileName}`);

      const logoUrl = urlData.publicUrl;

      // Save to database and get the request ID
      const { data: requestData, error: dbError } = await supabase
        .from("template_requests")
        .insert({
          user_id: user?.id,
          company_name: companyName,
          email: email,
          phone: phone || null,
          logo_url: logoUrl,
          status: "pending",
        })
        .select('id')
        .single();

      if (dbError) {
        throw new Error("Kunde inte spara förfrågan");
      }

      // Send to webhook with request_id for callback
      const formData = new FormData();
      formData.append("company_name", companyName);
      formData.append("email", email);
      formData.append("phone", phone || "");
      formData.append("template_name", templateName);
      formData.append("logo_url", logoUrl);
      formData.append("user_id", user?.id || "anonymous");
      formData.append("request_id", requestData.id);
      formData.append("logo", logoFile);

      await fetch(WEBHOOK_URL, {
        method: "POST",
        body: formData,
      });

      setIsSubmitted(true);
      toast.success("Förfrågan skickad!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Ett fel uppstod. Försök igen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form after closing
    setTimeout(() => {
      setCompanyName("");
      setEmail("");
      setPhone("");
      setLogoFile(null);
      setLogoPreview(null);
      setIsSubmitted(false);
    }, 300);
  };

  if (isSubmitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Tack för din förfrågan!</h3>
            <p className="text-muted-foreground mb-4">
              Vi har tagit emot din beställning för en skräddarsydd mall.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">{getResponseTimeMessage()}</span>
            </div>
            <Button onClick={handleClose} className="mt-6 w-full">
              Stäng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Beställ din egen mall</DialogTitle>
          <DialogDescription>
            Fyll i dina uppgifter så skapar vi en skräddarsydd mall med din logga.
          </DialogDescription>
        </DialogHeader>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm mb-4">
          <Clock className="h-4 w-4" />
          <span className="font-medium">{getResponseTimeMessage()}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Företagsnamn *</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ditt företagsnamn"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-post *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="din@email.se"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon (valfritt)</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="070-123 45 67"
            />
          </div>

          <div className="space-y-2">
            <Label>Din logga *</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                accept="image/*"
                className="hidden"
              />
              {logoPreview ? (
                <div className="space-y-3">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-h-24 mx-auto rounded-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Klicka för att byta
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Klicka för att ladda upp din logga
                  </p>
                </div>
              )}
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Skickar...
              </>
            ) : (
              "Skicka förfrågan"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateRequestForm;
