import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Copy, Mail, Reply, FileText, History, Loader2, Info, X, Pencil, ArrowDown, Inbox, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DecorativeBackground from "@/components/DecorativeBackground";
import AppHeader from "@/components/AppHeader";
import HistoryPanel from "@/components/HistoryPanel";
import EmailInbox, { EmailMessage } from "@/components/EmailInbox";
import EmailReplyPanel from "@/components/EmailReplyPanel";
import EmailConnectionRequest from "@/components/EmailConnectionRequest";

// Mahmoud's user ID - the only user with full inbox access
const MAHMOUD_USER_ID = "0cd269f7-10e0-460b-80c2-5f4a6ef2e9f3";
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
    id: "purchase",
    title: "Inköp",
    description: "Skicka ett inköpsbud på en bil du vill köpa in",
    expandedDescription: "Ange säljarens bil och ditt inköpspris. Jag skapar ett professionellt inköpserbjudande.",
    icon: <FileText className="h-6 w-6" />,
    prompt:
      "Skriv ett inköpsmejl till en säljare vars bil du vill köpa in.\n\nsäljarens bil (märke/modell/år/mil):\nditt inköpspris:\nsäljarens namn:\neventuella villkor (t.ex. besiktning, leverans):",
  },
  {
    id: "inquiry-response",
    title: "Svar på förfrågan",
    description: "Svara på en förfrågan från en potentiell kund",
    expandedDescription:
      "Klistra in kundens förfrågan så hjälper jag dig formulera ett snabbt och professionellt svar.",
    icon: <Mail className="h-6 w-6" />,
    prompt: "Svara på en kundförfrågan.\n\nkundens förfrågan:\nmitt svar ska innehålla:",
  },
];

type ViewMode = "templates" | "inbox";

const EmailAssistent = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();
  
  // Template/chat mode state
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastTemplateUsed, setLastTemplateUsed] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Inbox mode state
  const [viewMode, setViewMode] = useState<ViewMode>("templates");
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Check if current user is Mahmoud (has full inbox access)
  const isMahmoud = user?.id === MAHMOUD_USER_ID;

  // Fetch emails on mount - only for Mahmoud
  useEffect(() => {
    if (viewMode === "inbox" && isMahmoud) {
      fetchEmails();
    }
  }, [viewMode, isMahmoud]);

  const fetchEmails = async () => {
    setIsLoadingEmails(true);
    setEmailError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-emails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ limit: 30 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kunde inte hämta mejl");
      }

      setEmails(data.emails || []);
    } catch (error) {
      console.error("Error fetching emails:", error);
      setEmailError(error instanceof Error ? error.message : "Kunde inte hämta mejl");
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const handleGenerateReply = async (directive: string): Promise<string> => {
    if (!selectedEmail) throw new Error("Inget mejl valt");

    setIsGeneratingReply(true);

    try {
      const requestBody: {
        emailContext: {
          from: string;
          fromName: string;
          subject: string;
          body: string;
        };
        directive: string;
        companyName?: string;
        userName?: string;
      } = {
        emailContext: {
          from: selectedEmail.from,
          fromName: selectedEmail.fromName,
          subject: selectedEmail.subject,
          body: selectedEmail.body || selectedEmail.preview,
        },
        directive,
      };

      if (user && profile) {
        if (profile.company_name) requestBody.companyName = profile.company_name;
        if (profile.display_name) requestBody.userName = profile.display_name;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kunde inte generera svar");
      }

      // Save conversation to database if user is logged in
      if (user) {
        try {
          await supabase.from("email_conversations").insert({
            user_id: user.id,
            session_id: user.id,
            user_name: profile?.display_name || user.email || "Anonym",
            request: `Svar på mejl från ${selectedEmail.fromName}: ${directive}`,
            response: data.content,
            template_used: "inbox-reply",
          });
        } catch (saveError) {
          console.error("Error saving email conversation:", saveError);
        }
      }

      return data.content;
    } catch (error) {
      console.error("Error generating reply:", error);
      toast({
        title: "Fel",
        description: error instanceof Error ? error.message : "Kunde inte generera svar",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleSendEmail = async (to: string, subject: string, body: string): Promise<void> => {
    setIsSendingEmail(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          to,
          subject,
          body,
          inReplyTo: selectedEmail?.messageId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kunde inte skicka mejl");
      }

      toast({
        title: "Mejl skickat!",
        description: `Svaret har skickats till ${to}`,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Fel",
        description: error instanceof Error ? error.message : "Kunde inte skicka mejl",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSendingEmail(false);
    }
  };

  const toggleCardFlip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlippedCards((prev) => {
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
      textarea.style.height = "auto";
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
      const requestBody: { messages: Message[]; companyName?: string; userName?: string } = {
        messages: newMessages,
      };

      if (user && profile) {
        if (profile.company_name) requestBody.companyName = profile.company_name;
        if (profile.display_name) requestBody.userName = profile.display_name;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Kunde inte generera e-post");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.content,
      };
      setMessages([...newMessages, assistantMessage]);

      if (user) {
        try {
          await supabase.from("email_conversations").insert({
            user_id: user.id,
            session_id: user.id,
            user_name: profile?.display_name || user.email || "Anonym",
            request: userMessage.content,
            response: data.content,
            template_used: lastTemplateUsed,
          });
        } catch (saveError) {
          console.error("Error saving email conversation:", saveError);
        }
      }

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
    setSelectedEmail(null);
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
    setSelectedTemplateId(template.id);
  };

  const handleHistorySelect = (item: { id: string; title: string; preview: string }) => {
    setMessages([
      { role: "user", content: item.title },
      { role: "assistant", content: item.preview.replace("...", "") },
    ]);
    setIsHistoryOpen(false);
    setViewMode("templates");
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <DecorativeBackground />
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show "create account" prompt for anonymous users
  if (!user) {
    return (
      <div className="relative flex min-h-screen flex-col bg-slate-50">
        <DecorativeBackground />
        <AppHeader showBackButton={true} />
        
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 max-w-md text-center border border-gray-200">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Skapa ett konto för att använda Email Assistenten
            </h1>
            <p className="text-muted-foreground mb-6">
              För att kunna generera e-postmeddelanden, se din inkorg och spara historik behöver du logga in eller skapa ett konto.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate('/auth')} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Skapa konto
              </Button>
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Logga in
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50">
      <DecorativeBackground />
      
      {/* Header */}
      <AppHeader showBackButton={true} showClearButton={true} onClearClick={clearChat} />

      {/* View Mode Toggle */}
      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 pt-4">
        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-lg p-1 w-fit border border-gray-200">
          <Button
            variant={viewMode === "inbox" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("inbox")}
            className="gap-2"
          >
            <Inbox className="h-4 w-4" />
            Inkorg
          </Button>
          <Button
            variant={viewMode === "templates" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("templates")}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            Mallar
          </Button>
        </div>
      </div>

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

      {/* Main Content */}
      {viewMode === "inbox" ? (
        <main className="flex-1 overflow-hidden p-4 max-w-6xl mx-auto w-full">
          {isMahmoud ? (
            /* Mahmoud sees the full inbox */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-180px)]">
              {/* Inbox Panel */}
              <EmailInbox
                emails={emails}
                selectedEmail={selectedEmail}
                onSelectEmail={setSelectedEmail}
                onRefresh={fetchEmails}
                isLoading={isLoadingEmails}
                error={emailError}
              />

              {/* Reply Panel */}
              {selectedEmail ? (
                <EmailReplyPanel
                  email={selectedEmail}
                  onBack={() => setSelectedEmail(null)}
                  onGenerateReply={handleGenerateReply}
                  onSendEmail={handleSendEmail}
                  isGenerating={isGeneratingReply}
                  isSending={isSendingEmail}
                  companyName={profile?.company_name || undefined}
                  userName={profile?.display_name || undefined}
                />
              ) : (
                <div className="hidden lg:flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200 p-8">
                  <Reply className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">Välj ett mejl</h3>
                  <p className="text-sm text-gray-400 text-center">
                    Klicka på ett mejl i inkorgen för att generera ett svar
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Other users see the email connection request form */
            <div className="flex items-center justify-center h-[calc(100vh-180px)]">
              <EmailConnectionRequest userId={user!.id} />
            </div>
          )}
        </main>
      ) : (
        <>
          {/* Template/Chat View */}
          <main className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center pt-16 text-center">
                <div className="flex items-center gap-3 mb-3 opacity-0 animate-fade-in">
                  <Mail className="h-10 w-10 text-gray-700" />
                  <h2 className="text-4xl font-bold tracking-tight text-foreground">Email Assistent</h2>
                </div>
                <p
                  className="text-lg text-gray-500 max-w-md mb-10 opacity-0 animate-fade-in"
                  style={{ animationDelay: "50ms" }}
                >
                  Välj en mall nedan eller beskriv fritt vilket e-postmeddelande du behöver hjälp med.
                </p>

                {/* Template Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
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
                            isFlipped ? "rotate-y-180" : ""
                          }`}
                        >
                          {/* Front of card */}
                          <button
                            onClick={() => handleTemplateSelect(template)}
                            className={`absolute inset-0 backface-hidden group flex flex-col items-center justify-center p-6 rounded-xl border bg-white shadow-sm 
                                       hover:shadow-lg transition-all duration-300 ${
                                         selectedTemplateId === template.id 
                                           ? "border-primary ring-2 ring-primary/20" 
                                           : "border-gray-200 hover:border-gray-300"
                                       }`}
                          >
                            {/* Selected badge */}
                            {selectedTemplateId === template.id && (
                              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium animate-pulse">
                                <Pencil className="h-3 w-3" />
                                Redigera fälten
                                <ArrowDown className="h-3 w-3" />
                              </div>
                            )}
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
                          <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-6 rounded-xl border border-gray-200 bg-gray-50 shadow-sm">
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
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
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

          {/* Input Area for Template Mode */}
          <footer className="p-4">
            <div className="max-w-3xl mx-auto">
              <div className="relative flex items-end rounded-2xl border border-gray-200 bg-white/50 focus-within:border-gray-400 transition-all">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (selectedTemplateId) setSelectedTemplateId(null);
                  }}
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
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export default EmailAssistent;
