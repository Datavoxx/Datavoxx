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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import showroomTemplate1 from "@/assets/showroom-template-1.png";
import showroomTemplate2 from "@/assets/showroom-template-2.png";
import showroomTemplate3 from "@/assets/showroom-template-3.png";

interface ShowroomCustomizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const templates = [
  { id: "mall-1", label: "Mall 1 - Vita väggar", image: showroomTemplate1 },
  { id: "mall-2", label: "Mall 2 - Svarta draperier", image: showroomTemplate2 },
  { id: "mall-3", label: "Mall 3 - Bruna draperier", image: showroomTemplate3 },
];

export function ShowroomCustomizeDialog({ open, onOpenChange }: ShowroomCustomizeDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setLogoFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTemplate) {
      toast.error("Välj en mall");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("selectedTemplate", templates.find(t => t.id === selectedTemplate)?.label || selectedTemplate);
      formData.append("timestamp", new Date().toISOString());
      
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const response = await fetch("https://datavox.app.n8n.cloud/webhook-test/skraddarsyddshowroom", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Kunde inte skicka förfrågan");
      }

      setIsSubmitted(true);
      toast.success("Din förfrågan har skickats!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Något gick fel. Försök igen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setPhone("");
    setSelectedTemplate("");
    setLogoFile(null);
    setIsSubmitted(false);
    onOpenChange(false);
  };

  if (isSubmitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-xl mb-2">Tack för din förfrågan!</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Vi återkommer inom 24 timmar med din skräddarsydda showroom-mall.
            </DialogDescription>
            <Button onClick={handleClose} className="mt-6">
              Stäng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Skräddarsy din showroom</DialogTitle>
          <DialogDescription>
            Ladda upp din logga och välj en mall så skapar vi din unika showroom.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Ladda upp din logga</Label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label htmlFor="logo-upload" className="cursor-pointer">
                {logoFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={URL.createObjectURL(logoFile)}
                      alt="Uppladdad logga"
                      className="max-h-20 object-contain"
                    />
                    <span className="text-sm text-muted-foreground">{logoFile.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Dra och släpp eller klicka för att ladda upp
                    </span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-3">
            <Label>Välj mall</Label>
            <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <div className="grid grid-cols-1 gap-3">
                {templates.map((template) => (
                  <label
                    key={template.id}
                    className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <RadioGroupItem value={template.id} />
                    <img
                      src={template.image}
                      alt={template.label}
                      className="w-16 h-12 object-cover rounded"
                    />
                    <span className="text-sm font-medium">{template.label}</span>
                  </label>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Namn</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ditt namn"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
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
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="070-123 45 67"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
}
