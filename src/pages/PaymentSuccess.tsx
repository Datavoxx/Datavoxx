import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import DecorativeBackground from "@/components/DecorativeBackground";
import bilgenLogo from "@/assets/bilgen-logo.png";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    console.log("Payment successful, session ID:", sessionId);
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      <DecorativeBackground />

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={bilgenLogo} alt="Bilgen" className="h-12" />
          </div>

          {/* Success Icon */}
          <div className="mb-6 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
          </div>

          {/* Message */}
          <h1 className="text-3xl font-bold text-foreground mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Betalningen lyckades!
          </h1>
          <p className="text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Tack för att du valde Bilgen! Din prenumeration är nu aktiv och du har tillgång till alla funktioner i ditt paket.
          </p>

          {/* Actions */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button 
              size="lg" 
              onClick={() => navigate("/start")}
              className="w-full gap-2"
            >
              Börja använda Bilgen
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/paket")}
              className="w-full"
            >
              Se din prenumeration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
