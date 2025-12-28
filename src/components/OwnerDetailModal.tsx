import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ModalDataType =
  | "users"
  | "ads"
  | "emails"
  | "research"
  | "template_requests"
  | "bonus_requests"
  | "help_requests"
  | "feedback"
  | "credits"
  | "email_connections"
  | "tool_requests"
  | "profiles";

interface OwnerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataType: ModalDataType;
  data: any[];
  onDataUpdate?: () => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const OwnerDetailModal = ({
  isOpen,
  onClose,
  dataType,
  data,
  onDataUpdate,
}: OwnerDetailModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleStatusChange = async (
    table: string,
    id: string,
    newStatus: string
  ) => {
    try {
      const { error } = await supabase
        .from(table as any)
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success("Status uppdaterad");
      onDataUpdate?.();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Kunde inte uppdatera status");
    }
  };

  const filteredData = useMemo(() => {
    let result = data.filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      const values = Object.values(item).join(" ").toLowerCase();
      return values.includes(searchLower);
    });

    result.sort((a, b) => {
      const dateA = new Date(a.created_at || a.date || 0).getTime();
      const dateB = new Date(b.created_at || b.date || 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [data, searchTerm, sortOrder]);

  const getTitle = () => {
    const titles: Record<ModalDataType, string> = {
      users: "Alla användare",
      ads: "Alla annonser",
      emails: "Alla email-konversationer",
      research: "Alla research-konversationer",
      template_requests: "Alla mallförfrågningar",
      bonus_requests: "Alla bonus-förfrågningar",
      help_requests: "Alla hjälpförfrågningar",
      feedback: "All feedback",
      credits: "Credits-användning",
      email_connections: "Email-kopplingar",
      tool_requests: "Verktygsförfrågningar",
      profiles: "Alla profiler",
    };
    return titles[dataType];
  };

  const renderItem = (item: any) => {
    const isExpanded = expandedIds.has(item.id);

    switch (dataType) {
      case "users":
        return (
          <div
            key={item.id}
            className="p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">{item.display_name || "Okänd"}</p>
                <p className="text-sm text-muted-foreground">{item.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Registrerad: {formatDate(item.created_at)}
                </p>
              </div>
              <Badge variant={item.role === "owner" ? "default" : "secondary"}>
                {item.role}
              </Badge>
            </div>
          </div>
        );

      case "ads":
        return (
          <div
            key={item.id}
            className="p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
            onClick={() => toggleExpanded(item.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <p className="font-medium">
                  {item.brand} {item.model} {item.year}
                </p>
                <p className="text-sm text-muted-foreground">
                  Av: {item.user_name} • {formatDate(item.created_at)}
                </p>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            {isExpanded && (
              <div className="mt-3 pt-3 border-t space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {item.mileage && (
                    <p>
                      <span className="text-muted-foreground">Miltal:</span>{" "}
                      {item.mileage}
                    </p>
                  )}
                  {item.price && (
                    <p>
                      <span className="text-muted-foreground">Pris:</span>{" "}
                      {item.price}
                    </p>
                  )}
                  {item.condition && (
                    <p>
                      <span className="text-muted-foreground">Skick:</span>{" "}
                      {item.condition}
                    </p>
                  )}
                  {item.tone && (
                    <p>
                      <span className="text-muted-foreground">Ton:</span>{" "}
                      {item.tone}
                    </p>
                  )}
                </div>
                {item.equipment && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Utrustning:</span>{" "}
                    {item.equipment}
                  </p>
                )}
                {item.generated_ad && (
                  <div className="mt-2 p-3 bg-background rounded border">
                    <p className="text-xs text-muted-foreground mb-1">
                      Genererad annons:
                    </p>
                    <p className="text-sm whitespace-pre-wrap">
                      {item.generated_ad}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "emails":
        return (
          <div
            key={item.id}
            className="p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
            onClick={() => toggleExpanded(item.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <p className="font-medium">{item.user_name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(item.created_at)}
                </p>
              </div>
              {item.template_used && (
                <Badge variant="outline">{item.template_used}</Badge>
              )}
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />
              )}
            </div>
            {!isExpanded && (
              <p className="text-sm text-muted-foreground truncate">
                {item.request}
              </p>
            )}
            {isExpanded && (
              <div className="mt-3 pt-3 border-t space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Förfrågan:
                  </p>
                  <p className="text-sm whitespace-pre-wrap">{item.request}</p>
                </div>
                {item.response && (
                  <div className="p-3 bg-background rounded border">
                    <p className="text-xs text-muted-foreground mb-1">Svar:</p>
                    <p className="text-sm whitespace-pre-wrap">
                      {item.response}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "research":
        return (
          <div
            key={item.id}
            className="p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
            onClick={() => toggleExpanded(item.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <p className="font-medium">{item.user_name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(item.created_at)}
                </p>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            {!isExpanded && (
              <p className="text-sm text-muted-foreground truncate">
                {item.question}
              </p>
            )}
            {isExpanded && (
              <div className="mt-3 pt-3 border-t space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Fråga:</p>
                  <p className="text-sm whitespace-pre-wrap">{item.question}</p>
                </div>
                {item.answer && (
                  <div className="p-3 bg-background rounded border">
                    <p className="text-xs text-muted-foreground mb-1">Svar:</p>
                    <p className="text-sm whitespace-pre-wrap">{item.answer}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "template_requests":
        return (
          <div key={item.id} className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <p className="font-medium">{item.company_name}</p>
                <p className="text-sm text-muted-foreground">{item.email}</p>
                {item.phone && (
                  <p className="text-sm text-muted-foreground">{item.phone}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(item.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={item.status}
                  onValueChange={(value) =>
                    handleStatusChange("template_requests", item.id, value)
                  }
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Godkänd</SelectItem>
                    <SelectItem value="rejected">Nekad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {item.logo_url && (
              <a
                href={item.logo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Se logo
              </a>
            )}
          </div>
        );

      case "bonus_requests":
        return (
          <div key={item.id} className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">{item.template_name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(item.created_at)}
                </p>
              </div>
              <Select
                value={item.status}
                onValueChange={(value) =>
                  handleStatusChange("bonus_requests", item.id, value)
                }
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Godkänd</SelectItem>
                  <SelectItem value="rejected">Nekad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "help_requests":
        return (
          <div
            key={item.id}
            className="p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
            onClick={() => toggleExpanded(item.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <p className="font-medium">{item.email}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(item.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{item.help_topic}</Badge>
                {item.wants_pdf && <Badge variant="outline">Vill ha PDF</Badge>}
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
            {isExpanded && item.description && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm whitespace-pre-wrap">{item.description}</p>
              </div>
            )}
          </div>
        );

      case "feedback":
        return (
          <div
            key={item.id}
            className="p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
            onClick={() => toggleExpanded(item.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <p className="font-medium">{item.email}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(item.created_at)}
                </p>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {item.services?.map((s: string) => (
                <Badge key={s} variant="outline" className="text-xs">
                  {s}
                </Badge>
              ))}
            </div>
            {!isExpanded && (
              <p className="text-sm text-muted-foreground truncate">
                {item.message}
              </p>
            )}
            {isExpanded && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm whitespace-pre-wrap">{item.message}</p>
              </div>
            )}
          </div>
        );

      case "credits":
        return (
          <div key={item.id} className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">
                  {item.date} • {item.credits_used} credits
                </p>
                <p className="text-sm text-muted-foreground">
                  Session: {item.session_id?.substring(0, 8)}...
                </p>
              </div>
            </div>
          </div>
        );

      case "email_connections":
        return (
          <div key={item.id} className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <p className="font-medium">
                  {item.contact_name || item.company_name || "Okänd"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.email_address || item.phone_number}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Typ: {item.request_type} • {formatDate(item.created_at)}
                </p>
              </div>
              <Badge
                variant={item.status === "pending" ? "secondary" : "default"}
              >
                {item.status}
              </Badge>
            </div>
          </div>
        );

      case "tool_requests":
        return (
          <div key={item.id} className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <p className="font-medium">{item.tool_name}</p>
                {item.note && (
                  <p className="text-sm text-muted-foreground">{item.note}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(item.created_at)}
                </p>
              </div>
              <Select
                value={item.status}
                onValueChange={(value) =>
                  handleStatusChange("tool_access_requests", item.id, value)
                }
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Godkänd</SelectItem>
                  <SelectItem value="rejected">Nekad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "profiles":
        return (
          <div key={item.id} className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">
                  {item.display_name || item.email || "Okänd"}
                </p>
                {item.company_name && (
                  <p className="text-sm text-muted-foreground">
                    {item.company_name}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">{item.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  {item.email_connected && (
                    <Badge variant="outline" className="text-xs">
                      Email kopplad
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {getTitle()} ({filteredData.length})
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sök..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={sortOrder}
            onValueChange={(v) => setSortOrder(v as "newest" | "oldest")}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Nyast först</SelectItem>
              <SelectItem value="oldest">Äldst först</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="flex-1 min-h-0 pr-4">
          <div className="space-y-2">
            {filteredData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Ingen data hittad
              </p>
            ) : (
              filteredData.map((item) => renderItem(item))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default OwnerDetailModal;
