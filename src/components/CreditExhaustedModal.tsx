import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Zap, Clock, ArrowRight } from "lucide-react";

interface CreditExhaustedModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreditExhaustedModal = ({ open, onClose }: CreditExhaustedModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onClose();
    navigate("/paket");
  };

  const handleLogin = () => {
    onClose();
    navigate("/auth");
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mx-auto mb-4">
            <Zap className="h-6 w-6 text-destructive" />
          </div>
          <AlertDialogTitle className="text-center">
            Dina credits är slut för idag
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-4">
            <p>
              Du har använt alla dina dagliga credits. 
            </p>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Återställs automatiskt vid midnatt</span>
            </div>
            
            {!user ? (
              <div className="bg-primary/10 rounded-lg p-4 mt-4">
                <p className="font-medium text-foreground mb-1">
                  Vill du ha fler credits?
                </p>
                <p className="text-sm">
                  Logga in för att få 20 credits/dag istället för 5!
                </p>
              </div>
            ) : (
              <div className="bg-primary/10 rounded-lg p-4 mt-4">
                <p className="font-medium text-foreground mb-1">
                  Uppgradera för fler credits
                </p>
                <p className="text-sm">
                  Gen 1: 120 credits/dag • Gen 2: 300 credits/dag
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onClose}>
            Vänta till midnatt
          </AlertDialogCancel>
          {!user ? (
            <AlertDialogAction onClick={handleLogin} className="gap-2">
              Logga in
              <ArrowRight className="h-4 w-4" />
            </AlertDialogAction>
          ) : (
            <AlertDialogAction onClick={handleUpgrade} className="gap-2">
              Se paket
              <ArrowRight className="h-4 w-4" />
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
