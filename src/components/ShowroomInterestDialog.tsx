import { useState, useRef } from "react";
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
import { Loader2, Send, Upload, X, ImageIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Import images
import showroomBg1 from "@/assets/showroom-bg-1.png";
import showroomBg2 from "@/assets/showroom-bg-2.png";

interface ShowroomInterestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const showroomBackgrounds = [
  { id: 1, name: "Showroom 1", src: showroomBg1 },
  { id: 2, name: "Showroom 2", src: showroomBg2 },
];

export function ShowroomInterestDialog({ open, onOpenChange }: ShowroomInterestDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedLogo, setUploadedLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ src: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setUploadedLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeLogo = () => {
    setUploadedLogo(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      formData.append("timestamp", new Date().toISOString());
      formData.append("source", "landing_page_showroom");
      formData.append("hasLogo", uploadedLogo ? "true" : "false");

      if (uploadedLogo) {
        formData.append("logo", uploadedLogo, uploadedLogo.name);
      }

      await fetch("https://datavox.app.n8n.cloud/webhook/showroomintresse", {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });

      toast({
        title: "Tack för ditt intresse!",
        description: "Vi kontaktar dig inom kort.",
      });

      setName("");
      setEmail("");
      setPhone("");
      setUploadedLogo(null);
      setLogoPreview(null);
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">Skaffa din egna showroom</DialogTitle>
            <DialogDescription>
              Fyll i dina uppgifter så kontaktar vi dig för att komma igång med din showroom.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
            <div className="space-y-6 mt-4">
              {/* Logo Upload Section */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Lägg din logo
                </Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/30"
                >
                  {logoPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={logoPreview}
                        alt="Uppladdad logo"
                        className="max-h-24 max-w-full object-contain mx-auto"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLogo();
                        }}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Dra och släpp din logo här</p>
                      <p className="text-xs mt-1">eller klicka för att välja fil</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Showroom Backgrounds Gallery */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Showroom bakgrunder
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  {showroomBackgrounds.map((bg) => (
                    <div
                      key={bg.id}
                      onClick={() => setSelectedImage({ src: bg.src, name: bg.name })}
                      className="cursor-pointer rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all hover:shadow-lg"
                    >
                      <img
                        src={bg.src}
                        alt={bg.name}
                        className="w-full h-32 sm:h-48 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact Form */}
              <div className="border-t border-border pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                }}
                className="absolute top-4 right-4 text-white hover:text-white/80 z-10"
              >
                <X className="h-8 w-8" />
              </button>
          <img
            src={selectedImage.src}
            alt={selectedImage.name}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
