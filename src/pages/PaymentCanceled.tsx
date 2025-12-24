import { useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import DecorativeBackground from "@/components/DecorativeBackground";
import bilgenLogo from "@/assets/bilgen-logo.png";

const PaymentCanceled = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      <DecorativeBackground />

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={bilgenLogo} alt="Bilgen" className="h-12" />
          </div>

          {/* Canceled Icon */}
          <div className="mb-6 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-amber-400" />
            </div>
          </div>

          {/* Message */}
          <h1 className="text-3xl font-bold text-foreground mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Betalningen avbröts
          </h1>
          <p className="text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Du avbröt betalningen. Inga pengar har dragits från ditt konto. Du kan alltid komma tillbaka och slutföra köpet när du är redo.
          </p>

          {/* Actions */}
          <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button 
              size="lg" 
              onClick={() => navigate("/paket")}
              className="w-full gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Tillbaka till paket
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/start")}
              className="w-full"
            >
              Fortsätt med Beta
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCanceled;
