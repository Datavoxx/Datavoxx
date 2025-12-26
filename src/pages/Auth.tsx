import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Mail, Lock, Loader2, ArrowRight, FileText, Search, Mail as MailIcon, Image, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import DecorativeBackground from "@/components/DecorativeBackground";
import Footer from "@/components/Footer";
import bilgenLogo from "@/assets/bilgen-logo.png";

// Validation schemas
const emailSchema = z.string().email("Ogiltig e-postadress");
const passwordSchema = z.string().min(6, "Lösenordet måste vara minst 6 tecken");
const displayNameSchema = z.string().min(2, "Namnet måste vara minst 2 tecken");

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading, signIn, signUp } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [errors, setErrors] = useState<{ email?: string; password?: string; displayName?: string }>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; displayName?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    if (isSignUp) {
      const displayNameResult = displayNameSchema.safeParse(displayName);
      if (!displayNameResult.success) {
        newErrors.displayName = displayNameResult.error.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, displayName, companyName || undefined);
        
        if (error) {
          if (error.message.includes("User already registered")) {
            toast({
              title: "Kontot finns redan",
              description: "Det finns redan ett konto med denna e-postadress. Försök logga in istället.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Registreringsfel",
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }
        
        toast({
          title: "Konto skapat!",
          description: "Välkommen till BILGEN.",
        });
        navigate("/");
      } else {
        const { error } = await signIn(email, password);
        
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Fel inloggningsuppgifter",
              description: "E-postadressen eller lösenordet är fel.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Inloggningsfel",
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }
        
        toast({
          title: "Välkommen tillbaka!",
          description: "Du är nu inloggad.",
        });
        navigate("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tools = [
    { icon: FileText, title: "Annonstextgenerator", locked: false },
    { icon: Search, title: "Bil Research Expert", locked: false },
    { icon: MailIcon, title: "Email Assistent", locked: true },
    { icon: Image, title: "Bildgenerator", locked: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
      <DecorativeBackground />
      
      {/* Main Content - Centered */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* Logo */}
        <img 
          src={bilgenLogo} 
          alt="BILGEN" 
          className="h-16 md:h-20 mb-8 opacity-0 animate-fade-in cursor-pointer"
          onClick={() => navigate("/")}
        />
        
        {/* Tagline */}
        <div className="text-center mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">
            AI-verktyg för bilhandlare
          </h2>
          <p className="text-muted-foreground">
            Spara tid och jobba smartare
          </p>
        </div>

        {/* Tool badges - horizontal on desktop */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {tools.map((tool, index) => (
            <div key={index} className="relative">
              {tool.locked && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <Lock className="h-4 w-4 text-foreground" />
                </div>
              )}
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full bg-background/60 backdrop-blur-sm border border-border/50 shadow-sm ${
                  tool.locked ? "blur-[6px] opacity-40" : ""
                }`}
              >
                <tool.icon className="h-4 w-4 text-foreground" />
                <span className="text-sm font-medium text-foreground">{tool.title}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Auth Card */}
        <div 
          className="w-full max-w-sm bg-background/80 backdrop-blur-md border border-border/50 rounded-2xl p-8 shadow-xl opacity-0 animate-fade-in"
          style={{ animationDelay: "0.15s" }}
        >
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {isSignUp ? "Skapa konto" : "Logga in"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isSignUp ? "Kom igång gratis" : "Välkommen tillbaka!"}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-sm font-medium">
                    Ditt namn
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Anna Andersson"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pl-10 bg-background/50"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.displayName && (
                    <p className="text-xs text-destructive">{errors.displayName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium">
                    Företagsnamn <span className="text-muted-foreground">(valfritt)</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="companyName"
                      type="text"
                      placeholder="Bilhandlare AB"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="pl-10 bg-background/50"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                E-postadress
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="din@email.se"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-background/50"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Lösenord
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-background/50"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full py-6 text-base font-semibold transition-all duration-300 hover:shadow-lg mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? "Skapa konto" : "Logga in"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle between login and signup */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading}
            >
              {isSignUp ? (
                <>Har du redan ett konto? <span className="font-medium text-foreground">Logga in</span></>
              ) : (
                <>Har du inget konto? <span className="font-medium text-foreground">Skapa ett</span></>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background/80 px-2 text-muted-foreground">
                Eller
              </span>
            </div>
          </div>

          {/* Stay logged out Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/")}
            disabled={isLoading}
            className="w-full bg-background/50 hover:bg-background/80"
          >
            Förbli utloggad
          </Button>
        </div>

        {/* Speed tagline */}
        <div 
          className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/90 text-background opacity-0 animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="text-sm">⚡</span>
          <span className="font-semibold">2-3X</span>
          <span className="text-sm">snabbare än manuellt</span>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Auth;
