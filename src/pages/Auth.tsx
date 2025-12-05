import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import DecorativeBackground from "@/components/DecorativeBackground";
import bilgenLogo from "@/assets/bilgen-logo.png";

// Validation schemas
const emailSchema = z.string().email("Ogiltig e-postadress");
const passwordSchema = z.string().min(6, "Lösenordet måste vara minst 6 tecken");
const displayNameSchema = z.string().min(2, "Namnet måste vara minst 2 tecken").optional();

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading, signIn, signUp } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
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
    
    if (isSignUp && displayName) {
      const nameResult = displayNameSchema.safeParse(displayName);
      if (!nameResult.success) {
        newErrors.displayName = nameResult.error.errors[0].message;
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
        const { error } = await signUp(email, password, displayName || undefined);
        
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Kontot finns redan",
              description: "Denna e-postadress är redan registrerad. Prova att logga in istället.",
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
          description: "Du är nu inloggad.",
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

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white">
      <DecorativeBackground />
      
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <img 
          src={bilgenLogo} 
          alt="BILGEN" 
          className="mb-10 h-16 opacity-0 animate-fade-in cursor-pointer"
          onClick={() => navigate("/")}
        />
        
        {/* Auth Card */}
        <div 
          className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-lg opacity-0 animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isSignUp ? "Skapa konto" : "Logga in"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isSignUp 
                ? "Fyll i dina uppgifter för att komma igång" 
                : "Välkommen tillbaka! Logga in för att fortsätta"}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm font-medium">
                  Visningsnamn
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Ditt namn"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.displayName && (
                  <p className="text-xs text-red-500">{errors.displayName}</p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                E-postadress
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="din@email.se"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Lösenord
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full py-6 text-base font-semibold transition-all duration-300 hover:shadow-lg"
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
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
              }}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {isSignUp 
                ? "Har du redan ett konto? Logga in" 
                : "Har du inget konto? Skapa ett"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
