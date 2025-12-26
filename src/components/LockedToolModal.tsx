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
import { useNavigate } from "react-router-dom";
import { Lock, LogIn, UserPlus } from "lucide-react";

interface LockedToolModalProps {
  open: boolean;
  onClose: () => void;
  toolName: string;
}

export const LockedToolModal = ({ open, onClose, toolName }: LockedToolModalProps) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate("/auth");
  };

  const handleSignUp = () => {
    onClose();
    navigate("/auth?mode=signup");
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-muted">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-xl">
            {toolName} är låst
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Skapa ett konto eller logga in för att få tillgång till {toolName} och fler funktioner.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <AlertDialogCancel 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Avbryt
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogin}
            className="w-full sm:w-auto bg-secondary hover:bg-secondary/90"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Logga in
          </AlertDialogAction>
          <AlertDialogAction
            onClick={handleSignUp}
            className="w-full sm:w-auto"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Skapa konto
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
