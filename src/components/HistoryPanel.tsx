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
  type: "research" | "email" | "ad";
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (item: HistoryItem) => void;
}

const HistoryPanel = ({ type, isOpen, onClose, onSelect }: HistoryPanelProps) => {
  const { user } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !isOpen) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
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

        setItems(data);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user, type, isOpen]);

  const getIcon = () => {
    switch (type) {
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
    }
  };

  if (!isOpen) return null;

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
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            {getIcon()}
            <p className="mt-2 text-sm">Ingen historik ännu</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
