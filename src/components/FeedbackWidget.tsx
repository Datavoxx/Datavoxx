import { ChevronLeft } from "lucide-react";

const FeedbackWidget = () => {
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center">
      {/* Arrow */}
      <div className="flex items-center justify-center w-6 h-10 bg-primary rounded-l-md">
        <ChevronLeft className="h-4 w-4 text-primary-foreground" />
      </div>
      
      {/* Feedback box */}
      <div className="bg-primary text-primary-foreground px-3 py-4 rounded-l-md -ml-px cursor-pointer hover:bg-accent transition-colors">
        <span 
          className="text-sm font-medium tracking-wide"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          Feedback
        </span>
      </div>
    </div>
  );
};

export default FeedbackWidget;
