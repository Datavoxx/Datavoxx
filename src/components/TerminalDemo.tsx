import { Car, CreditCard, Target, Copy } from "lucide-react";

/**
 * Premium Transformation Demo
 * Shows: 3 inputs (reg, financing, focus) → Generated ad TEXT
 * Cinematic, modern SaaS aesthetic
 */
const TerminalDemo = () => {
  const inputSteps = [
    {
      icon: Car,
      label: "Registreringsnummer",
      value: "ABC 123",
      isPlate: true,
    },
    {
      icon: CreditCard,
      label: "Finansiering",
      value: "3,95% ränta · Kampanj",
    },
    {
      icon: Target,
      label: "Annonsens fokus",
      value: "Finansiering först",
    },
  ];

  const generatedAdText = `Januari-rea! Just nu erbjuder vi förmånlig kampanjfinansiering med endast 3,95% i ränta vid köp i samband med vår januarikampanj. Ett fantastiskt tillfälle att göra en riktigt bra bilaffär!

Nu till bilen: Vi har en Volvo XC60 D4 AWD Momentum, årsmodell 2019. En robust och välutrustad SUV med panoramatak, navigation och dragkrok.

Bilen är servad hos märkesverkstad och har fullständig servicehistorik. Kontakta oss för provkörning eller mer information!`;

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Main transformation container */}
      <div className="relative">
        {/* Background glow orbs */}
        <div className="absolute -inset-20 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        </div>

        {/* Split-screen transformation */}
        <div className="relative grid md:grid-cols-[1fr,auto,1.3fr] gap-4 md:gap-8 items-stretch">
          
          {/* INPUT SIDE - 3 Steps */}
          <div 
            className="relative"
            style={{ 
              animation: 'fade-in 0.5s ease-out forwards, slide-up 0.5s ease-out forwards',
              opacity: 0,
            }}
          >
            <div className="h-full rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 md:p-8">
              {/* Header */}
              <div className="mb-6">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-medium">
                  Dina val
                </span>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                {inputSteps.map((step, index) => (
                  <div 
                    key={step.label}
                    className="group"
                    style={{ 
                      animation: 'fade-in 0.4s ease-out forwards',
                      animationDelay: `${0.2 + index * 0.1}s`,
                      opacity: 0,
                    }}
                  >
                    <div className="flex items-start gap-4 p-3 rounded-xl transition-all duration-300 hover:bg-muted/30">
                      {/* Icon container */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <step.icon className="w-5 h-5 text-primary" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">
                          {step.label}
                        </span>
                        
                        {step.isPlate ? (
                          <div className="mt-1.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-background/80 border border-border/60">
                            <div className="w-1 h-5 rounded-full bg-[#003399]" />
                            <span className="text-base font-mono font-semibold tracking-[0.1em] text-foreground/90">
                              {step.value}
                            </span>
                          </div>
                        ) : (
                          <p className="mt-1 text-sm font-medium text-foreground/80">
                            {step.value}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Separator */}
                    {index < inputSteps.length - 1 && (
                      <div className="ml-8 mt-2 mb-2 h-px bg-gradient-to-r from-border/40 via-border/20 to-transparent" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TRANSFORMATION ELEMENT - Animated */}
          <div 
            className="flex items-center justify-center py-4 md:py-0"
            style={{ 
              animation: 'fade-in 0.6s ease-out 0.4s forwards',
              opacity: 0,
            }}
          >
            <div className="relative flex flex-col items-center gap-2">
              {/* Pulsing connection line (vertical on mobile, hidden on desktop) */}
              <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
              
              {/* Main orb */}
              <div className="relative">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-xl scale-150 animate-pulse-glow" />
                
                {/* Middle ring */}
                <div className="absolute inset-[-4px] rounded-full border border-primary/20 animate-[spin_8s_linear_infinite]">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary/60" />
                </div>
                
                {/* Core */}
                <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center backdrop-blur-sm">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* OUTPUT SIDE - Generated Ad Text */}
          <div 
            className="relative"
            style={{ 
              animation: 'fade-in 0.6s ease-out 0.5s forwards, slide-up 0.6s ease-out 0.5s forwards',
              opacity: 0,
            }}
          >
            {/* Glow behind card */}
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/8 via-accent/5 to-transparent rounded-3xl blur-2xl" />
            
            <div className="relative h-full rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/[0.03] p-6 md:p-8 shadow-xl shadow-primary/5 overflow-hidden">
              {/* Shimmer overlay */}
              <div className="absolute inset-0 shimmer-effect pointer-events-none" />
              
              {/* Header with copy indicator */}
              <div className="relative flex items-center justify-between mb-5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-medium">
                  Din genererade annonstext
                </span>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/15 transition-colors">
                  <Copy className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] font-medium text-primary">
                    Kopiera
                  </span>
                </div>
              </div>
              
              {/* Generated text content */}
              <div className="relative space-y-4">
                {generatedAdText.split('\n\n').map((paragraph, index) => (
                  <p 
                    key={index}
                    className="text-sm md:text-base leading-relaxed text-foreground/85"
                    style={{
                      animation: 'fade-in 0.4s ease-out forwards',
                      animationDelay: `${0.6 + index * 0.1}s`,
                      opacity: 0,
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              
              {/* Subtle footer indicator */}
              <div className="mt-6 pt-4 border-t border-border/30 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
                <span className="text-[11px] text-muted-foreground/60">
                  Redo att klistras in på Blocket, Bytbil, Facebook...
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div 
          className="text-center mt-10 md:mt-12"
          style={{ 
            animation: 'fade-in 0.6s ease-out 0.7s forwards',
            opacity: 0,
          }}
        >
          <p className="text-base md:text-lg text-muted-foreground">
            Från regnummer till säljande annonstext – <span className="text-foreground font-medium">på sekunder.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TerminalDemo;
