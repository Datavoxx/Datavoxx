import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Copy, RotateCcw, Mail, MessageSquare, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserSession } from "@/hooks/useUserSession";
import bilgenLogo from "@/assets/bilgen-logo.png";
import NameInput from "@/components/NameInput";
import DecorativeBackground from "@/components/DecorativeBackground";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface EmailTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
}

const emailTemplates: EmailTemplate[] = [
  {
    id: "followup",
    title: "Uppföljning",
    description: "Följ upp med en kund efter visning eller samtal",
    icon: <MessageSquare className="h-6 w-6" />,
    prompt: "Skriv ett uppföljningsmail till en kund som nyligen visade intresse för en bil. Fråga mig vilken bil och kundens namn.",
  },
  {
    id: "inquiry",
    title: "Kundfråga",
    description: "Svara på en fråga från en potentiell köpare",
    icon: <Mail className="h-6 w-6" />,
    prompt: "Hjälp mig svara på en kundfråga om en bil. Berätta för mig vad kunden frågade och vilken bil det gäller.",
  },
  {
    id: "offer",
    title: "Erbjudande",
    description: "Skicka ett specialerbjudande eller kampanj",
    icon: <Tag className="h-6 w-6" />,
    prompt: "Skriv ett e-postmeddelande med ett specialerbjudande. Berätta vilken bil och vad erbjudandet innebär.",
  },
];

const EmailAssistent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sessionId, userName } = useUserSession();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastTemplateUsed, setLastTemplateUsed] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email-assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: newMessages }),
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

      // Save conversation to database
      try {
        await supabase.from('email_conversations').insert({
          session_id: sessionId,
          user_name: userName || 'Anonym',
          request: userMessage.content,
          response: data.content,
          template_used: lastTemplateUsed
        });
      } catch (saveError) {
        console.error("Error saving email conversation:", saveError);
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

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50">
      <DecorativeBackground />
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm animate-fade-in-up">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Tillbaka
        </Button>
        <img src={bilgenLogo} alt="BILGEN" className="h-12" />
        <div className="flex items-center gap-2">
          <NameInput />
          <Button
            variant="ghost"
            size="icon"
            onClick={clearChat}
            className="hover:bg-muted"
            title="Rensa chatt"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center pt-16 text-center animate-fade-in-up">
            <div className="flex items-center gap-3 mb-3">
              <Mail className="h-10 w-10 text-gray-700" />
              <h2 className="text-4xl font-bold tracking-tight text-foreground">
                Email Assistent
              </h2>
            </div>
            <p className="text-lg text-gray-500 max-w-md mb-10">
              Välj en mall nedan eller beskriv fritt vilket e-postmeddelande du behöver hjälp med.
            </p>
            
            {/* Template Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
              {emailTemplates.map((template, index) => (
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
              Du kan också beskriva fritt vad du behöver i fältet nedan
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } animate-fade-in-up`}
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
          <div className="flex justify-start animate-fade-in-up">
            <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100">
              <p className="text-gray-500">Skriver e-post...</p>
            </div>
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="p-4 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm animate-fade-in-up">
        <div className="flex gap-2 max-w-3xl mx-auto bg-white rounded-2xl p-3 border border-gray-200 shadow-sm 
                        hover:shadow-md focus-within:shadow-md focus-within:border-gray-400 
                        transition-all duration-300">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Beskriv vad du behöver hjälp med..."
            className="resize-none min-h-[60px] flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
            disabled={isLoading}
          />
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="rounded-xl h-12 w-12 hover:shadow-lg transition-all duration-300 self-end"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default EmailAssistent;
