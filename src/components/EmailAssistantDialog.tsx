import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Loader2, Mail, Phone, User, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EmailAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CALENDAR_URL = "https://booking.setmore.com/scheduleappointment/65acf5f8-cc96-4a72-b498-2a8cc77108fd/services/s28f9bba1dec943bff29f0ddddfb19ee5bc52ea50?source=easyshare";

const EmailAssistantDialog = ({ open, onOpenChange }: EmailAssistantDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Fyll i alla fält",
        description: "Vänligen fyll i namn, e-post och telefonnummer.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("https://datavox.app.n8n.cloud/webhook/emailrequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          source: "landing_page_email_assistant",
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: "Förfrågan skickad!",
          description: "Vi återkommer till dig inom kort.",
        });
      } else {
        throw new Error("Webhook request failed");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Något gick fel",
        description: "Försök igen eller boka ett möte direkt.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookCalendar = () => {
    window.open(CALENDAR_URL, "_blank");
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form after closing
    setTimeout(() => {
      setFormData({ name: "", email: "", phone: "" });
      setIsSubmitted(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Koppla Email Assistant
          </DialogTitle>
          <DialogDescription>
            Fyll i dina uppgifter så hjälper vi dig att komma igång med email-assistenten.
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h3 className="text-lg font-semibold">Tack för din förfrågan!</h3>
            <p className="text-muted-foreground text-center">
              Vi återkommer till dig inom kort. Du kan även boka ett möte direkt.
            </p>
            <Button onClick={handleBookCalendar} variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Boka tid i kalendern
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Namn
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Ditt namn"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                E-postadress
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="din@email.se"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefonnummer
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="070-123 45 67"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Skickar...
                  </>
                ) : (
                  "Skicka förfrågan"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleBookCalendar}
                className="flex-1 gap-2"
              >
                <Calendar className="h-4 w-4" />
                Boka tid
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmailAssistantDialog;
