import { Check, Car, CreditCard, Target } from "lucide-react";

/**
 * Premium Transformation Demo
 * Shows: 3 inputs (reg, financing, focus) → Professional car ad
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

          {/* OUTPUT SIDE - Premium Result */}
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
              
              {/* Ready badge with shimmer */}
              <div className="relative flex items-center gap-2 mb-5">
                <div className="relative overflow-hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25">
                  <div className="absolute inset-0 shimmer-badge" />
                  <Check className="relative w-3.5 h-3.5 text-primary" />
                  <span className="relative text-[10px] uppercase tracking-wider font-semibold text-primary">
                    Redo att publiceras
                  </span>
                </div>
              </div>
              
              {/* Car image placeholder */}
              <div className="relative mb-5 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/30 p-4 aspect-[16/9] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
                <Car className="w-12 h-12 text-muted-foreground/30" />
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm border border-border/40">
                  <span className="text-[10px] text-muted-foreground">3 bilder</span>
                </div>
              </div>
              
              {/* Car info */}
              <div className="space-y-1 mb-4">
                <h3 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
                  Volvo XC60 D4 2019
                </h3>
                <p className="text-sm text-muted-foreground">
                  AWD Momentum · 78 000 mil
                </p>
              </div>
              
              {/* Price with glow */}
              <div className="mb-5">
                <span className="text-3xl md:text-4xl font-bold text-foreground">
                  289 000 kr
                </span>
                <span className="ml-2 text-sm text-primary font-medium">
                  från 2 890 kr/mån
                </span>
              </div>
              
              {/* Generated ad preview */}
              <div className="space-y-3 pt-5 border-t border-border/40">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Välskött familjebil med panoramatak och dragkrok. Servad hos märkesverkstad med fullständig servicehistorik.
                </p>
                
                {/* Feature tags */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {['Panoramatak', 'Dragkrok', 'Navigation', 'Kamera'].map((feature) => (
                    <span 
                      key={feature}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-muted/50 text-muted-foreground border border-border/30"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
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
            Tre val. En professionell annons. <span className="text-foreground font-medium">Klart.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TerminalDemo;
