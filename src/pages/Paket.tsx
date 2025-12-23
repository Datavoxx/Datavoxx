import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Sparkles, Crown, Rocket, Send, Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DecorativeBackground from "@/components/DecorativeBackground";
import bilgenLogo from "@/assets/bilgen-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";

const Paket = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isLoading: isRoleLoading } = useUserRole();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Fyll i alla fält",
        description: "Både namn och email krävs.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("package_waitlist")
        .insert({ name: name.trim(), email: email.trim() });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Tack för din anmälan! 🎉",
        description: "Du är nu på listan och kommer få ett mail när vi lanserar.",
      });
    } catch (error) {
      console.error("Error submitting to waitlist:", error);
      toast({
        title: "Något gick fel",
        description: "Försök igen senare.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const packages = [
    {
      name: "Gen 1",
      icon: Rocket,
      features: ["Grundläggande verktyg", "Email-support", "5 annonser/månad", "Bil Research Basic"],
      price: "999",
      blur: "blur-[6px]",
      priceBlur: "blur-[10px]",
      bgClass: "bg-white/10",
      borderClass: "border-white/20",
    },
    {
      name: "Gen 2",
      icon: Sparkles,
      features: ["Alla Gen 1 funktioner", "Obegränsade annonser", "Prioriterad support", "AI Email-assistent", "Avancerad Research"],
      price: "2799",
      popular: true,
      blur: "blur-[6px]",
      priceBlur: "blur-[10px]",
      bgClass: "bg-white/10",
      borderClass: "border-primary/30",
    },
    {
      name: "Gen 3",
      icon: Crown,
      features: ["Alla Gen 2 funktioner", "White-label lösning", "Dedikerad account manager", "Custom AI-träning", "API-access", "Enterprise support"],
      price: "Kontakta oss",
      blur: "blur-[8px]",
      priceBlur: "blur-[12px]",
      bgClass: "bg-gradient-to-br from-gray-800 via-gray-900 to-black",
      borderClass: "border-gray-600/50",
      dark: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <DecorativeBackground />

      {/* Header */}
      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Tillbaka
        </Button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-16">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={bilgenLogo} alt="Bilgen" className="h-12 md:h-14" />
        </div>

        {/* Beta Badge or Admin Badge */}
        <div className="flex justify-center mb-6">
          {isAdmin ? (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium">
              <Shield className="w-4 h-4" />
              Admin-vy
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-medium animate-pulse">
              <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
              Du använder Beta-versionen
            </span>
          )}
        </div>

        {/* Teaser Text */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 animate-fade-in">
            Trött på beta-varianten?
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Redo för de <span className="text-primary font-semibold">fullständiga verktygen</span>?
          </p>
          <p className="text-muted-foreground mt-2 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Snart lanserar vi <span className="font-bold text-foreground">3 kraftfulla paket</span> anpassade för din verksamhet
          </p>
        </div>

        {/* Package Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {packages.map((pkg, index) => (
            <div
              key={pkg.name}
              className={`relative rounded-2xl border ${pkg.borderClass} overflow-hidden animate-fade-in`}
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                  <span className={`px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full ${isAdmin ? '' : 'blur-[2px]'}`}>
                    POPULÄRAST
                  </span>
                </div>
              )}

              {/* Card Content */}
              <div className={`${pkg.bgClass} p-6 h-full`}>
                <div className={`${isAdmin ? '' : pkg.blur} ${isAdmin ? '' : 'select-none pointer-events-none'}`}>
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl ${pkg.dark ? 'bg-white/20' : 'bg-primary/20'} flex items-center justify-center mb-4`}>
                    <pkg.icon className={`h-6 w-6 ${pkg.dark ? 'text-white' : 'text-primary'}`} />
                  </div>

                  {/* Name */}
                  <h3 className={`text-2xl font-bold mb-2 ${pkg.dark ? 'text-white' : 'text-foreground'}`}>
                    {pkg.name}
                  </h3>

                  {/* Price */}
                  <div className={`mb-4 ${isAdmin ? '' : pkg.priceBlur}`}>
                    {pkg.price === "Kontakta oss" ? (
                      <span className={`text-2xl font-bold ${pkg.dark ? 'text-white' : 'text-foreground'}`}>
                        Kontakta oss
                      </span>
                    ) : (
                      <>
                        <span className={`text-3xl font-bold ${pkg.dark ? 'text-white' : 'text-foreground'}`}>
                          {pkg.price} kr
                        </span>
                        <span className={`text-sm ${pkg.dark ? 'text-white/70' : 'text-muted-foreground'}`}>/månad</span>
                      </>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className={`flex items-center gap-2 text-sm ${pkg.dark ? 'text-white/80' : 'text-muted-foreground'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${pkg.dark ? 'bg-white/60' : 'bg-primary/60'}`}></span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Button */}
                  <Button 
                    className={`w-full ${pkg.dark ? 'bg-white/20 text-white hover:bg-white/30' : ''}`}
                    variant={pkg.popular ? "default" : "outline"}
                    disabled={!isAdmin}
                  >
                    {pkg.price === "Kontakta oss" ? "Kontakta oss" : `Välj ${pkg.name}`}
                  </Button>
                </div>

                {/* Lock Overlay - Only for non-admin */}
                {!isAdmin && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                    <div className={`p-4 rounded-full ${pkg.dark ? 'bg-black/60' : 'bg-background/80'} border border-white/10 shadow-xl`}>
                      <Lock className={`h-8 w-8 ${pkg.dark ? 'text-white/60' : 'text-muted-foreground'}`} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Waitlist Signup Box */}
        <div className="max-w-xl mx-auto mb-16 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <div className="relative p-8 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 backdrop-blur-sm">
            {/* Decorative star */}
            <div className="absolute -top-3 -right-3">
              <Star className="h-6 w-6 text-primary fill-primary animate-pulse" />
            </div>
            
            {!isSubmitted ? (
              <>
                <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-2">
                  Bli först att testa <span className="text-primary">"the real deal"</span>
                </h2>
                <p className="text-muted-foreground text-center mb-6">
                  Anmäl dig till vår waitlist och få exklusiv tidig tillgång
                </p>
                
                <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      type="text"
                      placeholder="Ditt namn"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-background/50 border-white/20 focus:border-primary"
                      maxLength={100}
                    />
                    <Input
                      type="email"
                      placeholder="Din email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background/50 border-white/20 focus:border-primary"
                      maxLength={255}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Skickar..."
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Jag vill vara först!
                      </>
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Star className="h-8 w-8 text-green-400 fill-green-400" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Du är på listan! 🚀
                </h2>
                <p className="text-muted-foreground">
                  Vi hör av oss så snart paketen är redo för lansering.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center animate-fade-in" style={{ animationDelay: "0.7s" }}>
          <p className="text-muted-foreground mb-4">
            Vill du fortsätta testa beta-versionen?
          </p>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/start")}
            className="gap-2"
          >
            Fortsätt med Beta
            <ArrowLeft className="h-5 w-5 rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Paket;
