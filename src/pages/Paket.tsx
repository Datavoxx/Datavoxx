import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Sparkles, Crown, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import DecorativeBackground from "@/components/DecorativeBackground";
import bilgenLogo from "@/assets/bilgen-logo.png";

const Paket = () => {
  const navigate = useNavigate();

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
      price: null,
      blur: "blur-[8px]",
      priceBlur: "blur-[12px]",
      bgClass: "bg-black/90",
      borderClass: "border-black/50",
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

        {/* Beta Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-medium animate-pulse">
            <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
            Du använder Beta-versionen
          </span>
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
                  <span className="px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full blur-[2px]">
                    POPULÄRAST
                  </span>
                </div>
              )}

              {/* Card Content - Blurred */}
              <div className={`${pkg.bgClass} p-6 h-full`}>
                <div className={`${pkg.blur} select-none pointer-events-none`}>
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl ${pkg.dark ? 'bg-white/10' : 'bg-primary/20'} flex items-center justify-center mb-4`}>
                    <pkg.icon className={`h-6 w-6 ${pkg.dark ? 'text-white/70' : 'text-primary'}`} />
                  </div>

                  {/* Name */}
                  <h3 className={`text-2xl font-bold mb-2 ${pkg.dark ? 'text-white/80' : 'text-foreground'}`}>
                    {pkg.name}
                  </h3>

                  {/* Price */}
                  {pkg.price && (
                    <div className={`mb-4 ${pkg.priceBlur}`}>
                      <span className={`text-3xl font-bold ${pkg.dark ? 'text-white/70' : 'text-foreground'}`}>
                        {pkg.price} kr
                      </span>
                      <span className={`text-sm ${pkg.dark ? 'text-white/50' : 'text-muted-foreground'}`}>/månad</span>
                    </div>
                  )}
                  {!pkg.price && (
                    <div className={`mb-4 ${pkg.priceBlur}`}>
                      <span className={`text-3xl font-bold ${pkg.dark ? 'text-white/70' : 'text-foreground'}`}>
                        ••••• kr
                      </span>
                      <span className={`text-sm ${pkg.dark ? 'text-white/50' : 'text-muted-foreground'}`}>/månad</span>
                    </div>
                  )}

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className={`flex items-center gap-2 text-sm ${pkg.dark ? 'text-white/60' : 'text-muted-foreground'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${pkg.dark ? 'bg-white/40' : 'bg-primary/60'}`}></span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Button */}
                  <Button 
                    className={`w-full ${pkg.dark ? 'bg-white/20 text-white/80' : ''}`}
                    variant={pkg.popular ? "default" : "outline"}
                  >
                    Välj {pkg.name}
                  </Button>
                </div>

                {/* Lock Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                  <div className={`p-4 rounded-full ${pkg.dark ? 'bg-black/60' : 'bg-background/80'} border border-white/10 shadow-xl`}>
                    <Lock className={`h-8 w-8 ${pkg.dark ? 'text-white/60' : 'text-muted-foreground'}`} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <p className="text-lg text-muted-foreground mb-6">
            Håll utkik – <span className="text-primary font-semibold">paketen kommer snart!</span>
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/start")}
            className="gap-2 text-lg px-8"
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
