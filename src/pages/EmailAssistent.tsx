import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Copy, RotateCcw, Mail, MessageSquare, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import bilgenLogo from "@/assets/bilgen-logo.png";
import NameInput from "@/components/NameInput";

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
    icon: <MessageSquare className="h-5 w-5" />,
    prompt: "Skriv ett uppföljningsmail till en kund som nyligen visade intresse för en bil. Fråga mig vilken bil och kundens namn.",
  },
  {
    id: "inquiry",
    title: "Kundfråga",
    description: "Svara på en fråga från en potentiell köpare",
    icon: <Mail className="h-5 w-5" />,
    prompt: "Hjälp mig svara på en kundfråga om en bil. Berätta för mig vad kunden frågade och vilken bil det gäller.",
  },
  {
    id: "offer",
    title: "Erbjudande",
    description: "Skicka ett specialerbjudande eller kampanj",
    icon: <Tag className="h-5 w-5" />,
    prompt: "Skriv ett e-postmeddelande med ett specialerbjudande. Berätta vilken bil och vad erbjudandet innebär.",
  },
];

const EmailAssistent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border animate-fade-in-up">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
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
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in-up">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Email Assistent
            </h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Välj en mall nedan eller beskriv fritt vilket e-postmeddelande du behöver hjälp med.
            </p>
            
            {/* Template Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
              {emailTemplates.map((template, index) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="group flex flex-col items-center p-4 rounded-xl border border-border bg-card hover:bg-muted hover:border-foreground/30 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-3 rounded-full bg-muted group-hover:bg-background transition-colors duration-300 mb-3">
                    {template.icon}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{template.title}</h3>
                  <p className="text-xs text-muted-foreground text-center">{template.description}</p>
                </button>
              ))}
            </div>
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
                className={`max-w-[80%] rounded-xl p-4 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.role === "assistant" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(message.content)}
                    className="mt-2 h-8 px-2 hover:bg-background/20"
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
            <div className="bg-muted rounded-xl p-4">
              <p className="text-muted-foreground">Skriver e-post...</p>
            </div>
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="p-4 border-t border-border animate-fade-in-up">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Beskriv vad du behöver hjälp med..."
            className="resize-none min-h-[60px]"
            disabled={isLoading}
          />
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="px-4"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default EmailAssistent;
