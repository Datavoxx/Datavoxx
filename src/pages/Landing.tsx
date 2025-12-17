import { useNavigate } from "react-router-dom";
import DecorativeBackground from "@/components/DecorativeBackground";
import bilgenLogo from "@/assets/bilgen-logo.png";
import { FileText, Search, Mail, Zap } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const tools = [
    {
      icon: FileText,
      title: "Bilannonsgenerator",
      description: "Skapa professionella bilannonser på sekunder. Slå in registreringsnummer, välj fokus och låt AI generera en säljande annons med rätt ton och innehåll."
    },
    {
      icon: Search,
      title: "Bil Research Expert",
      description: "Ställ frågor om vilken bil som helst. Få detaljerad information om vanliga problem, underhåll och allt du behöver veta innan köp eller försäljning."
    },
    {
      icon: Mail,
      title: "Email Assistent",
      description: "Skriv professionella e-postmeddelanden snabbt. Perfekt för inköpsförfrågningar eller svar till kunder med rätt ton och struktur."
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-gray-50/50 to-white animate-fade-in">
      <DecorativeBackground />

      {/* Main Content */}
      <main className="relative flex flex-col items-center justify-center min-h-screen px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <img 
            src={bilgenLogo} 
            alt="BILGEN" 
            className="h-32 mx-auto mb-10"
          />
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-4">
            AI-verktyg för bilhandlare
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Spara tid och jobba smartare med våra AI-drivna verktyg för annonser, research och kommunikation.
          </p>
        </div>

        {/* Tools Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mb-16">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-gray-100">
                  <tool.icon className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{tool.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tool.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate("/start")}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-foreground to-accent text-primary-foreground shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
        >
          <Zap className="h-5 w-5" />
          <span className="text-lg font-semibold tracking-wide">
            Kom igång nu
          </span>
        </button>

        {/* Speed tagline */}
        <p className="mt-6 text-sm text-muted-foreground">
          ⚡ 2-3X snabbare än manuellt arbete
        </p>
      </main>
    </div>
  );
};

export default Landing;
