import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Copy, ArrowLeft, User, Calendar, Loader2, Pencil, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { EmailMessage } from "./EmailInbox";
import { supabase } from "@/integrations/supabase/client";

interface QuickDirective {
  label: string;
  value: string;
}

interface EmailReplyPanelProps {
  email: EmailMessage;
  onBack: () => void;
  onGenerateReply: (directive: string) => Promise<string>;
  onSendEmail?: (to: string, subject: string, body: string) => Promise<void>;
  isGenerating: boolean;
  isSending?: boolean;
  companyName?: string;
  userName?: string;
  hasAIEmailAccess?: boolean;
}

// Fallback directives if AI fails
const fallbackDirectives: QuickDirective[] = [
  { label: "Boka visning", value: "Föreslå att boka en visning/provkörning" },
  { label: "Bekräfta pris", value: "Bekräfta pris och tillgänglighet" },
  { label: "Neka bud", value: "Tacka artigt men avböj budet" },
];

// Helper function to check if email body needs AI cleaning
const checkNeedsCleaning = (rawBody: string): boolean => {
  // Basic HTML/CSS patterns
  const hasHtmlOrCss = /<[^>]+>|{[^}]+}|style=|class=|Content-Type:|MIME-Version:/i.test(rawBody);
  
  // Base64-like blocks (50+ consecutive base64 characters)
  const hasBase64Pattern = /[A-Za-z0-9+/=]{50,}/.test(rawBody);
  
  // RFC 2047 encoded headers: =?UTF-8?B?... or =?ISO-8859-1?Q?...
  const hasEncodedHeaders = /=\?[A-Za-z0-9-]+\?[BQ]\?/i.test(rawBody);
  
  // Quoted-printable: multiple =XX patterns (e.g., =20, =E5, =3D)
  const quotedPrintableMatches = rawBody.match(/=[0-9A-F]{2}/gi) || [];
  const hasQuotedPrintable = quotedPrintableMatches.length > 5;
  
  // MIME boundary patterns: --boundary123
  const hasMimeBoundary = /^--[A-Za-z0-9_=-]+$/m.test(rawBody);
  
  return hasHtmlOrCss || hasBase64Pattern || hasEncodedHeaders || hasQuotedPrintable || hasMimeBoundary;
};

const EmailReplyPanel = ({
  email,
  onBack,
  onGenerateReply,
  onSendEmail,
  isGenerating,
  isSending = false,
  hasAIEmailAccess = false,
}: EmailReplyPanelProps) => {
  const { toast } = useToast();
  const [directive, setDirective] = useState("");
  const [generatedReply, setGeneratedReply] = useState("");
  const [editableReply, setEditableReply] = useState("");
  const [suggestedDirectives, setSuggestedDirectives] = useState<QuickDirective[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [cleanedEmailBody, setCleanedEmailBody] = useState<string | null>(null);
  const [isCleaningEmail, setIsCleaningEmail] = useState(false);
  const [wasManualClean, setWasManualClean] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

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

  const adjustReplyTextareaHeight = () => {
    const textarea = replyTextareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(textarea.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [directive]);

  useEffect(() => {
    adjustReplyTextareaHeight();
  }, [editableReply]);

  // Sync editableReply when generatedReply changes
  useEffect(() => {
    setEditableReply(generatedReply);
  }, [generatedReply]);

  // Fetch AI-suggested directives when email changes (only if user has AI access)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!email || !hasAIEmailAccess) {
        setSuggestedDirectives([]);
        return;
      }
      
      setIsLoadingSuggestions(true);
      setSuggestedDirectives([]);
      
      try {
        const { data, error } = await supabase.functions.invoke("email-assistant", {
          body: {
            mode: "suggest-directives",
            emailContext: {
              from: email.from,
              fromName: email.fromName,
              subject: email.subject,
              body: email.body || email.preview,
            },
          },
        });

        if (error) throw error;

        if (data?.directives && Array.isArray(data.directives) && data.directives.length > 0) {
          setSuggestedDirectives(data.directives);
        }
      } catch (error) {
        console.error("Failed to fetch directive suggestions:", error);
        // Don't show fallbacks - just show empty if AI fails
        setSuggestedDirectives([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [email?.id, hasAIEmailAccess]);

  // Function to clean email body with AI
  const performAIClean = useCallback(async (rawBody: string) => {
    setIsCleaningEmail(true);
    setCleanedEmailBody(null);

    try {
      const { data, error } = await supabase.functions.invoke("clean-email-body", {
        body: { emailBody: rawBody },
      });

      if (error) throw error;

      setCleanedEmailBody(data.cleanedBody || rawBody);
    } catch (error) {
      console.error("Failed to clean email body:", error);
      // Fallback to raw body on error
      setCleanedEmailBody(rawBody);
      toast({
        title: "Kunde inte rensa mejlet",
        description: "AI-rensningen misslyckades. Visar originalmeddelandet.",
        variant: "destructive",
      });
    } finally {
      setIsCleaningEmail(false);
    }
  }, [toast]);

  // Manual clean button handler
  const handleManualClean = useCallback(() => {
    const rawBody = email?.body || email?.preview || "";
    if (!rawBody || isCleaningEmail) return;
    
    setWasManualClean(true);
    performAIClean(rawBody);
  }, [email?.body, email?.preview, isCleaningEmail, performAIClean]);

  // Clean email body when email changes (only if user has AI access)
  useEffect(() => {
    const cleanEmailBody = async () => {
      if (!email?.body && !email?.preview) {
        setCleanedEmailBody(null);
        return;
      }

      const rawBody = email.body || email.preview || "";
      
      // If user doesn't have AI access, just show raw body without cleaning
      if (!hasAIEmailAccess) {
        setCleanedEmailBody(rawBody);
        return;
      }
      
      // Check if the body looks like it needs cleaning using improved heuristics
      const needsCleaning = checkNeedsCleaning(rawBody);
      
      if (!needsCleaning) {
        setCleanedEmailBody(rawBody);
        return;
      }

      performAIClean(rawBody);
    };

    setWasManualClean(false);
    cleanEmailBody();
  }, [email?.id, hasAIEmailAccess, performAIClean]);

  // Reset state when email changes
  useEffect(() => {
    setDirective("");
    setGeneratedReply("");
    setEditableReply("");
  }, [email?.id]);

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
    navigator.clipboard.writeText(editableReply);
    toast({
      title: "Kopierat!",
      description: "Svaret har kopierats till urklipp.",
    });
  };

  const handleSendEmail = async () => {
    if (!editableReply.trim() || !onSendEmail || isSending) return;

    try {
      await onSendEmail(email.from, email.subject, editableReply);
      toast({
        title: "Skickat!",
        description: `Mejlet har skickats till ${email.fromName}.`,
      });
      // Clear the reply after successful send
      setGeneratedReply("");
      setEditableReply("");
      setDirective("");
    } catch (error) {
      // Error handled in parent
    }
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
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                Inkommande mejl:
                {isCleaningEmail && (
                  <span className="flex items-center gap-1 text-primary">
                    <Wand2 className="h-3 w-3 animate-pulse" />
                    <span>AI rensar mejlet...</span>
                  </span>
                )}
              </p>
              {/* Manual AI clean button - only for users with AI access */}
              {hasAIEmailAccess && !isCleaningEmail && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleManualClean}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-primary"
                  title="Kör AI-rensning manuellt"
                >
                  <Wand2 className="h-3 w-3 mr-1" />
                  Rensa med AI
                </Button>
              )}
            </div>
            {isCleaningEmail ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {cleanedEmailBody || email.body || email.preview}
              </p>
            )}
          </div>

          {/* Generated/Editable Reply */}
          {(generatedReply || editableReply) && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-primary font-medium">Ditt svar:</p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => replyTextareaRef.current?.focus()}
                    className="h-7 px-2 text-xs"
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Redigera
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="h-7 px-2 text-xs"
                    disabled={!editableReply.trim()}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Kopiera
                  </Button>
                  {onSendEmail && (
                    <Button
                      size="sm"
                      onClick={handleSendEmail}
                      disabled={isSending || !editableReply.trim()}
                      className="h-7 px-3 text-xs"
                    >
                      {isSending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-3 w-3 mr-1" />
                          Skicka
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <textarea
                ref={replyTextareaRef}
                value={editableReply}
                onChange={(e) => setEditableReply(e.target.value)}
                className="w-full min-h-[120px] text-sm bg-transparent border-0 
                           focus:outline-none focus:ring-0 resize-none text-foreground
                           placeholder:text-gray-400"
                placeholder="Redigera ditt svar här..."
              />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Reply Input */}
      <div className="border-t border-gray-100 p-4 space-y-3">
        {/* AI-Suggested Quick Directives - only for users with AI email access */}
        {hasAIEmailAccess && (
          <div className="flex flex-wrap gap-2 items-center">
            {isLoadingSuggestions ? (
              <>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3 animate-pulse text-primary" />
                  <span>AI analyserar...</span>
                </div>
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-7 w-28" />
                <Skeleton className="h-7 w-20" />
              </>
            ) : (
              <>
                {suggestedDirectives.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
                    <Sparkles className="h-3 w-3 text-primary" />
                  </div>
                )}
                {suggestedDirectives.map((qd, index) => (
                  <Button
                    key={`${qd.label}-${index}`}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickDirective(qd.value)}
                    className="text-xs h-7 px-2.5 hover:bg-primary/10 hover:border-primary/30 transition-colors"
                  >
                    {qd.label}
                  </Button>
                ))}
              </>
            )}
          </div>
        )}

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