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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";

interface ShowroomInterestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShowroomInterestDialog({ open, onOpenChange }: ShowroomInterestDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast({
        title: "Fyll i alla fält",
        description: "Alla fält måste fyllas i för att skicka intresseanmälan.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await fetch("https://datavox.app.n8n.cloud/webhook/showroomintresse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          timestamp: new Date().toISOString(),
          source: "landing_page_showroom",
        }),
      });

      toast({
        title: "Tack för ditt intresse!",
        description: "Vi kontaktar dig inom kort.",
      });

      setName("");
      setEmail("");
      setPhone("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Något gick fel",
        description: "Försök igen senare eller kontakta oss direkt.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Skaffa din egna showroom</DialogTitle>
          <DialogDescription>
            Fyll i dina uppgifter så kontaktar vi dig för att komma igång med din showroom.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Namn</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ditt namn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="din@email.se"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefonnummer</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="070-123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Skickar...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Skicka intresseanmälan
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
