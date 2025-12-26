import { useState, useEffect } from "react";
import { History, MessageSquare, Mail, FileText, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

interface HistoryItem {
  id: string;
  title: string;
  preview: string;
  fullAnswer?: string;
  fullQuestion?: string;
  created_at: string;
  type: "research" | "email" | "ad";
}

interface HistoryPanelProps {
  type: "research" | "email" | "ad" | "all";
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (item: HistoryItem) => void;
}

const HistoryPanel = ({ type, isOpen, onClose, onSelect }: HistoryPanelProps) => {
  const { user } = useAuth();
  const [researchItems, setResearchItems] = useState<HistoryItem[]>([]);
  const [emailItems, setEmailItems] = useState<HistoryItem[]>([]);
  const [adItems, setAdItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !isOpen) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        if (type === "all") {
          // Fetch all three categories
          const [researchRes, emailRes, adRes] = await Promise.all([
            supabase
              .from("research_conversations")
              .select("id, question, answer, created_at")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(10),
            supabase
              .from("email_conversations")
              .select("id, request, response, created_at")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(10),
            supabase
              .from("ad_generations")
              .select("id, brand, model, year, generated_ad, created_at")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(10),
          ]);

          if (!researchRes.error && researchRes.data) {
            setResearchItems(researchRes.data.map((item) => ({
              id: item.id,
              title: item.question.slice(0, 50) + (item.question.length > 50 ? "..." : ""),
              preview: item.answer?.slice(0, 100) + "..." || "",
              fullAnswer: item.answer || "",
              fullQuestion: item.question,
              created_at: item.created_at,
              type: "research" as const,
            })));
          }

          if (!emailRes.error && emailRes.data) {
            setEmailItems(emailRes.data.map((item) => ({
              id: item.id,
              title: item.request.slice(0, 50) + (item.request.length > 50 ? "..." : ""),
              preview: item.response?.slice(0, 100) + "..." || "",
              created_at: item.created_at,
              type: "email" as const,
            })));
          }

          if (!adRes.error && adRes.data) {
            setAdItems(adRes.data.map((item) => ({
              id: item.id,
              title: `${item.brand} ${item.model}${item.year ? ` (${item.year})` : ""}`,
              preview: item.generated_ad?.slice(0, 100) + "..." || "",
              created_at: item.created_at,
              type: "ad" as const,
            })));
          }
        } else {
          // Original single-type logic
          let data: HistoryItem[] = [];

          if (type === "research") {
            const { data: researchData, error } = await supabase
              .from("research_conversations")
              .select("id, question, answer, created_at")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(20);

            if (!error && researchData) {
              data = researchData.map((item) => ({
                id: item.id,
                title: item.question.slice(0, 50) + (item.question.length > 50 ? "..." : ""),
                preview: item.answer?.slice(0, 100) + "..." || "",
                fullAnswer: item.answer || "",
                fullQuestion: item.question,
                created_at: item.created_at,
                type: "research" as const,
              }));
            }
          } else if (type === "email") {
            const { data: emailData, error } = await supabase
              .from("email_conversations")
              .select("id, request, response, created_at")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(20);

            if (!error && emailData) {
              data = emailData.map((item) => ({
                id: item.id,
                title: item.request.slice(0, 50) + (item.request.length > 50 ? "..." : ""),
                preview: item.response?.slice(0, 100) + "..." || "",
                created_at: item.created_at,
                type: "email" as const,
              }));
            }
          } else if (type === "ad") {
            const { data: adData, error } = await supabase
              .from("ad_generations")
              .select("id, brand, model, year, generated_ad, created_at")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false })
              .limit(20);

            if (!error && adData) {
              data = adData.map((item) => ({
                id: item.id,
                title: `${item.brand} ${item.model}${item.year ? ` (${item.year})` : ""}`,
                preview: item.generated_ad?.slice(0, 100) + "..." || "",
                created_at: item.created_at,
                type: "ad" as const,
              }));
            }
          }

          // For single type, set the appropriate state
          if (type === "research") setResearchItems(data);
          else if (type === "email") setEmailItems(data);
          else if (type === "ad") setAdItems(data);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user, type, isOpen]);

  const getIcon = (itemType: "research" | "email" | "ad") => {
    switch (itemType) {
      case "research":
        return <MessageSquare className="h-5 w-5" />;
      case "email":
        return <Mail className="h-5 w-5" />;
      case "ad":
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case "research":
        return "Tidigare research";
      case "email":
        return "Tidigare emails";
      case "ad":
        return "Tidigare annonser";
      case "all":
        return "Din historik";
    }
  };

  const renderItems = (items: HistoryItem[]) => (
    <div className="divide-y divide-gray-100">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect?.(item)}
          className="w-full p-4 text-left hover:bg-gray-50 transition-colors group"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{item.title}</p>
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">{item.preview}</p>
              <p className="text-xs text-gray-400 mt-2">
                {format(new Date(item.created_at), "d MMM yyyy, HH:mm", { locale: sv })}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 mt-1 flex-shrink-0" />
          </div>
        </button>
      ))}
    </div>
  );

  const renderSection = (title: string, icon: React.ReactNode, items: HistoryItem[]) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
        {icon}
        <h3 className="font-medium text-foreground text-sm">{title}</h3>
        <span className="text-xs text-gray-400 ml-auto">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-gray-400">
          <p className="text-sm">Ingen historik</p>
        </div>
      ) : (
        renderItems(items)
      )}
    </div>
  );

  if (!isOpen) return null;

  // Get items for single-type mode
  const singleTypeItems = type === "research" ? researchItems 
    : type === "email" ? emailItems 
    : type === "ad" ? adItems 
    : [];

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-gray-600" />
          <h2 className="font-semibold text-foreground">{getTitle()}</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600" />
          </div>
        ) : type === "all" ? (
          // All mode - show sections
          <div>
            {renderSection("Annonstextgenerator", <FileText className="h-4 w-4 text-primary" />, adItems)}
            {renderSection("Bil Research", <MessageSquare className="h-4 w-4 text-primary" />, researchItems)}
            {renderSection("Email Assistent", <Mail className="h-4 w-4 text-primary" />, emailItems)}
          </div>
        ) : singleTypeItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            {getIcon(type as "research" | "email" | "ad")}
            <p className="mt-2 text-sm">Ingen historik ännu</p>
          </div>
        ) : (
          renderItems(singleTypeItems)
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
