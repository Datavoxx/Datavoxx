import { useNavigate } from "react-router-dom";
import DecorativeBackground from "@/components/DecorativeBackground";
import bilgenLogo from "@/assets/bilgen-logo.png";
import { Zap, Search, Mail, CheckCircle, ArrowRight, Clock, Users, Settings } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const outputExamples = [
    {
      title: "Bilannons",
      label: "Genererad på 10 sek",
      content: `VOLVO XC60 D4 AWD 2019
Välskött familjebil med dragkrok och panoramatak. Servad hos märkesverkstad. Ägare: 2. Ny kamrem vid 16 000 mil. Vinterdäck ingår.

Pris: 289 000 kr`
    },
    {
      title: "Kundmejl",
      label: "Professionellt svar",
      content: `Hej Anders,

Tack för ditt intresse för BMW X5:an! Bilen finns tillgänglig för visning. Passar det på torsdag kl 14 eller fredag förmiddag?

Med vänliga hälsningar`
    },
    {
      title: "Bil Research",
      label: "Expertkunskap direkt",
      content: `Vanliga problem Volvo XC60 D4:
• Injektorproblem vid 15 000+ mil
• Stötdämpare bak slits snabbt
• Kontrollera AdBlue-system

Rekommenderat service: var 2 000 mil`
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Sälj bilar snabbare",
      description: "Färdiga bilannonser på 10 sekunder. Slå in regnummer – få säljande text direkt."
    },
    {
      icon: Search,
      title: "Få svar direkt",
      description: "Slipp googla. Fråga om vanliga problem, service och teknisk info för vilken bil som helst."
    },
    {
      icon: Mail,
      title: "Svara kunder professionellt",
      description: "Generera mejlsvar automatiskt. Rätt ton, rätt innehåll – utan att skriva själv."
    }
  ];

  const targetAudience = [
    "Små och medelstora bilhandlare",
    "Handlare med många kundförfrågningar",
    "Företag som vill jobba smartare utan att anställa"
  ];

  const steps = [
    { icon: Users, text: "Skapa konto på 30 sekunder" },
    { icon: Settings, text: "Välj verktyg" },
    { icon: Zap, text: "Få resultat direkt" }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <DecorativeBackground />

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-4xl mx-auto text-center">
          <img 
            src={bilgenLogo} 
            alt="BILGEN" 
            className="h-20 md:h-24 mx-auto mb-8"
          />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
            Slipp skriva bilannonser, mejl och googla bilproblem
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Bilgen skapar färdiga texter på sekunder – anpassat för svenska bilhandlare
          </p>
          
          <button
            onClick={() => navigate("/start")}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-foreground text-background font-semibold text-lg shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer mb-6"
          >
            Skapa din första bilannons
            <ArrowRight className="h-5 w-5" />
          </button>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Ingen installation
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Gratis att testa
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-green-600" />
              2-3× snabbare
            </span>
          </div>
        </div>
      </section>

      {/* Output Examples Section */}
      <section className="relative px-6 py-16 md:py-24 bg-muted/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            Se vad du får
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Konkreta exempel på vad Bilgen skapar åt dig – på sekunder
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {outputExamples.map((example, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">{example.title}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {example.label}
                  </span>
                </div>
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                  {example.content}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative px-6 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            Resultat – inte funktioner
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Fokusera på att sälja bilar. Låt Bilgen ta hand om skrivandet.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="text-center p-6"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-foreground/5 mb-5">
                  <benefit.icon className="h-7 w-7 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="relative px-6 py-16 md:py-24 bg-muted/40">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Byggd för svenska bilhandlare
          </h2>
          <div className="space-y-4">
            {targetAudience.map((item, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-3 bg-card rounded-full px-6 py-3 shadow-sm border border-border mx-2"
              >
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-foreground font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Simplicity Section */}
      <section className="relative px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
            Enkelt att komma igång
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mb-10">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-foreground text-background mb-4">
                  <step.icon className="h-7 w-7" />
                </div>
                <span className="text-foreground font-medium">{step.text}</span>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute h-5 w-5 text-muted-foreground" style={{ marginLeft: '200px' }} />
                )}
              </div>
            ))}
          </div>

          <p className="text-muted-foreground">
            Ingen installation. Inga krångliga inställningar.
          </p>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative px-6 py-20 md:py-28 bg-foreground text-background">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Redo att spara tid?
          </h2>
          <p className="text-lg opacity-80 mb-8">
            Testa Bilgen gratis och se skillnaden direkt
          </p>
          
          <button
            onClick={() => navigate("/start")}
            className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-background text-foreground font-semibold text-lg shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
          >
            Kom igång nu – det är gratis
            <ArrowRight className="h-5 w-5" />
          </button>
          
          <p className="mt-4 text-sm opacity-60">
            Inget kreditkort krävs
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
