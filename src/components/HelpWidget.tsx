import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const HELP_TOPICS = [
  { id: "annons", label: "Skapa annonser" },
  { id: "research", label: "Research bilar" },
  { id: "email", label: "Skriva emails" },
];

const emailSchema = z.string()
  .trim()
  .min(5, { message: "E-postadress är för kort" })
  .max(255, { message: "E-postadress är för lång" })
  .email({ message: "Ogiltig e-postadress" })
  .refine((email) => {
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    const domain = parts[1];
    return domain.includes('.') && domain.length >= 4;
  }, { message: "Ogiltig domän" });

const HelpWidget = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [wantsPdf, setWantsPdf] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (value: string): boolean => {
    const result = emailSchema.safeParse(value);
    if (!result.success) {
      setEmailError(result.error.errors[0].message);
      return false;
    }
    setEmailError(null);
    return true;
  };

  const getTopicLabel = (topicId: string): string => {
    const topic = HELP_TOPICS.find(t => t.id === topicId);
    return topic?.label || topicId;
  };

  const handleSubmit = async () => {
    if (!selectedTopic) {
      toast.error("Välj ett ämne");
      return;
    }

    if (!validateEmail(email)) {
      return;
    }

    setIsSubmitting(true);
    
    const { error } = await supabase
      .from("help_requests")
      .insert({
        email: email.trim(),
        help_topic: selectedTopic,
        description: description.trim() || null,
        wants_pdf: wantsPdf
      });

    if (error) {
      toast.error("Kunde inte skicka förfrågan");
      setIsSubmitting(false);
      return;
    }

    // Send PDF guide if requested
    if (wantsPdf) {
      try {
        const { error: pdfError } = await supabase.functions.invoke("send-pdf-guide", {
          body: {
            email: email.trim(),
            helpTopic: getTopicLabel(selectedTopic),
            description: description.trim() || undefined
          }
        });

        if (pdfError) {
          console.error("PDF send error:", pdfError);
          toast.error("Förfrågan sparad, men kunde inte skicka PDF-guiden.");
        } else {
          toast.success("Tack! PDF-guiden har skickats till din email.");
        }
      } catch (err) {
        console.error("PDF send error:", err);
        toast.error("Förfrågan sparad, men kunde inte skicka PDF-guiden.");
      }
    } else {
      toast.success("Tack! Vi kontaktar dig snart.");
    }

    setEmail("");
    setDescription("");
    setSelectedTopic(null);
    setWantsPdf(false);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-start gap-2">
      {/* Hand-drawn curvy arrow pointing down */}
      <svg
        width="60"
        height="80"
        viewBox="0 0 60 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="ml-24"
        style={{ animation: "fade-in-up 0.6s ease-out forwards, wiggle 1.5s ease-in-out infinite" }}
      >
        {/* Curvy hand-drawn style arrow */}
        <path
          d="M30 5 C35 15, 40 25, 38 35 C36 45, 28 50, 30 60"
          stroke="hsl(var(--foreground))"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          strokeLinejoin="round"
        />
        {/* Arrow head */}
        <path
          d="M22 52 L30 65 L38 52"
          stroke="hsl(var(--foreground))"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {/* Help box */}
      <div className="max-w-[340px] rounded-xl bg-background/90 backdrop-blur-sm shadow-md border border-border p-5 animate-fade-in-up">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Behöver du hjälp?
        </h3>
        
        {/* Topic selection - single select radio style */}
        <div className="flex flex-col gap-2 mb-4">
          {HELP_TOPICS.map((topic) => {
            const isSelected = selectedTopic === topic.id;
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => setSelectedTopic(topic.id)}
                className={`px-4 py-2.5 text-sm rounded-lg border transition-all duration-200 text-left flex items-center gap-3 ${
                  isSelected
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background hover:border-foreground/50 text-foreground"
                }`}
              >
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? "border-background" : "border-muted-foreground"
                }`}>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-background" />}
                </span>
                {topic.label}
              </button>
            );
          })}
        </div>

        <Textarea
          placeholder="Beskriv vad du behöver hjälp med..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[80px] mb-3 resize-none bg-background border-border"
        />

        <div className="space-y-1 mb-3">
          <Input
            type="email"
            placeholder="Din e-postadress *"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) validateEmail(e.target.value);
            }}
            onBlur={() => email && validateEmail(email)}
            className={`bg-background border-border ${emailError ? "border-destructive" : ""}`}
            required
          />
          {emailError && (
            <p className="text-xs text-destructive">{emailError}</p>
          )}
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="wants-pdf"
            checked={wantsPdf}
            onCheckedChange={(checked) => setWantsPdf(checked === true)}
          />
          <label
            htmlFor="wants-pdf"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Skicka mig en PDF-guide till min email
          </label>
        </div>
        
        <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Skicka"}
        </Button>
      </div>
    </div>
  );
};

export default HelpWidget;
