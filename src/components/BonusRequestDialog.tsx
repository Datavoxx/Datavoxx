import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Gift, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface BonusRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateName: string;
}

const BonusRequestDialog = ({
  open,
  onOpenChange,
  templateName,
}: BonusRequestDialogProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [note, setNote] = useState("");

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Du måste vara inloggad");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("bonus_requests").insert({
        user_id: user.id,
        template_name: templateName,
        status: "pending",
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Din önskan har skickats!");

      // Close after showing success
      setTimeout(() => {
        setIsSuccess(false);
        setNote("");
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error("Error submitting bonus request:", error);
      toast.error("Något gick fel. Försök igen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsSuccess(false);
      setNote("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-amber-500" />
            Önskar bonus
          </DialogTitle>
          <DialogDescription>
            Skicka en förfrågan om att få tillgång till denna bonusmall
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-lg font-medium text-foreground">Tack för din önskan!</p>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Vi kommer att kontakta dig när mallen är redo.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Mall</Label>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="font-medium">{templateName}</p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Avbryt
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Skickar...
                  </>
                ) : (
                  <>
                    <Gift className="h-4 w-4 mr-2" />
                    Skicka önskan
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BonusRequestDialog;
