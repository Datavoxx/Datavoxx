/**
 * Decorative Background Component - LOCKED DESIGN
 * DO NOT change opacity above 0.08 - subtle gray is intentional
 * This creates the soft ellipse background effect used across all pages
 */
const DecorativeBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <svg
        className="absolute top-0 left-0 w-full h-full opacity-[0.06]"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <ellipse cx="200" cy="100" rx="400" ry="300" fill="currentColor" className="text-foreground" />
        <ellipse cx="1300" cy="700" rx="350" ry="250" fill="currentColor" className="text-foreground" />
      </svg>
    </div>
  );
};

export default DecorativeBackground;
