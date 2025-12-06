import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SERVICES = [
  { id: "annons", label: "Bilannonsgenerator" },
  { id: "research", label: "Bil Research Expert" },
  { id: "email", label: "Email Assistent" },
];

const FeedbackWidget = () => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleServiceClick = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = async () => {
    if (!email.trim() || !message.trim()) {
      toast.error("Fyll i både e-post och meddelande");
      return;
    }

    setIsSubmitting(true);
    
    const { error } = await supabase
      .from("feedback")
      .insert({
        email: email.trim(),
        services: selectedServices,
        message: message.trim()
      });

    if (error) {
      toast.error("Kunde inte skicka feedback");
    } else {
      toast.success("Tack för din feedback!");
      setEmail("");
      setMessage("");
      setSelectedServices([]);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-end gap-2">
      {/* Hand-drawn curvy arrow pointing down */}
      <svg
        width="60"
        height="80"
        viewBox="0 0 60 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-fade-in-up animate-wiggle mr-24"
        style={{ animation: "fade-in-up 0.6s ease-out forwards, wiggle 1.5s ease-in-out infinite" }}
      >
        {/* Curvy hand-drawn style arrow */}
        <path
          d="M30 5 C25 15, 20 25, 22 35 C24 45, 32 50, 30 60"
          stroke="#000000"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          strokeLinejoin="round"
          style={{ strokeDasharray: "none" }}
        />
        {/* Arrow head */}
        <path
          d="M22 52 L30 65 L38 52"
          stroke="#000000"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {/* Feedback box */}
      <div className="max-w-[340px] rounded-xl bg-white/90 backdrop-blur-sm shadow-md border border-border p-5 animate-fade-in-up">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Vad tycker du om appen?
        </h3>
        
        {/* Service chips - multi-select */}
        <div className="flex flex-wrap gap-2 mb-3">
          {SERVICES.map((service) => {
            const isSelected = selectedServices.includes(service.id);
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => handleServiceClick(service.id)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background hover:border-foreground/50 text-foreground"
                }`}
              >
                {isSelected && <Check className="h-3.5 w-3.5" />}
                {service.label}
              </button>
            );
          })}
        </div>

        <Textarea
          placeholder="Skriv din feedback här..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[100px] mb-3 resize-none bg-white border-border"
        />
        
        <Input
          type="email"
          placeholder="Din e-postadress *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 bg-white border-border"
          required
        />
        
        <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Skicka feedback"}
        </Button>
      </div>
    </div>
  );
};

export default FeedbackWidget;
