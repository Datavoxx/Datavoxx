import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import AppHeader from "@/components/AppHeader";
import DecorativeBackground from "@/components/DecorativeBackground";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, ImageIcon } from "lucide-react";

import mall1 from "@/assets/mall-1.png";
import mall2 from "@/assets/mall-2.png";
import mall3 from "@/assets/mall-3.png";

const templates = [
  { id: 1, name: "A2BIL Showroom Dark", image: mall1 },
  { id: 2, name: "A2BIL Showroom Grå", image: mall2 },
  { id: 3, name: "A2BIL Showroom Ljus", image: mall3 },
];

const BildgeneratorMallar = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { user, isLoading: authLoading } = useAuth();

  // Redirect non-admin users
  if (!authLoading && !roleLoading) {
    if (!user) {
      navigate("/auth");
      return null;
    }
    if (!isAdmin) {
      navigate("/start");
      return null;
    }
  }

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSelectTemplate = (templateId: number) => {
    navigate(`/bildgenerator?mall=${templateId}`);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-muted/30 to-background animate-fade-in">
      <DecorativeBackground />
      <AppHeader showBackButton />

      <main className="relative flex flex-col items-center px-6 pt-24 pb-16">
        <div className="w-full max-w-5xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Admin-verktyg</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">
              Välj bakgrundsmall
            </h1>
            <p className="text-lg text-muted-foreground">
              Välj en showroom-bakgrund för din bildgenerering
            </p>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                className="group cursor-pointer border-2 border-transparent hover:border-purple-500 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl"
              >
                <CardContent className="p-0">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={template.image}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center gap-2 text-white">
                        <ImageIcon className="h-4 w-4" />
                        <span className="font-medium">Välj denna mall</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-card">
                    <h3 className="font-semibold text-foreground text-center">
                      {template.name}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BildgeneratorMallar;
