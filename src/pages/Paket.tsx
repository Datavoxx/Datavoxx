import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Sparkles, Crown, Rocket, Send, Star, Shield, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import DecorativeBackground from "@/components/DecorativeBackground";
import bilgenLogo from "@/assets/bilgen-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";

// Define available add-ons with Stripe price IDs
const addons = {
  creditMax: { id: 'credit-max', name: 'Credit Max', price: 599, description: 'Obegränsade credits' },
  creditBonus: { id: 'credit-bonus', name: 'Credit Bonus', price: 299, description: 'Extra credits' },
  emailAssistant: { id: 'email-assistant', name: 'E-mail Assistant', price: 799, description: 'AI-driven e-postassistent' }
};

// Stripe product IDs for subscription status
const PRODUCT_IDS = {
  gen1: 'prod_TezYFUWmNFuOGQ',
  gen2: 'prod_TezkXphJVCjLhl',
};

const Paket = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, session } = useAuth();
  const { isAdmin, isLoading: isRoleLoading } = useUserRole();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<{
    subscribed: boolean;
    products: string[];
    subscription_end: string | null;
  } | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  
  // State for selected add-ons per package
  const [selectedAddons, setSelectedAddons] = useState<{
    gen1: string[];
    gen2: string[];
  }>({ gen1: [], gen2: [] });

  // Check subscription status on load
  useEffect(() => {
    const checkSubscription = async () => {
      if (!session?.access_token) return;
      
      setIsLoadingSubscription(true);
      try {
        const { data, error } = await supabase.functions.invoke('check-subscription', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });
        
        if (error) throw error;
        setSubscription(data);
      } catch (error) {
        console.error("Error checking subscription:", error);
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    checkSubscription();
  }, [session?.access_token]);

  const handleCheckout = async (packageKey: 'gen1' | 'gen2') => {
    if (!user) {
      toast({
        title: "Logga in först",
        description: "Du måste vara inloggad för att köpa ett paket.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsCheckingOut(packageKey);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          packageKey,
          addons: selectedAddons[packageKey]
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Något gick fel",
        description: "Kunde inte starta betalningen. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!session?.access_token) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Portal error:", error);
      toast({
        title: "Något gick fel",
        description: "Kunde inte öppna hanteringssidan.",
        variant: "destructive",
      });
    }
  };

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

  const toggleAddon = (packageKey: 'gen1' | 'gen2', addonId: string) => {
    setSelectedAddons(prev => {
      const currentAddons = prev[packageKey];
      const isSelected = currentAddons.includes(addonId);
      return {
        ...prev,
        [packageKey]: isSelected 
          ? currentAddons.filter(id => id !== addonId)
          : [...currentAddons, addonId]
      };
    });
  };

  const calculateTotal = (basePrice: number, packageKey: 'gen1' | 'gen2') => {
    const selected = selectedAddons[packageKey];
    const addonTotal = selected.reduce((sum, addonId) => {
      const addon = Object.values(addons).find(a => a.id === addonId);
      return sum + (addon?.price || 0);
    }, 0);
    return basePrice + addonTotal;
  };

  const hasActiveSubscription = (packageKey: string) => {
    if (!subscription?.subscribed) return false;
    return subscription.products.includes(packageKey);
  };

  const packages = [
    {
      name: "Gen 1",
      key: "gen1" as const,
      icon: Rocket,
      features: ["Grundläggande verktyg", "Email-support", "5 annonser/månad", "Bil Research Basic"],
      basePrice: 999,
      availableAddons: [addons.creditMax, addons.creditBonus, addons.emailAssistant],
      blur: "blur-[6px]",
      priceBlur: "blur-[10px]",
      bgClass: "bg-white/10",
      borderClass: "border-white/20",
    },
    {
      name: "Gen 2",
      key: "gen2" as const,
      icon: Sparkles,
      features: ["Alla Gen 1 funktioner", "Obegränsade annonser", "Prioriterad support", "AI Email-assistent", "Avancerad Research"],
      basePrice: 3299,
      availableAddons: [addons.creditMax, addons.creditBonus],
      popular: true,
      blur: "blur-[6px]",
      priceBlur: "blur-[10px]",
      bgClass: "bg-white/10",
      borderClass: "border-primary/30",
    },
    {
      name: "Gen 3",
      key: null,
      icon: Crown,
      features: ["Alla Gen 2 funktioner", "White-label lösning", "Dedikerad account manager", "Custom AI-träning", "API-access", "Enterprise support"],
      basePrice: null,
      availableAddons: [],
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

        {/* Subscription Status / Beta Badge / Admin Badge */}
        <div className="flex justify-center mb-6">
          {subscription?.subscribed ? (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Aktiv prenumeration: {subscription.products.map(p => p === 'gen1' ? 'Gen 1' : p === 'gen2' ? 'Gen 2' : p).join(', ')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageSubscription}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Hantera
              </Button>
            </div>
          ) : isAdmin ? (
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
                    {pkg.basePrice === null ? (
                      <span className={`text-2xl font-bold ${pkg.dark ? 'text-white' : 'text-foreground'}`}>
                        Kontakta oss
                      </span>
                    ) : (
                      <div className="space-y-1">
                        <div>
                          <span className={`text-3xl font-bold ${pkg.dark ? 'text-white' : 'text-foreground'}`}>
                            {pkg.key ? calculateTotal(pkg.basePrice, pkg.key).toLocaleString('sv-SE') : pkg.basePrice.toLocaleString('sv-SE')} kr
                          </span>
                          <span className={`text-sm ${pkg.dark ? 'text-white/70' : 'text-muted-foreground'}`}>/månad</span>
                        </div>
                        {pkg.key && selectedAddons[pkg.key].length > 0 && (
                          <p className={`text-xs ${pkg.dark ? 'text-white/50' : 'text-muted-foreground'}`}>
                            Baspris: {pkg.basePrice.toLocaleString('sv-SE')} kr + tillägg
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-4">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className={`flex items-center gap-2 text-sm ${pkg.dark ? 'text-white/80' : 'text-muted-foreground'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${pkg.dark ? 'bg-white/60' : 'bg-primary/60'}`}></span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Add-ons Section */}
                  {pkg.availableAddons.length > 0 && pkg.key && (
                    <div className="mb-6 pt-4 border-t border-white/10">
                      <p className={`text-xs font-semibold mb-3 ${pkg.dark ? 'text-white/70' : 'text-muted-foreground'}`}>
                        TILLÄGG
                      </p>
                      <div className="space-y-3">
                        {pkg.availableAddons.map((addon) => (
                          <label
                            key={addon.id}
                            className={`flex items-start gap-3 cursor-pointer group`}
                          >
                            <Checkbox
                              checked={selectedAddons[pkg.key!].includes(addon.id)}
                              onCheckedChange={() => toggleAddon(pkg.key!, addon.id)}
                              className="mt-0.5 border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className={`text-sm font-medium ${pkg.dark ? 'text-white' : 'text-foreground'}`}>
                                  {addon.name}
                                </span>
                                <span className={`text-sm font-semibold text-primary`}>
                                  +{addon.price} kr
                                </span>
                              </div>
                              <p className={`text-xs ${pkg.dark ? 'text-white/50' : 'text-muted-foreground'}`}>
                                {addon.description}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Button */}
                  {pkg.key && hasActiveSubscription(pkg.key) ? (
                    <Button 
                      className="w-full"
                      variant="outline"
                      onClick={handleManageSubscription}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Hantera prenumeration
                    </Button>
                  ) : (
                    <Button 
                      className={`w-full ${pkg.dark ? 'bg-white/20 text-white hover:bg-white/30' : ''}`}
                      variant={pkg.popular ? "default" : "outline"}
                      disabled={!isAdmin || isCheckingOut !== null || !pkg.key}
                      onClick={() => pkg.key && handleCheckout(pkg.key)}
                    >
                      {isCheckingOut === pkg.key ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Laddar...
                        </>
                      ) : pkg.basePrice === null ? (
                        "Kontakta oss"
                      ) : (
                        `Välj ${pkg.name}`
                      )}
                    </Button>
                  )}
                </div>

                {/* Lock Overlay - Only for non-admin and non-subscribed */}
                {!isAdmin && !hasActiveSubscription(pkg.key || '') && (
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
