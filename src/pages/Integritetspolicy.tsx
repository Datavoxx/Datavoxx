import { Link } from "react-router-dom";
import DecorativeBackground from "@/components/DecorativeBackground";
import { ArrowLeft, Shield, Database, Clock, Mail, AlertTriangle } from "lucide-react";

const Integritetspolicy = () => {
  const today = new Date().toLocaleDateString('sv-SE', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <DecorativeBackground />
      
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12 md:py-20">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          Tillbaka till startsidan
        </Link>

        {/* Main content card */}
        <div className="bg-background/80 backdrop-blur-md border border-border/50 rounded-2xl p-6 md:p-10 shadow-xl">
          {/* Date */}
          <p className="text-sm text-muted-foreground mb-4">
            Senast uppdaterad: {today}
          </p>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">
            Integritetspolicy
          </h1>

          {/* Beta warning */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 mb-8">
            <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">Beta-version</p>
              <p className="text-sm text-muted-foreground">
                Datavoxx är för närvarande en gratis beta-tjänst under aktiv utveckling. 
                Funktioner kan ändras, läggas till eller tas bort. Eventuella fel kan förekomma.
              </p>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {/* Om Datavoxx */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Om Datavoxx</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Datavoxx är ett svenskt SaaS-verktyg som hjälper bilhandlare att arbeta 
                effektivare med AI-drivna funktioner. Vi värnar om din integritet och 
                behandlar dina personuppgifter ansvarsfullt i enlighet med 
                dataskyddsförordningen (GDPR).
              </p>
            </section>

            {/* Vilka personuppgifter */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Database className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Vilka personuppgifter behandlar vi?</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Vi behandlar följande personuppgifter när du använder Datavoxx:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong className="text-foreground">Namn</strong> – för att identifiera dig i tjänsten</li>
                <li><strong className="text-foreground">E-postadress</strong> – för inloggning och kommunikation</li>
                <li><strong className="text-foreground">Telefonnummer</strong> – för kontakt vid behov</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Vi behandlar <strong className="text-foreground">inga känsliga personuppgifter</strong> såsom 
                hälsodata, etniskt ursprung, politiska åsikter eller liknande.
              </p>
            </section>

            {/* Hur vi använder uppgifterna */}
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-3">Hur använder vi dina uppgifter?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Dina personuppgifter används för att:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-3">
                <li>Leverera och tillhandahålla tjänsten till dig</li>
                <li>Hantera ditt användarkonto</li>
                <li>Förbättra och utveckla tjänstens funktioner</li>
                <li>Kommunicera med dig vid behov</li>
                <li>Säkerställa tjänstens säkerhet och stabilitet</li>
              </ul>
            </section>

            {/* Lagringstid */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Hur länge sparar vi dina uppgifter?</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Dina personuppgifter sparas i 90 dagar. 
                Efter denna period raderas dina uppgifter automatiskt, 
                med undantag för uppgifter vi enligt lag är skyldiga att bevara.
              </p>
            </section>

            {/* Kontakt */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Kontakt för integritetsfrågor</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Har du frågor om hur vi behandlar dina personuppgifter? Kontakta oss på:
              </p>
              <p className="mt-3">
                <a 
                  href="mailto:support@dindomän.se" 
                  className="text-primary hover:underline font-medium"
                >
                  support@dindomän.se
                </a>
              </p>
            </section>
          </div>
        </div>

        {/* Footer link back */}
        <div className="text-center mt-8">
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Tillbaka till Datavoxx
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Integritetspolicy;
