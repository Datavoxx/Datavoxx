import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import DecorativeBackground from "@/components/DecorativeBackground";
import TemplateRequestForm from "@/components/TemplateRequestForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Sparkles, ImageIcon, Lock, Eye } from "lucide-react";

// Generic templates for users without custom templates
import genericMall1 from "@/assets/generic-mall-1.png";
import genericMall2 from "@/assets/generic-mall-2.png";
import genericMall3 from "@/assets/generic-mall-3.png";
import genericMall4 from "@/assets/generic-mall-4.png";

interface UserTemplate {
  id: string;
  name: string;
  template_url: string;
  display_order: number;
}

const genericTemplates = [
  { id: "generic-1", name: "Showroom Grå", image: genericMall1, isGeneric: true },
  { id: "generic-2", name: "Showroom Mörk", image: genericMall2, isGeneric: true },
  { id: "generic-3", name: "Showroom Premium", image: genericMall3, isGeneric: true },
  { id: "generic-4", name: "Showroom Ljus", image: genericMall4, isGeneric: true },
];

// Mapping between generic templates and their A2BIL example counterparts
const templateExamples: Record<string, {
  genericImage: string;
  genericName: string;
  exampleUrl: string;
  exampleName: string;
}> = {
  "generic-1": {
    genericImage: genericMall1,
    genericName: "Showroom Grå",
    exampleUrl: "https://bdzszxhhkktqmekmlkpv.supabase.co/storage/v1/object/public/templates/0cd269f7-10e0-460b-80c2-5f4a6ef2e9f3/mall-4.png.png",
    exampleName: "A2BIL Showroom Grå"
  },
  "generic-2": {
    genericImage: genericMall2,
    genericName: "Showroom Mörk",
    exampleUrl: "https://bdzszxhhkktqmekmlkpv.supabase.co/storage/v1/object/public/templates/0cd269f7-10e0-460b-80c2-5f4a6ef2e9f3/mall-1.png.png",
    exampleName: "A2BIL Showroom Dark"
  },
  "generic-3": {
    genericImage: genericMall3,
    genericName: "Showroom Premium",
    exampleUrl: "https://bdzszxhhkktqmekmlkpv.supabase.co/storage/v1/object/public/templates/0cd269f7-10e0-460b-80c2-5f4a6ef2e9f3/mall-3.png.png",
    exampleName: "A2BIL Showroom Mörk trä"
  },
  "generic-4": {
    genericImage: genericMall4,
    genericName: "Showroom Ljus",
    exampleUrl: "https://bdzszxhhkktqmekmlkpv.supabase.co/storage/v1/object/public/templates/0cd269f7-10e0-460b-80c2-5f4a6ef2e9f3/mall-2.png.png",
    exampleName: "A2BIL Showroom Ljus"
  }
};

const BildgeneratorMallar = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { user, isLoading: authLoading } = useAuth();
  
  const [userTemplates, setUserTemplates] = useState<UserTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [requestFormOpen, setRequestFormOpen] = useState(false);
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [selectedExampleTemplate, setSelectedExampleTemplate] = useState<string | null>(null);

  // Fetch user-specific templates from database
  useEffect(() => {
    const fetchUserTemplates = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("user_templates")
          .select("*")
          .eq("user_id", user.id)
          .order("display_order", { ascending: true });

        if (error) throw error;
        setUserTemplates(data || []);
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    if (user && !authLoading) {
      fetchUserTemplates();
    }
  }, [user, authLoading]);

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

  if (authLoading || roleLoading || isLoadingTemplates) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasCustomTemplates = userTemplates.length > 0;

  const handleSelectTemplate = (templateId: string, isGeneric: boolean, templateName: string) => {
    if (isGeneric) {
      // Open request form for generic templates
      setSelectedTemplateName(templateName);
      setRequestFormOpen(true);
    } else {
      // Navigate to bildgenerator with the selected template
      navigate(`/bildgenerator?mall=${templateId}`);
    }
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
              {hasCustomTemplates 
                ? "Välj en av dina showroom-bakgrunder" 
                : "Beställ din egen skräddarsydda mall"}
            </p>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hasCustomTemplates ? (
              // Show user's custom templates
              userTemplates.map((template) => (
                <Card
                  key={template.id}
                  onClick={() => handleSelectTemplate(template.id, false, template.name)}
                  className="group cursor-pointer border-2 border-transparent hover:border-purple-500 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl"
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={template.template_url}
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
              ))
            ) : (
              // Show generic templates with lock/request functionality
              genericTemplates.map((template) => (
                <Card
                  key={template.id}
                  onClick={() => handleSelectTemplate(template.id, true, template.name)}
                  className="group cursor-pointer border-2 border-transparent hover:border-purple-500 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl"
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={template.image}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Overlay indicating this is a request */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                          <Lock className="h-6 w-6 text-purple-600" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="flex items-center gap-2 text-white">
                          <Sparkles className="h-4 w-4" />
                          <span className="font-medium text-sm">Klicka för att beställa</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-card">
                      <h3 className="font-semibold text-foreground text-center">
                        {template.name}
                      </h3>
                      <p className="text-sm text-muted-foreground text-center mt-1">
                        Beställ med din logga
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExampleTemplate(template.id);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Se exempel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Info for users without templates */}
          {!hasCustomTemplates && (
            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                Klicka på en mall för att beställa din egen version med din logga.
                <br />
                Vi skapar den åt dig inom kort!
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Template Request Form */}
      <TemplateRequestForm
        open={requestFormOpen}
        onOpenChange={setRequestFormOpen}
        templateName={selectedTemplateName}
      />

      {/* Example Comparison Dialog */}
      <Dialog 
        open={selectedExampleTemplate !== null} 
        onOpenChange={(open) => !open && setSelectedExampleTemplate(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Exempel: {selectedExampleTemplate ? templateExamples[selectedExampleTemplate]?.genericName : ""}
            </DialogTitle>
            <DialogDescription>
              Jämför malldesignen med ett färdigt kundexempel
            </DialogDescription>
          </DialogHeader>
          {selectedExampleTemplate && templateExamples[selectedExampleTemplate] && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Left - Generic template (clean, no lock) */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground text-center">
                  Malldesign
                </p>
                <div className="relative aspect-video overflow-hidden rounded-lg border-2 border-dashed border-muted">
                  <img
                    src={templateExamples[selectedExampleTemplate].genericImage}
                    alt={templateExamples[selectedExampleTemplate].genericName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Med "DIN LOGGA" placeholder
                </p>
              </div>
              
              {/* Right - A2BIL finished example */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-purple-600 text-center">
                  Med din logga
                </p>
                <div className="relative aspect-video overflow-hidden rounded-lg border-2 border-purple-500">
                  <img
                    src={templateExamples[selectedExampleTemplate].exampleUrl}
                    alt={templateExamples[selectedExampleTemplate].exampleName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {templateExamples[selectedExampleTemplate].exampleName}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BildgeneratorMallar;
