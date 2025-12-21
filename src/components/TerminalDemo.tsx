import { Check, ArrowRight } from "lucide-react";

/**
 * Premium Transformation Demo
 * Shows the value proposition: Registration number → Professional car ad
 * No process visualization, only results
 */
const TerminalDemo = () => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main transformation container */}
      <div className="relative">
        {/* Split-screen transformation */}
        <div className="grid md:grid-cols-[1fr,auto,1.4fr] gap-4 md:gap-6 items-stretch">
          
          {/* INPUT SIDE - Minimal, muted */}
          <div className="relative group">
            <div 
              className="h-full rounded-2xl border border-border/40 bg-muted/30 p-6 md:p-8 flex flex-col justify-center backdrop-blur-sm"
              style={{ 
                animation: 'fade-in 0.6s ease-out forwards',
              }}
            >
              {/* License plate styling */}
              <div className="space-y-4">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-medium">
                  Registreringsnummer
                </span>
                
                <div className="relative">
                  {/* Swedish license plate style */}
                  <div className="inline-flex items-center gap-3 px-5 py-3 rounded-lg bg-background/80 border border-border/60 shadow-sm">
                    <div className="w-1.5 h-8 rounded-full bg-[#003399]" />
                    <span className="text-2xl md:text-3xl font-mono font-semibold tracking-[0.15em] text-foreground/80">
                      ABC 123
                    </span>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground/50 mt-4">
                  Det enda du behöver
                </p>
              </div>
            </div>
          </div>

          {/* TRANSFORMATION ARROW */}
          <div 
            className="flex items-center justify-center py-4 md:py-0"
            style={{ 
              animation: 'fade-in 0.8s ease-out 0.2s forwards',
              opacity: 0,
            }}
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full scale-150" />
              
              {/* Arrow container */}
              <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center">
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
            </div>
          </div>

          {/* OUTPUT SIDE - Premium, high energy */}
          <div 
            className="relative group"
            style={{ 
              animation: 'fade-in 0.6s ease-out 0.3s forwards, slide-up 0.6s ease-out 0.3s forwards',
              opacity: 0,
            }}
          >
            {/* Subtle glow behind card */}
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent rounded-3xl blur-2xl opacity-60" />
            
            <div className="relative h-full rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/[0.02] p-6 md:p-8 shadow-lg shadow-primary/5">
              {/* Ready badge */}
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <Check className="w-3 h-3 text-primary" />
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-primary">
                    Redo att publiceras
                  </span>
                </div>
              </div>
              
              {/* Car info header */}
              <div className="space-y-1 mb-5">
                <h3 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
                  Volvo XC60 D4 2019
                </h3>
                <p className="text-sm text-muted-foreground">
                  AWD Momentum · 78 000 mil
                </p>
              </div>
              
              {/* Price */}
              <div className="mb-5">
                <span className="text-2xl md:text-3xl font-bold text-foreground">
                  289 000 kr
                </span>
              </div>
              
              {/* Generated ad preview */}
              <div className="space-y-3 pt-5 border-t border-border/40">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Välskött familjebil med panoramatak och dragkrok. Servad hos märkesverkstad med fullständig servicehistorik. Inga anmärkningar vid senaste besiktning.
                </p>
                
                {/* Feature tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {['Panoramatak', 'Dragkrok', 'Navigation'].map((feature) => (
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
          className="text-center mt-8 md:mt-10"
          style={{ 
            animation: 'fade-in 0.6s ease-out 0.5s forwards',
            opacity: 0,
          }}
        >
          <p className="text-sm md:text-base text-muted-foreground">
            Från regnummer till färdig annons – <span className="text-foreground font-medium">på sekunder.</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TerminalDemo;
