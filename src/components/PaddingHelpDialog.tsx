import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import paddingBefore from "@/assets/padding-before.png";
import paddingAfter from "@/assets/padding-after.png";

const PaddingHelpDialog = () => {
  const [activeTab, setActiveTab] = useState<"before" | "after">("before");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground gap-1"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="text-xs">Vad är padding?</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Så fungerar padding-justeringarna</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tab buttons */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === "before" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("before")}
              className="flex-1"
            >
              Före justering
            </Button>
            <Button
              variant={activeTab === "after" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("after")}
              className="flex-1"
            >
              Efter justering
            </Button>
          </div>

          {/* Image display */}
          <div className="relative rounded-lg overflow-hidden border bg-muted/30">
            {activeTab === "before" ? (
              <div className="space-y-3">
                <div className="relative">
                  <img
                    src={paddingBefore}
                    alt="Padding före justering"
                    className="w-full rounded-lg"
                  />
                  {/* Arrow overlay - Nedåt */}
                  <div className="absolute left-8 top-[35%] flex flex-col items-center gap-1 animate-pulse">
                    <div className="bg-green-500/90 text-white text-xs font-medium px-2 py-1 rounded shadow-lg">
                      Måste ner
                    </div>
                    <svg className="w-8 h-12 text-green-500 drop-shadow-lg" viewBox="0 0 24 36" fill="currentColor">
                      <path d="M12 0 L12 28 M4 20 L12 32 L20 20" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {/* Arrow overlay - Sänk position */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 animate-pulse" style={{ animationDelay: '0.5s' }}>
                    <svg className="w-10 h-8 text-green-500 drop-shadow-lg" viewBox="0 0 30 24" fill="currentColor">
                      <path d="M28 12 L6 12 M12 4 L2 12 L12 20" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div className="bg-green-500/90 text-white text-xs font-medium px-2 py-1 rounded shadow-lg">
                      Sänk position
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-b-lg">
                  <p className="text-sm font-medium text-foreground">
                    Padding: 0.25 & 0.25
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Bilen är för högt upp och för liten - behöver justeras!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <img
                  src={paddingAfter}
                  alt="Padding efter justering"
                  className="w-full rounded-lg"
                />
                <div className="p-4 bg-muted/50 rounded-b-lg">
                  <p className="text-sm font-medium text-foreground">
                    Padding: 0.20 & 0.10
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Bilen är justerad för bästa placering i mallen.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Storlek (padding)
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Lägre värde = större bil
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Position (padding bottom)
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Lägre värde = bilen hamnar längre ner
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaddingHelpDialog;
