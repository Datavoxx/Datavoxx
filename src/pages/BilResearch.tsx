import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Send, Loader2, Wrench, Scale, Search, Car, History, Info, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DecorativeBackground from "@/components/DecorativeBackground";
import AppHeader from "@/components/AppHeader";
import HistoryPanel from "@/components/HistoryPanel";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ResearchTemplate {
  id: string;
  title: string;
  description: string;
  expandedDescription: string;
  icon: React.ReactNode;
  prompt: string;
}

const researchTemplates: ResearchTemplate[] = [
  {
    id: "problems",
    title: "Vanliga problem",
    description: "Lär dig om vanliga fel och problem",
    expandedDescription: "Denna mall hjälper dig att fråga om vanliga problem, fel och svagheter hos en specifik bilmodell. Perfekt att använda innan du ska sälja en bil för att vara förberedd på kundfrågor.",
    icon: <Wrench className="h-6 w-6" />,
    prompt: "Vilka är de vanligaste problemen med [bilmärke och modell]? Vad bör jag som säljare vara medveten om?",
  },
  {
    id: "compare",
    title: "Jämför modeller",
    description: "Jämför två bilar mot varandra",
    expandedDescription: "Jämför två bilmodeller sida vid sida. Du får fördelar och nackdelar med varje bil, samt rekommendationer för vilken som passar olika kundbehov bäst.",
    icon: <Scale className="h-6 w-6" />,
    prompt: "Jämför [bil 1] med [bil 2]. Vilka är fördelarna och nackdelarna med varje?",
  },
  {
    id: "research",
    title: "Research en bil",
    description: "Få all info om en specifik bil",
    expandedDescription: "Få en komplett översikt av en bilmodell: historik, styrkor, svagheter, vanliga problem, och viktiga säljargument. Allt du behöver veta som säljare.",
    icon: <Search className="h-6 w-6" />,
    prompt: "Berätta allt du vet om [bilmärke och modell]. Vad är fördelarna, nackdelarna, och vad bör jag som säljare veta?",
  },
];

const BilResearch = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("car-research", {
        body: { messages: newMessages },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
      };
      setMessages([...newMessages, assistantMessage]);

      // Save conversation to database only if user is logged in
      if (user) {
        try {
          await supabase.from('research_conversations').insert({
            user_id: user.id,
            session_id: user.id,
            user_name: profile?.display_name || user.email || 'Anonym',
            question: userMessage.content,
            answer: data.response
          });
        } catch (saveError) {
          console.error("Error saving conversation:", saveError);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Tyvärr uppstod ett fel. Försök igen.",
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTemplateSelect = (template: ResearchTemplate) => {
    setInput(template.prompt);
  };

  const handleHistorySelect = (item: { id: string; title: string; preview: string }) => {
    // Load the selected conversation
    setMessages([
      { role: "user", content: item.title },
      { role: "assistant", content: item.preview.replace("...", "") }
    ]);
    setIsHistoryOpen(false);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50">
      <DecorativeBackground />
      {/* Header */}
      <AppHeader showBackButton={true} />

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
          type="research"
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelect={handleHistorySelect}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
        {!hasMessages ? (
          /* Initial View - Centered */
          <div className="flex-1 flex flex-col items-center pt-16 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-3">
              <Car className="h-10 w-10 text-gray-700" />
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Vad vill du veta om din bil?
              </h1>
            </div>
            <p className="text-lg text-gray-500 mb-10 text-center">
              Välj en mall nedan eller ställ en egen fråga
            </p>
            
            {/* Template Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
              {researchTemplates.map((template, index) => {
                const isFlipped = flippedCards.has(template.id);
                return (
                  <div
                    key={template.id}
                    className="perspective-1000 h-[200px] animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
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
              Du kan också skriva en egen fråga i fältet nedan
            </p>
          </div>
        ) : (
          /* Chat Messages */
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in-up`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-white text-foreground border border-gray-100"
                  }`}
                >
                  <p className="text-sm font-medium mb-1 opacity-70">
                    {message.role === "user" ? "Du" : "🤖 Bil Research Expert"}
                  </p>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100">
                  <p className="text-sm font-medium mb-1 opacity-70">
                    🤖 Bil Research Expert
                  </p>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-gray-500">Tänker...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area */}
        <div className={`${!hasMessages ? "max-w-3xl mx-auto w-full" : ""}`}>
          <div className="relative flex items-end rounded-2xl border border-gray-200 bg-white/50 focus-within:border-gray-400 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Fråga vad som helst om bilar..."
              className="min-h-[48px] max-h-[200px] flex-1 px-4 py-3 pr-14 bg-transparent border-none 
                         focus:outline-none transition-all text-base overflow-hidden resize-none"
              disabled={isLoading}
              rows={1}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="absolute right-2 bottom-2 rounded-xl h-10 w-10 hover:shadow-lg transition-all duration-300"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BilResearch;
