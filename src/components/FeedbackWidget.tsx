import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const FeedbackWidget = () => {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-end gap-2">
      {/* Hand-drawn curvy arrow pointing down */}
      <svg
        width="60"
        height="80"
        viewBox="0 0 60 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-fade-in-up animate-wiggle mr-8"
        style={{ animation: "fade-in-up 0.6s ease-out forwards, wiggle 1.5s ease-in-out infinite" }}
      >
        {/* Curvy hand-drawn style arrow */}
        <path
          d="M30 5 C25 15, 20 25, 22 35 C24 45, 32 50, 30 60"
          stroke="#000000"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          strokeLinejoin="round"
          style={{ strokeDasharray: "none" }}
        />
        {/* Arrow head */}
        <path
          d="M22 52 L30 65 L38 52"
          stroke="#000000"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {/* Feedback box */}
      <div className="max-w-[340px] rounded-xl bg-white/90 backdrop-blur-sm shadow-md border border-border p-5 animate-fade-in-up">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Vad tycker du om appen?
        </h3>
        <Textarea
          placeholder="Skriv din feedback här..."
          className="min-h-[100px] mb-3 resize-none bg-white border-border"
        />
        <Button className="w-full">
          Skicka feedback
        </Button>
      </div>
    </div>
  );
};

export default FeedbackWidget;
