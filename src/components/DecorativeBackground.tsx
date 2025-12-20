/**
 * Decorative Background Component - Modern SaaS Gradient Orbs
 * Creates floating gradient orbs with blur for developer-first aesthetic
 */
const DecorativeBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Primary gradient orb - top left */}
      <div 
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30 animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle, hsl(250 84% 54% / 0.4) 0%, hsl(280 75% 55% / 0.2) 50%, transparent 70%)',
        }}
      />
      
      {/* Secondary gradient orb - top right */}
      <div 
        className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full opacity-25 animate-float"
        style={{
          background: 'radial-gradient(circle, hsl(280 75% 55% / 0.35) 0%, hsl(320 70% 60% / 0.15) 50%, transparent 70%)',
          animationDelay: '2s',
        }}
      />
      
      {/* Tertiary gradient orb - bottom left */}
      <div 
        className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full opacity-20 animate-float"
        style={{
          background: 'radial-gradient(circle, hsl(200 80% 55% / 0.3) 0%, hsl(250 84% 54% / 0.1) 50%, transparent 70%)',
          animationDelay: '4s',
        }}
      />
      
      {/* Small accent orb - mid right */}
      <div 
        className="absolute top-1/2 right-1/4 w-[300px] h-[300px] rounded-full opacity-15 animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle, hsl(320 70% 60% / 0.3) 0%, transparent 60%)',
          animationDelay: '1s',
        }}
      />

      {/* Subtle grid overlay for tech feel */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
};

export default DecorativeBackground;
