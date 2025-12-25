import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import DecorativeBackground from "@/components/DecorativeBackground";
import TerminalDemo from "@/components/TerminalDemo";
import EmailDemo from "@/components/EmailDemo";
import BilResearchDemo from "@/components/BilResearchDemo";
import BookDemoForm from "@/components/BookDemoForm";
import Footer from "@/components/Footer";
import bilgenLogo from "@/assets/bilgen-logo.png";
import { Zap, Search, Mail, CheckCircle, ArrowRight, Clock, Sparkles, FileText, LogIn, Package, ChevronDown, Menu, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showBookDemoForm, setShowBookDemoForm] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<'annons' | 'email' | 'research'>('annons');

  const outputExamples = [
    {
      title: "Annonstext",
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
      title: "Lägg upp annonser snabbare",
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

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 md:h-auto md:relative bg-background/80 backdrop-blur-md border-b border-border/50 md:border-none md:bg-transparent md:backdrop-blur-none">
        <div className="flex items-center justify-between h-full px-4 md:absolute md:top-4 md:right-4 lg:top-6 lg:right-6 md:px-0 md:left-auto md:h-auto">
          {/* Mobile: Logo centered */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-border">
                    <img src={bilgenLogo} alt="BILGEN" className="h-8" />
                  </div>
                  <nav className="flex-1 p-4 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Produkter</p>
                    <button
                      onClick={() => navigate("/produkt/annonsgenerator")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-muted transition-colors"
                    >
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Annonstextgenerator</span>
                    </button>
                    <button
                      onClick={() => navigate("/produkt/bil-research")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-muted transition-colors"
                    >
                      <Search className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Bil Research</span>
                    </button>
                    <button
                      onClick={() => navigate("/produkt/email-assistent")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-muted transition-colors"
                    >
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Email-assistent</span>
                    </button>
                    <button
                      onClick={() => navigate("/produkt/bildgenerator")}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-muted transition-colors"
                    >
                      <Image className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Bildgenerator</span>
                    </button>
                    <div className="pt-4 border-t border-border mt-4">
                      <button
                        onClick={() => navigate("/paket")}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-muted transition-colors"
                      >
                        <Package className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Paket & Priser</span>
                      </button>
                    </div>
                  </nav>
                  <div className="p-4 border-t border-border">
                    {user ? (
                      <Button onClick={() => navigate("/start")} className="w-full gap-2">
                        Till appen
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button onClick={() => navigate("/auth")} className="w-full gap-2">
                        <LogIn className="h-4 w-4" />
                        Logga in / Skapa konto
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Mobile: Logo center */}
          <img src={bilgenLogo} alt="BILGEN" className="h-7 md:hidden" />

          {/* Mobile: Login icon */}
          <div className="md:hidden">
            {user ? (
              <Button variant="ghost" size="icon" onClick={() => navigate("/start")} className="h-9 w-9">
                <ArrowRight className="h-5 w-5" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => navigate("/auth")} className="h-9 w-9">
                <LogIn className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {/* Produkter Dropdown */}
            <div className="relative group">
              <Button variant="ghost" size="sm" className="gap-2">
                Produkter
                <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
              </Button>
              <div className="absolute right-0 top-full mt-1 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-card/95 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-2 space-y-1">
                  <button
                    onClick={() => navigate("/produkt/annonsgenerator")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-primary/10 transition-colors group/item"
                  >
                    <FileText className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Annonstextgenerator</p>
                      <p className="text-xs text-muted-foreground">Skapa annonstextar på sekunder</p>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate("/produkt/bil-research")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-primary/10 transition-colors group/item"
                  >
                    <Search className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Bil Research</p>
                      <p className="text-xs text-muted-foreground">Expertkunskap om bilar</p>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate("/produkt/email-assistent")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-primary/10 transition-colors group/item"
                  >
                    <Mail className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Email-assistent</p>
                      <p className="text-xs text-muted-foreground">Svara på kundmejl snabbt</p>
                    </div>
                  </button>
                  <button
                    onClick={() => navigate("/produkt/bildgenerator")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-primary/10 transition-colors group/item"
                  >
                    <Image className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Bildgenerator</p>
                      <p className="text-xs text-muted-foreground">Professionella bilbilder</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" onClick={() => navigate("/paket")} className="gap-2">
              <Package className="h-4 w-4" />
              Paket
            </Button>
            {user ? (
              <Button variant="outline" size="sm" onClick={() => navigate("/start")} className="gap-2">
                Till appen
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate("/auth")} className="gap-2">
                <LogIn className="h-4 w-4" />
                Logga in
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 md:px-6 pt-20 md:pt-28 pb-12 md:pb-32">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            {/* Logo - hidden on mobile (shown in header) */}
            <div className="hidden md:inline-flex items-center gap-2 mb-8">
              <img 
                src={bilgenLogo} 
                alt="BILGEN" 
                className="h-12 md:h-14"
              />
            </div>

            {/* Headline - shorter on mobile */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6 leading-[1.15]">
              <span className="md:hidden">
                <span className="gradient-text">Sälj bilar</span>
                <span className="text-foreground"> snabbare med </span>
                <span className="gradient-text">AI</span>
              </span>
              <span className="hidden md:inline">
                <span className="text-foreground">Slipp skriva </span>
                <span className="gradient-text">annonstext</span>
                <span className="text-foreground">, </span>
                <br />
                <span className="gradient-text">mejl</span>
                <span className="text-foreground"> och googla </span>
                <span className="gradient-text">bilproblem</span>
              </span>
            </h1>

            <p className="text-base md:text-xl text-muted-foreground max-w-md md:max-w-2xl mx-auto mb-6 md:mb-10">
              <span className="md:hidden">Färdiga annonser, mejlsvar och bilinfo på sekunder.</span>
              <span className="hidden md:inline">Bilgen skapar färdiga texter på sekunder – anpassat för svenska bilhandlare</span>
            </p>
            
            {/* CTA Button - single on mobile */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-6 md:mb-8">
              <button
                onClick={() => navigate("/start")}
                className="group relative inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 md:py-4 rounded-full bg-primary text-primary-foreground font-semibold text-base md:text-lg shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/25 cursor-pointer w-full sm:w-auto"
              >
                <Sparkles className="h-5 w-5" />
                Utforska verktygen
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              {/* Secondary CTA - hidden on mobile */}
              <button
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                className="hidden sm:inline-flex group items-center gap-2 px-8 py-4 rounded-full bg-transparent border-2 border-primary/30 text-foreground font-semibold text-lg transition-all duration-300 hover:border-primary hover:bg-primary/5 cursor-pointer"
              >
                Prova demo
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-y-1 rotate-90" />
              </button>
            </div>

            {/* Scroll indicator - mobile only */}
            <button 
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              className="sm:hidden text-sm text-muted-foreground flex items-center justify-center gap-1 mx-auto mb-6"
            >
              <ArrowRight className="h-4 w-4 rotate-90" />
              Se demo
            </button>
          </div>

          {/* Trust indicators - moved to separate section on mobile */}
          <div className="hidden md:flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mb-16">
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
            <span className="flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              1000+ bilannonser studerade på Blocket
            </span>
          </div>

          {/* Mobile trust section - compact */}
          <div className="md:hidden flex flex-col items-center gap-2 py-4 mb-6 border-y border-border/50">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                Ingen installation
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                Fungerar direkt
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-green-500" />
                30+ min/dag
              </span>
            </div>
          </div>

          {/* Demo Selector Tabs */}
          <div id="demo" className="mb-8">
            <div className="flex justify-start md:justify-center gap-2 mb-6 md:mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
              {[
                { id: 'annons' as const, label: 'Annons', labelFull: 'Annonstext', icon: FileText },
                { id: 'email' as const, label: 'E-mail', labelFull: 'E-mail', icon: Mail },
                { id: 'research' as const, label: 'Research', labelFull: 'Bil Research', icon: Search }
              ].map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => setSelectedDemo(demo.id)}
                  className={`group flex items-center gap-1.5 md:gap-2 px-3.5 md:px-5 py-2.5 md:py-3 rounded-full font-medium text-sm transition-all duration-300 cursor-pointer whitespace-nowrap flex-shrink-0 ${
                    selectedDemo === demo.id 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                      : 'bg-card/50 border border-border/50 text-muted-foreground hover:bg-card hover:border-border hover:text-foreground'
                  }`}
                >
                  <demo.icon className={`h-4 w-4 transition-transform duration-300 ${selectedDemo === demo.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="md:hidden">{demo.label}</span>
                  <span className="hidden md:inline">{demo.labelFull}</span>
                </button>
              ))}
            </div>

            {/* Render selected demo */}
            {selectedDemo === 'annons' && <TerminalDemo />}
            {selectedDemo === 'email' && <EmailDemo />}
            {selectedDemo === 'research' && <BilResearchDemo />}
          </div>

          {/* Account CTA - moved below demo on mobile */}
          {!user && (
            <div className="mt-8 md:mt-0 md:hidden p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-base font-semibold text-foreground">
                  Skapa gratis konto
                </p>
              </div>
              <p className="text-muted-foreground text-sm mb-3">
                Spara historik och få personliga inställningar.
              </p>
              <Button onClick={() => navigate("/auth")} size="sm" className="gap-2 w-full">
                <LogIn className="h-4 w-4" />
                Skapa konto
              </Button>
            </div>
          )}

          {/* Desktop Account CTA */}
          {!user && (
            <div className="hidden md:block mt-10 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 max-w-xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <p className="text-lg font-semibold text-foreground">
                  Skapa ett gratis konto
                </p>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Logga in för en personlig upplevelse – spara historik, få anpassade inställningar och mer. Helt kostnadsfritt!
              </p>
              <Button onClick={() => navigate("/auth")} className="gap-2">
                <LogIn className="h-4 w-4" />
                Skapa konto gratis
              </Button>
            </div>
          )}
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

      {/* Book Demo Form Modal */}
      <BookDemoForm 
        open={showBookDemoForm} 
        onClose={() => setShowBookDemoForm(false)} 
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
