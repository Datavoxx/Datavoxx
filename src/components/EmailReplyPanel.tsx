import { useState, useRef, useEffect } from "react";
import { Send, Copy, ArrowLeft, User, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { EmailMessage } from "./EmailInbox";

interface EmailReplyPanelProps {
  email: EmailMessage;
  onBack: () => void;
  onGenerateReply: (directive: string) => Promise<string>;
  isGenerating: boolean;
  companyName?: string;
  userName?: string;
}

const quickDirectives = [
  { label: "Tacka & bekräfta", value: "Tacka för mejlet och bekräfta att vi återkommer" },
  { label: "Boka visning", value: "Föreslå att boka en visning/provkörning" },
  { label: "Skicka pris", value: "Bekräfta pris och tillgänglighet" },
  { label: "Nej tack", value: "Tacka artigt men avböj" },
];

const EmailReplyPanel = ({
  email,
  onBack,
  onGenerateReply,
  isGenerating,
}: EmailReplyPanelProps) => {
  const { toast } = useToast();
  const [directive, setDirective] = useState("");
  const [generatedReply, setGeneratedReply] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "d MMMM yyyy, HH:mm", { locale: sv });
    } catch {
      return "";
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [directive]);

  const handleGenerate = async () => {
    if (!directive.trim() || isGenerating) return;
    
    try {
      const reply = await onGenerateReply(directive.trim());
      setGeneratedReply(reply);
    } catch (error) {
      // Error handled in parent
    }
  };

  const handleQuickDirective = (value: string) => {
    setDirective(value);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedReply);
    toast({
      title: "Kopierat!",
      description: "Svaret har kopierats till urklipp.",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{email.subject}</h3>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1 truncate">
              <User className="h-3 w-3" />
              {email.fromName}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Calendar className="h-3 w-3" />
              {formatDate(email.date)}
            </span>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-4">
          {/* Original Email */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-2">Inkommande mejl:</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {email.body || email.preview}
            </p>
          </div>

          {/* Generated Reply */}
          {generatedReply && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-primary font-medium">Genererat svar:</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="h-7 px-2 text-xs"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Kopiera
                </Button>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {generatedReply}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Reply Input */}
      <div className="border-t border-gray-100 p-4 space-y-3">
        {/* Quick Directives */}
        <div className="flex flex-wrap gap-2">
          {quickDirectives.map((qd) => (
            <Button
              key={qd.label}
              variant="outline"
              size="sm"
              onClick={() => handleQuickDirective(qd.value)}
              className="text-xs h-7 px-2.5"
            >
              {qd.label}
            </Button>
          ))}
        </div>

        {/* Directive Input */}
        <div className="relative flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={directive}
            onChange={(e) => setDirective(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Skriv ditt direktiv... t.ex. 'Tacka och föreslå provkörning på fredag'"
            className="flex-1 min-h-[44px] max-h-[120px] px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 
                       transition-all resize-none"
            disabled={isGenerating}
            rows={1}
          />
          <Button
            onClick={handleGenerate}
            disabled={!directive.trim() || isGenerating}
            className="h-[44px] px-4"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Generera
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailReplyPanel;
