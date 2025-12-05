import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Wrench, Scale, Search, Car } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserSession } from "@/hooks/useUserSession";
import DecorativeBackground from "@/components/DecorativeBackground";
import AppHeader from "@/components/AppHeader";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ResearchTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
}

const researchTemplates: ResearchTemplate[] = [
  {
    id: "problems",
    title: "Vanliga problem",
    description: "Lär dig om vanliga fel och problem",
    icon: <Wrench className="h-6 w-6" />,
    prompt: "Vilka är de vanligaste problemen med [bilmärke och modell]? Vad bör jag som säljare vara medveten om?",
  },
  {
    id: "compare",
    title: "Jämför modeller",
    description: "Jämför två bilar mot varandra",
    icon: <Scale className="h-6 w-6" />,
    prompt: "Jämför [bil 1] med [bil 2]. Vilka är fördelarna och nackdelarna med varje?",
  },
  {
    id: "research",
    title: "Research en bil",
    description: "Få all info om en specifik bil",
    icon: <Search className="h-6 w-6" />,
    prompt: "Berätta allt du vet om [bilmärke och modell]. Vad är fördelarna, nackdelarna, och vad bör jag som säljare veta?",
  },
];

const BilResearch = () => {
  const navigate = useNavigate();
  const { sessionId, userName } = useUserSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      // Save conversation to database
      try {
        await supabase.from('research_conversations').insert({
          session_id: sessionId,
          user_name: userName || 'Anonym',
          question: userMessage.content,
          answer: data.response
        });
      } catch (saveError) {
        console.error("Error saving conversation:", saveError);
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
      inputRef.current?.focus();
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

  const hasMessages = messages.length > 0;

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50">
      <DecorativeBackground />
      {/* Header */}
      <AppHeader showBackButton={true} />

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
              {researchTemplates.map((template, index) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="group flex flex-col items-center p-6 rounded-xl border border-gray-200 bg-white shadow-sm 
                             hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 hover:border-gray-300 
                             transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-4 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors duration-300 mb-4">
                    {template.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{template.title}</h3>
                  <p className="text-sm text-gray-500 text-center">{template.description}</p>
                </button>
              ))}
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
          <div className="flex gap-2 bg-white rounded-2xl p-3 border border-gray-200 shadow-sm 
                          hover:shadow-md focus-within:shadow-md focus-within:border-gray-400 
                          transition-all duration-300">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Fråga vad som helst om bilar..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="rounded-xl h-12 w-12 hover:shadow-lg transition-all duration-300"
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
