import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send, Loader2, Car } from "lucide-react";

interface BookDemoFormProps {
  open: boolean;
  onClose: () => void;
}

const BookDemoForm = ({ open, onClose }: BookDemoFormProps) => {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error("Vänligen fyll i alla obligatoriska fält");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Vänligen ange en giltig e-postadress");
      return;
    }

    setIsLoading(true);

    const payload = {
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
      submitted_at: new Date().toISOString(),
      source: "bilgen_landing_page"
    };

    try {
      await fetch("https://datavox.app.n8n.cloud/webhook-test/formular-bilgen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify(payload)
      });

      toast.success("Tack! Vi hör av oss inom 24 timmar.");
      
      // Reset form
      setName("");
      setCompany("");
      setEmail("");
      setPhone("");
      setMessage("");
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Något gick fel. Försök igen.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Car className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold">Boka en demo</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fyll i dina uppgifter så hör vi av oss inom 24 timmar
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Namn *</Label>
            <Input
              id="name"
              placeholder="Ditt namn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Företag</Label>
            <Input
              id="company"
              placeholder="Företagsnamn"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={isLoading}
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-post *</Label>
            <Input
              id="email"
              type="email"
              placeholder="din@email.se"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="070-123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Meddelande (valfritt)</Label>
            <Textarea
              id="message"
              placeholder="Berätta gärna lite om era behov..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
              className="bg-background/50 min-h-[80px] resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full gap-2 bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Skickar...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Skicka förfrågan
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            * Obligatoriska fält
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookDemoForm;
