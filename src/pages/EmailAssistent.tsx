import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Copy, Mail, MessageSquare, Tag, History, Loader2, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DecorativeBackground from "@/components/DecorativeBackground";
import AppHeader from "@/components/AppHeader";
import HistoryPanel from "@/components/HistoryPanel";
import FeedbackWidget from "@/components/FeedbackWidget";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface EmailTemplate {
  id: string;
  title: string;
  description: string;
  expandedDescription: string;
  icon: React.ReactNode;
  prompt: string;
}

const emailTemplates: EmailTemplate[] = [
  {
    id: "followup",
    title: "Uppföljning",
    description: "Följ upp med en kund efter visning eller samtal",
    expandedDescription: "Generera ett professionellt uppföljningsmail efter kundkontakt. Perfekt för att hålla kunden varm och öka chansen till affär.",
    icon: <MessageSquare className="h-6 w-6" />,
    prompt: "Skriv ett uppföljningsmail till en kund som nyligen visade intresse för en bil. Fråga mig vilken bil och kundens namn.",
  },
  {
    id: "inquiry",
    title: "Kundfråga",
    description: "Svara på en fråga från en potentiell köpare",
    expandedDescription: "Få hjälp att formulera ett professionellt och säljande svar på kundens frågor om en specifik bil.",
    icon: <Mail className="h-6 w-6" />,
    prompt: "Hjälp mig svara på en kundfråga om en bil. Berätta för mig vad kunden frågade och vilken bil det gäller.",
  },
  {
    id: "offer",
    title: "Erbjudande",
    description: "Skicka ett specialerbjudande eller kampanj",
    expandedDescription: "Skapa ett lockande erbjudandemail med rätt ton och tydligt call-to-action för att driva kunden mot köp.",
    icon: <Tag className="h-6 w-6" />,
    prompt: "Skriv ett e-postmeddelande med ett specialerbjudande. Berätta vilken bil och vad erbjudandet innebär.",
  },
];

const EmailAssistent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastTemplateUsed, setLastTemplateUsed] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleCardFlip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Build request body - include user info only if logged in
      const requestBody: { messages: Message[]; companyName?: string; userName?: string } = {
        messages: newMessages,
      };
      
      if (user && profile) {
        if (profile.company_name) requestBody.companyName = profile.company_name;
        if (profile.display_name) requestBody.userName = profile.display_name;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email-assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error("Kunde inte generera e-post");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.content,
      };
      setMessages([...newMessages, assistantMessage]);

      // Save conversation to database only if user is logged in
      if (user) {
        try {
          await supabase.from('email_conversations').insert({
            user_id: user.id,
            session_id: user.id,
            user_name: profile?.display_name || user.email || 'Anonym',
            request: userMessage.content,
            response: data.content,
            template_used: lastTemplateUsed
          });
        } catch (saveError) {
          console.error("Error saving email conversation:", saveError);
        }
      }
      
      // Reset template tracking after use
      setLastTemplateUsed(null);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Fel",
        description: "Något gick fel. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopierat!",
      description: "E-postmeddelandet har kopierats till urklipp.",
    });
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTemplateSelect = (template: EmailTemplate) => {
    setInput(template.prompt);
    setLastTemplateUsed(template.id);
  };

  const handleHistorySelect = (item: { id: string; title: string; preview: string }) => {
    setMessages([
      { role: "user", content: item.title },
      { role: "assistant", content: item.preview.replace("...", "") }
    ]);
    setIsHistoryOpen(false);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50">
      <DecorativeBackground />
      <FeedbackWidget />
      {/* Header */}
      <AppHeader showBackButton={true} showClearButton={true} onClearClick={clearChat} />

      {/* History Button - only for logged in users */}
      {user && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsHistoryOpen(true)}
          className="fixed right-4 top-20 z-40 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <History className="h-5 w-5" />
        </Button>
      )}

      {/* History Panel - only for logged in users */}
      {user && (
        <HistoryPanel
          type="email"
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelect={handleHistorySelect}
        />
      )}

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center pt-16 text-center">
            <div className="flex items-center gap-3 mb-3 opacity-0 animate-fade-in">
              <Mail className="h-10 w-10 text-gray-700" />
              <h2 className="text-4xl font-bold tracking-tight text-foreground">
                Email Assistent
              </h2>
            </div>
            <p className="text-lg text-gray-500 max-w-md mb-10 opacity-0 animate-fade-in" style={{ animationDelay: "50ms" }}>
              Välj en mall nedan eller beskriv fritt vilket e-postmeddelande du behöver hjälp med.
            </p>
            
            {/* Template Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
              {emailTemplates.map((template, index) => {
                const isFlipped = flippedCards.has(template.id);
                return (
                  <div
                    key={template.id}
                    className="perspective-1000 h-[200px] opacity-0 animate-fade-in"
                    style={{ animationDelay: `${100 + index * 50}ms` }}
                  >
                    <div
                      className={`relative w-full h-full transform-style-3d transition-transform duration-500 ${
                        isFlipped ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* Front of card */}
                      <button
                        onClick={() => handleTemplateSelect(template)}
                        className="absolute inset-0 backface-hidden group flex flex-col items-center justify-center p-6 rounded-xl border border-gray-200 bg-white shadow-sm 
                                   hover:shadow-lg hover:border-gray-300 transition-all duration-300"
                      >
                        {/* Info button */}
                        <button
                          onClick={(e) => toggleCardFlip(template.id, e)}
                          className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                          <Info className="h-4 w-4 text-gray-500" />
                        </button>
                        <div className="p-4 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors duration-300 mb-4">
                          {template.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">{template.title}</h3>
                        <p className="text-sm text-gray-500 text-center">{template.description}</p>
                      </button>

                      {/* Back of card */}
                      <div
                        className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-6 rounded-xl border border-gray-200 bg-gray-50 shadow-sm"
                      >
                        {/* Close button */}
                        <button
                          onClick={(e) => toggleCardFlip(template.id, e)}
                          className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                        >
                          <X className="h-4 w-4 text-gray-600" />
                        </button>
                        <h3 className="text-lg font-semibold text-foreground mb-3">{template.title}</h3>
                        <p className="text-sm text-gray-600 text-center leading-relaxed">
                          {template.expandedDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Microcopy guide */}
            <p className="text-sm text-gray-400 mt-10 text-center">
              Du kan också beskriva fritt vad du behöver i fältet nedan
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } animate-fade-in`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-white text-foreground border border-gray-100"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.role === "assistant" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(message.content)}
                    className="mt-2 h-8 px-2 hover:bg-gray-100"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Kopiera
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100">
              <p className="text-gray-500">Skriver e-post...</p>
            </div>
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="p-4">
        <div className="relative flex items-end max-w-3xl mx-auto rounded-2xl border border-gray-200 bg-white/50 focus-within:border-gray-400 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Beskriv vad du behöver hjälp med..."
            className="min-h-[48px] max-h-[200px] flex-1 px-4 py-3 pr-14 bg-transparent border-none 
                       focus:outline-none transition-all text-base overflow-hidden resize-none"
            disabled={isLoading}
            rows={1}
          />
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="absolute right-2 bottom-2 rounded-xl h-10 w-10 hover:shadow-lg transition-all duration-300"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default EmailAssistent;
