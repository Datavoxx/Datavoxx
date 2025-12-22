import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import DecorativeBackground from "@/components/DecorativeBackground";
import TerminalDemo from "@/components/TerminalDemo";
import EmailDemo from "@/components/EmailDemo";
import BilResearchDemo from "@/components/BilResearchDemo";
import BookDemoForm from "@/components/BookDemoForm";
import bilgenLogo from "@/assets/bilgen-logo.png";
import { Zap, Search, Mail, CheckCircle, ArrowRight, Clock, Sparkles, FileText, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showBookDemoForm, setShowBookDemoForm] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<'annons' | 'email' | 'research'>('annons');

  const outputExamples = [
    {
      title: "Bilannons",
      label: "10 sek",
      icon: "📝",
      content: `VOLVO XC60 D4 AWD 2019
Välskött familjebil med dragkrok och panoramatak. Servad hos märkesverkstad.

Pris: 289 000 kr`
    },
    {
      title: "Kundmejl",
      label: "5 sek",
      icon: "✉️",
      content: `Hej Anders,

Tack för ditt intresse för BMW X5:an! Bilen finns tillgänglig för visning.

Med vänliga hälsningar`
    },
    {
      title: "Bil Research",
      label: "Direkt",
      icon: "🔍",
      content: `Vanliga problem XC60 D4:
• Injektorproblem vid 15 000+ mil
• Stötdämpare bak slits snabbt
• Kontrollera AdBlue-system`
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Sälj bilar snabbare",
      description: "Färdiga bilannonser på 10 sekunder istället för 15 minuter.",
      timeSaved: "15 min/annons"
    },
    {
      icon: Search,
      title: "Få svar direkt",
      description: "Slipp googla. Fråga om problem, service och teknisk info.",
      timeSaved: "10 min/fråga"
    },
    {
      icon: Mail,
      title: "Svara professionellt",
      description: "Generera mejlsvar på sekunder. Rätt ton, rätt innehåll.",
      timeSaved: "5 min/mejl"
    }
  ];

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <DecorativeBackground />

      {/* Login Button - Top Right */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
        {user ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/annons")}
            className="gap-2"
          >
            Till appen
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/auth")}
            className="gap-2"
          >
            <LogIn className="h-4 w-4" />
            Logga in
          </Button>
        )}
      </div>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            {/* Logo */}
            <div className="inline-flex items-center gap-2 mb-8">
              <img 
                src={bilgenLogo} 
                alt="BILGEN" 
                className="h-12 md:h-14"
              />
            </div>

            {/* Headline with gradient */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
              <span className="text-foreground">Slipp skriva </span>
              <span className="gradient-text">bilannonser</span>
              <span className="text-foreground">, </span>
              <br className="hidden md:block" />
              <span className="gradient-text">mejl</span>
              <span className="text-foreground"> och googla </span>
              <span className="gradient-text">bilproblem</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Bilgen skapar färdiga texter på sekunder – anpassat för svenska bilhandlare
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={() => navigate("/start")}
                className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/25 cursor-pointer"
              >
                <Sparkles className="h-5 w-5" />
                Skapa din första bilannons
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-transparent border-2 border-primary/30 text-foreground font-semibold text-lg transition-all duration-300 hover:border-primary hover:bg-primary/5 cursor-pointer"
              >
                Prova demo
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-y-1 rotate-90" />
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Ingen installation
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Fungerar direkt
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                Spara 30+ min/dag
              </span>
            </div>
          </div>

          {/* Demo Selector Tabs */}
          <div id="demo" className="mb-8">
            <div className="flex justify-center gap-2 mb-8">
              {[
                { id: 'annons' as const, label: 'Bilannons', icon: FileText },
                { id: 'email' as const, label: 'E-mail', icon: Mail },
                { id: 'research' as const, label: 'Bil Research', icon: Search }
              ].map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => setSelectedDemo(demo.id)}
                  className={`group flex items-center gap-2 px-5 py-3 rounded-full font-medium text-sm transition-all duration-300 cursor-pointer ${
                    selectedDemo === demo.id 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                      : 'bg-card/50 border border-border/50 text-muted-foreground hover:bg-card hover:border-border hover:text-foreground'
                  }`}
                >
                  <demo.icon className={`h-4 w-4 transition-transform duration-300 ${selectedDemo === demo.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                  {demo.label}
                </button>
              ))}
            </div>

            {/* Render selected demo */}
            {selectedDemo === 'annons' && <TerminalDemo />}
            {selectedDemo === 'email' && <EmailDemo />}
            {selectedDemo === 'research' && <BilResearchDemo />}
          </div>
        </div>
      </section>

      {/* Output Examples Section */}
      <section className="relative px-6 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
              Exempel
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Se vad du får
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Konkreta exempel på vad Bilgen skapar åt dig
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {outputExamples.map((example, index) => (
              <div
                key={index}
                className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{example.icon}</span>
                    <h3 className="font-semibold text-foreground">{example.title}</h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {example.label}
                  </span>
                </div>
                
                {/* Code-style content */}
                <div className="font-mono text-sm text-muted-foreground leading-relaxed bg-muted/30 rounded-lg p-4 border border-border/30">
                  <pre className="whitespace-pre-wrap">{example.content}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative px-6 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
              Fördelar
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Resultat – inte funktioner
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Fokusera på att sälja bilar. Låt Bilgen ta hand om skrivandet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="group text-center p-8 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/60"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-6 transition-transform group-hover:scale-110">
                  <benefit.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-5">
                  {benefit.description}
                </p>
                <span className="inline-block text-xs font-semibold px-3 py-1.5 rounded-full bg-green-500/10 text-green-600">
                  Spara {benefit.timeSaved}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="relative px-6 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
            Målgrupp
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10">
            Byggd för svenska bilhandlare
          </h2>
          <div className="flex flex-col gap-4">
            {[
              "Små och medelstora bilhandlare",
              "Handlare med många kundförfrågningar",
              "Företag som vill jobba smartare"
            ].map((item, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-3 bg-card/50 backdrop-blur-sm rounded-full px-6 py-4 border border-border/50 mx-auto transition-all duration-300 hover:border-primary/30"
              >
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-foreground font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section - Premium */}
      <section className="relative px-6 py-24 md:py-32">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Gradient background with more depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-[hsl(280,75%,50%)] to-accent" />
            
            {/* Content */}
            <div className="relative text-center px-8 py-16 md:px-16 md:py-24">
              <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
                Redo att spara tid?
              </h2>
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-xl mx-auto">
                Sluta skriva annonser manuellt. Testa Bilgen gratis och se skillnaden på 30 sekunder.
              </p>
              
              {/* Two CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button
                  onClick={() => navigate("/start")}
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-background text-foreground font-semibold text-lg shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
                >
                  <Sparkles className="h-5 w-5" />
                  Kom igång gratis
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => setShowBookDemoForm(true)}
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-transparent border-2 border-primary-foreground/30 text-primary-foreground font-semibold text-lg transition-all duration-300 hover:bg-primary-foreground/10 hover:border-primary-foreground/50 cursor-pointer"
                >
                  <Mail className="h-5 w-5" />
                  Boka demo
                </button>
              </div>
              
              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-primary-foreground/70">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Inget kreditkort
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Svensk support
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Redo på minuter
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional SaaS Footer */}
      <footer className="relative bg-neutral-900 border-t border-neutral-800">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
            
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <img src={bilgenLogo} alt="BILGEN" className="h-8 mb-4 brightness-0 invert" />
              <p className="text-neutral-400 text-sm leading-relaxed">
                AI-verktyg för svenska bilhandlare. Spara tid på administration, fokusera på försäljning.
              </p>
            </div>
            
            {/* Produkt */}
            <div>
              <h4 className="font-semibold text-neutral-200 mb-4 text-sm uppercase tracking-wider">Produkt</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-neutral-400 hover:text-neutral-200 transition-colors">Bilannonsgenerator</a>
                </li>
                <li>
                  <a href="#" className="text-neutral-400 hover:text-neutral-200 transition-colors">Email-assistent</a>
                </li>
                <li>
                  <a href="#" className="text-neutral-400 hover:text-neutral-200 transition-colors">Bil Research</a>
                </li>
                <li>
                  <a href="#" className="text-neutral-400 hover:text-neutral-200 transition-colors inline-flex items-center gap-2">
                    CRM
                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">Kommer snart</span>
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Resurser */}
            <div>
              <h4 className="font-semibold text-neutral-200 mb-4 text-sm uppercase tracking-wider">Resurser</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-neutral-400 hover:text-neutral-200 transition-colors">Support</a>
                </li>
                <li>
                  <a href="#" className="text-neutral-400 hover:text-neutral-200 transition-colors">FAQ</a>
                </li>
                <li>
                  <a href="#" className="text-neutral-400 hover:text-neutral-200 transition-colors">Guider</a>
                </li>
              </ul>
            </div>
            
            {/* Företag */}
            <div>
              <h4 className="font-semibold text-neutral-200 mb-4 text-sm uppercase tracking-wider">Företag</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-neutral-400 hover:text-neutral-200 transition-colors">Om oss</a>
                </li>
                <li>
                  <a href="#" className="text-neutral-400 hover:text-neutral-200 transition-colors">Kontakt</a>
                </li>
              </ul>
            </div>
            
            {/* Juridik */}
            <div>
              <h4 className="font-semibold text-neutral-200 mb-4 text-sm uppercase tracking-wider">Juridik</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-neutral-400 hover:text-neutral-200 transition-colors">Integritetspolicy</a>
                </li>
                <li>
                  <a href="#" className="text-neutral-400 hover:text-neutral-200 transition-colors">Villkor</a>
                </li>
                <li>
                  <a href="#" className="text-neutral-400 hover:text-neutral-200 transition-colors">Cookies</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="border-t border-neutral-800">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-neutral-500">
              © 2025 Bilgen. Alla rättigheter förbehållna.
            </p>
            <div className="flex items-center gap-6 text-sm text-neutral-500">
              <a href="#" className="hover:text-neutral-300 transition-colors">Integritetspolicy</a>
              <a href="#" className="hover:text-neutral-300 transition-colors">Villkor</a>
              <span className="flex items-center gap-2">
                🇸🇪 Sverige
              </span>
            </div>
          </div>
        </div>
      </footer>
      {/* Book Demo Form Modal */}
      <BookDemoForm 
        open={showBookDemoForm} 
        onClose={() => setShowBookDemoForm(false)} 
      />
    </div>
  );
};

export default Landing;
