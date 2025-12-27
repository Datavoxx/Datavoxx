import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Calendar, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailConnectionRequestProps {
  userId: string;
}

const SETMORE_CALENDAR_URL = "https://datavoxx.setmore.com/services/2b491979-c452-45e3-b559-3e5b1934fbfa";

const EmailConnectionRequest: React.FC<EmailConnectionRequestProps> = ({ userId }) => {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCallMeBack = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error("Vänligen fyll i alla fält");
      return;
    }

    setIsSubmitting(true);
    try {
      // Send webhook to n8n
      const webhookResponse = await fetch("https://datavox.app.n8n.cloud/webhook/emailskapa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          type: "callback_request",
          timestamp: new Date().toISOString(),
        }),
      });

      if (!webhookResponse.ok) {
        console.error("Webhook failed:", webhookResponse.status);
      }

      // Also save to database
      const { error } = await supabase
        .from("email_connection_requests")
        .insert({
          user_id: userId,
          request_type: "callback",
          contact_name: formData.name.trim(),
          email_address: formData.email.trim(),
          phone_number: formData.phone.trim(),
          status: "pending"
        });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Tack! Vi ringer upp dig så snart vi kan.");
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Något gick fel. Försök igen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookCalendar = () => {
    window.open(SETMORE_CALENDAR_URL, "_blank");
  };

  // Success state
  if (isSubmitted) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Tack för din förfrågan!</h3>
              <p className="text-muted-foreground mt-1">
                Vi ringer upp dig så snart vi kan.
              </p>
            </div>
            <Button variant="outline" onClick={handleBookCalendar} className="mt-2">
              <Calendar className="h-4 w-4 mr-2" />
              Eller boka en tid direkt
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Initial state - show button to open form
  if (!showForm) {
    return (
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => setShowForm(true)}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Koppla din e-post</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Låt oss hjälpa dig komma igång med e-postassistenten
              </p>
            </div>
            <Button className="mt-2">
              Kom igång
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Form state
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Koppla din e-post
        </CardTitle>
        <CardDescription>
          Fyll i dina uppgifter så hjälper vi dig att komma igång
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Namn</Label>
          <Input
            id="name"
            name="name"
            placeholder="Ditt namn"
            value={formData.name}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">E-postadress</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="din@email.se"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Telefonnummer</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="070-123 45 67"
            value={formData.phone}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            onClick={handleCallMeBack} 
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Phone className="h-4 w-4 mr-2" />
            )}
            Ring mig
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleBookCalendar}
            className="flex-1"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Boka tid i kalendern
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailConnectionRequest;
