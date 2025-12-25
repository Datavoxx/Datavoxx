import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ArrowRight, Upload, Sparkles, Move, Maximize2 } from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Ladda upp din bild",
    description: "Börja med att välja en bilbild från din dator",
    icon: Upload,
  },
  {
    id: 2,
    title: "Bakgrunden tas bort",
    description: "AI:n tar automatiskt bort bakgrunden från din bild",
    icon: Sparkles,
  },
  {
    id: 3,
    title: "Justera storlek (Padding)",
    description: "Lägre värde = större bil på mallen",
    icon: Maximize2,
  },
  {
    id: 4,
    title: "Justera position (Padding Bottom)",
    description: "Lägre värde = bilen hamnar längre ner",
    icon: Move,
  },
];

interface PaddingExplainerProps {
  onStepChange?: (step: number) => void;
}

const PaddingExplainer = ({ onStepChange }: PaddingExplainerProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [paddingSize, setPaddingSize] = useState([0.25]);
  const [paddingBottom, setPaddingBottom] = useState([0.15]);
  const [isRemoving, setIsRemoving] = useState(false);

  const updateStep = (step: number) => {
    setCurrentStep(step);
    onStepChange?.(step);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      updateStep(2);
      setIsRemoving(true);
      setTimeout(() => setIsRemoving(false), 1500);
    } else if (currentStep < 4) {
      updateStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      updateStep(currentStep - 1);
    }
  };

  // Calculate car size based on padding (inverted: lower padding = bigger car)
  const carScale = 1.5 - paddingSize[0] * 2; // Range from ~1.0 to ~1.5

  // Calculate car position based on padding bottom (inverted: lower = further down)
  const carPositionY = paddingBottom[0] * 100; // 0% to 30% from bottom

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Step indicators */}
      <div className="flex justify-center gap-2 mb-6">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => updateStep(step.id)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentStep === step.id
                ? "bg-purple-600 scale-125"
                : currentStep > step.id
                ? "bg-purple-400"
                : "bg-gray-300"
            }`}
            aria-label={`Gå till steg ${step.id}`}
          />
        ))}
      </div>

      {/* Step title */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 mb-3">
          {(() => {
            const Icon = steps[currentStep - 1].icon;
            return <Icon className="h-4 w-4" />;
          })()}
          <span className="text-sm font-medium">Steg {currentStep} av 4</span>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-1">
          {steps[currentStep - 1].title}
        </h3>
        <p className="text-muted-foreground text-sm">
          {steps[currentStep - 1].description}
        </p>
      </div>

      {/* Animation area */}
      <div className="relative bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl overflow-hidden aspect-video mb-6 border border-gray-200">
        {/* Template background (showroom) - visible from step 3 */}
        {currentStep >= 3 && (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-600">
            {/* Floor reflection */}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-900/50 to-transparent" />
            {/* Spotlight effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-b-full" />
          </div>
        )}

        {/* Transparent background indicator (step 2) */}
        {currentStep === 2 && !isRemoving && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(45deg, #e5e5e5 25%, transparent 25%),
                linear-gradient(-45deg, #e5e5e5 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #e5e5e5 75%),
                linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)
              `,
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
            }}
          />
        )}

        {/* Original background (step 1 and during removal) */}
        {(currentStep === 1 || isRemoving) && (
          <div
            className={`absolute inset-0 bg-gradient-to-b from-blue-300 via-blue-400 to-green-400 transition-opacity duration-1000 ${
              isRemoving ? "opacity-0" : "opacity-100"
            }`}
          >
            {/* Simple background elements */}
            <div className="absolute top-8 right-12 w-16 h-10 bg-white/60 rounded-full" />
            <div className="absolute top-12 right-20 w-12 h-8 bg-white/40 rounded-full" />
            <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-green-500/50 to-transparent" />
          </div>
        )}

        {/* Car illustration */}
        <div
          className="absolute left-1/2 transition-all duration-500 ease-out"
          style={{
            transform: `translateX(-50%) scale(${currentStep >= 3 ? carScale : 1})`,
            bottom: currentStep >= 4 ? `${carPositionY}%` : "15%",
          }}
        >
          {/* Simple car SVG */}
          <svg
            viewBox="0 0 200 80"
            className="w-48 h-auto drop-shadow-lg"
            style={{
              filter: currentStep >= 3 ? "drop-shadow(0 10px 20px rgba(0,0,0,0.3))" : "none",
            }}
          >
            {/* Car body */}
            <path
              d="M20 50 L35 50 L45 30 L90 25 L140 25 L160 35 L180 40 L180 55 L20 55 Z"
              fill="#1e40af"
              className="transition-all duration-300"
            />
            {/* Roof */}
            <path
              d="M50 30 L85 20 L130 20 L150 30"
              fill="none"
              stroke="#1e3a8a"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Windows */}
            <path
              d="M55 30 L65 22 L95 22 L95 30 Z"
              fill="#60a5fa"
              opacity="0.8"
            />
            <path
              d="M100 22 L100 30 L135 30 L125 22 Z"
              fill="#60a5fa"
              opacity="0.8"
            />
            {/* Wheels */}
            <circle cx="50" cy="55" r="12" fill="#1f2937" />
            <circle cx="50" cy="55" r="6" fill="#6b7280" />
            <circle cx="150" cy="55" r="12" fill="#1f2937" />
            <circle cx="150" cy="55" r="6" fill="#6b7280" />
            {/* Headlights */}
            <ellipse cx="175" cy="45" rx="4" ry="3" fill="#fbbf24" />
            <ellipse cx="25" cy="52" rx="3" ry="2" fill="#ef4444" />
            {/* Details */}
            <line x1="45" y1="45" x2="160" y2="45" stroke="#1e3a8a" strokeWidth="1" />
          </svg>
        </div>

        {/* Removal animation overlay */}
        {isRemoving && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/90 rounded-full shadow-lg animate-pulse">
              <Sparkles className="h-5 w-5 text-purple-600 animate-spin" />
              <span className="text-sm font-medium text-purple-700">Tar bort bakgrund...</span>
            </div>
          </div>
        )}

        {/* Size indicator lines (step 3) */}
        {currentStep === 3 && (
          <>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 h-1/2 border-l-2 border-dashed border-yellow-400/70">
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full" />
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 h-1/2 border-r-2 border-dashed border-yellow-400/70">
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full" />
            </div>
          </>
        )}

        {/* Position indicator (step 4) */}
        {currentStep === 4 && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-4 top-4 border-l-2 border-dashed border-green-400/70">
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-green-400 rounded-full" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-green-400 rounded-full" />
            <ArrowLeft className="absolute top-1/2 -translate-y-1/2 -left-6 h-4 w-4 text-green-400 rotate-90" />
            <ArrowRight className="absolute top-1/2 -translate-y-1/2 -left-6 mt-6 h-4 w-4 text-green-400 rotate-90" />
          </div>
        )}
      </div>

      {/* Sliders */}
      {currentStep === 3 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-purple-900">Padding (storlek)</label>
            <span className="text-sm font-mono bg-purple-100 px-2 py-0.5 rounded text-purple-700">
              {paddingSize[0].toFixed(2)}
            </span>
          </div>
          <Slider
            value={paddingSize}
            onValueChange={setPaddingSize}
            min={0.05}
            max={0.45}
            step={0.01}
            className="mb-2"
          />
          <p className="text-xs text-purple-600 flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Större bil
            <span className="mx-auto">|</span>
            Mindre bil <ArrowRight className="h-3 w-3" />
          </p>
        </div>
      )}

      {currentStep === 4 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-green-900">Padding Bottom (position)</label>
            <span className="text-sm font-mono bg-green-100 px-2 py-0.5 rounded text-green-700">
              {paddingBottom[0].toFixed(2)}
            </span>
          </div>
          <Slider
            value={paddingBottom}
            onValueChange={setPaddingBottom}
            min={0}
            max={0.30}
            step={0.01}
            className="mb-2"
          />
          <p className="text-xs text-green-600 flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Längre ner
            <span className="mx-auto">|</span>
            Högre upp <ArrowRight className="h-3 w-3" />
          </p>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="border-purple-200 hover:bg-purple-50 disabled:opacity-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Föregående
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentStep === 4}
          className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
        >
          Nästa
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Summary at step 4 */}
      {currentStep === 4 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-green-50 border border-purple-200 rounded-lg animate-fade-in">
          <h4 className="font-semibold text-foreground mb-2">Sammanfattning</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Padding (övre)</strong> styr bilens storlek på mallen</li>
            <li>• <strong>Padding Bottom</strong> styr bilens vertikala position</li>
            <li>• Experimentera med båda för att hitta perfekt placering!</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PaddingExplainer;
