import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import DecorativeBackground from "@/components/DecorativeBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, HelpCircle } from "lucide-react";

const VadArPadding = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-muted/30 to-background animate-fade-in">
      <DecorativeBackground />
      <AppHeader showBackButton />

      <main className="relative flex flex-col items-center px-6 pt-24 pb-16">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 mb-4">
              <HelpCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Hjälp</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">
              Vad är padding?
            </h1>
            <p className="text-muted-foreground">
              En snabb guide till padding-inställningarna i bildgeneratorn
            </p>
          </div>

          {/* Content Card */}
          <Card className="mb-6 border-purple-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-purple-600" />
                Förklaring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground leading-relaxed">
                {/* Placeholder text - användaren kommer ge mer detaljerade instruktioner */}
                Padding är det utrymme som läggs till runt din bild när den genereras. 
                Genom att justera padding kan du kontrollera hur mycket av bakgrundsmallen 
                som syns runt din uppladdade bild.
              </p>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Padding (övre)</h3>
                <p className="text-muted-foreground">
                  Kontrollerar utrymmet på sidorna och toppen av bilden.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Padding Bottom</h3>
                <p className="text-muted-foreground">
                  Kontrollerar utrymmet under bilden, vilket kan vara användbart 
                  för att ge plats åt text eller logotyper.
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-purple-700">
                  <strong>Tips:</strong> Börja med standardvärdena och justera 
                  gradvis tills du får det resultat du vill ha.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="border-purple-200 hover:bg-purple-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Tillbaka till bildgeneratorn
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VadArPadding;
