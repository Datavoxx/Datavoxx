import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Calendar } from "lucide-react";

interface BookDemoFormProps {
  open: boolean;
  onClose: () => void;
}

const BookDemoForm = ({ open, onClose }: BookDemoFormProps) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] bg-background/95 backdrop-blur-xl border-border/50 p-0 overflow-hidden">
        <DialogHeader className="text-center p-6 pb-2">
          <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold">Boka nulägesanalys</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Välj mellan 30 eller 60 minuters kostnadsfri genomgång
          </DialogDescription>
        </DialogHeader>

        <div className="w-full h-[600px] overflow-hidden">
          <iframe
            src="https://datavoxx.setmore.com/"
            title="Boka nulägesanalys"
            className="w-full h-full border-0"
            allow="payment"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookDemoForm;
