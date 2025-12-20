import { useState, useEffect } from "react";

/**
 * Terminal Demo Component - Shows a code-like animation
 * Demonstrates how easy it is to use Bilgen
 */
const TerminalDemo = () => {
  const [step, setStep] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  const lines = [
    { type: 'comment', text: '// Skapa bilannons på sekunder' },
    { type: 'input', text: '> regnummer: "ABC123"' },
    { type: 'output', text: '✓ Bilinfo hämtad: Volvo XC60 D4 2019' },
    { type: 'processing', text: '⚡ Genererar annons...' },
    { type: 'success', text: '✓ Annons klar! (2.3 sekunder)' },
  ];

  useEffect(() => {
    if (step < lines.length) {
      const timer = setTimeout(() => {
        setStep((prev) => prev + 1);
      }, step === 0 ? 800 : 1200);
      return () => clearTimeout(timer);
    }
  }, [step, lines.length]);

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorTimer);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Terminal window */}
      <div className="rounded-xl overflow-hidden shadow-2xl border border-border/50">
        {/* Terminal header */}
        <div className="bg-foreground/95 px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs font-mono text-muted-foreground/60 ml-2">bilgen-cli</span>
        </div>
        
        {/* Terminal body */}
        <div className="bg-foreground p-5 font-mono text-sm min-h-[180px]">
          {lines.slice(0, step).map((line, index) => (
            <div
              key={index}
              className={`mb-2 animate-slide-up ${
                line.type === 'comment' ? 'text-muted-foreground/50' :
                line.type === 'input' ? 'text-primary-foreground/90' :
                line.type === 'output' ? 'text-blue-400' :
                line.type === 'processing' ? 'text-yellow-400' :
                line.type === 'success' ? 'text-green-400' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {line.text}
            </div>
          ))}
          
          {/* Blinking cursor */}
          {step < lines.length && (
            <span className={`inline-block w-2 h-4 bg-primary-foreground/80 ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TerminalDemo;
