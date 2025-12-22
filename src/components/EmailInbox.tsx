import { useState } from "react";
import { Mail, RefreshCw, Inbox, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

export interface EmailMessage {
  id: string;
  uid: number;
  from: string;
  fromName: string;
  subject: string;
  date: string;
  preview: string;
  body: string;
  isRead: boolean;
  messageId?: string;
}

interface EmailInboxProps {
  emails: EmailMessage[];
  selectedEmail: EmailMessage | null;
  onSelectEmail: (email: EmailMessage) => void;
  onRefresh: () => void;
  isLoading: boolean;
  error: string | null;
}

const EmailInbox = ({
  emails,
  selectedEmail,
  onSelectEmail,
  onRefresh,
  isLoading,
  error,
}: EmailInboxProps) => {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      
      if (isToday) {
        return format(date, "HH:mm", { locale: sv });
      }
      return format(date, "d MMM", { locale: sv });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Inbox className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-foreground">Inkorg</h3>
          <span className="text-sm text-gray-500">({emails.length})</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 w-8"
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      </div>

      {/* Email List */}
      <ScrollArea className="flex-1">
        {isLoading && emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-3" />
            <p className="text-sm text-gray-500">Hämtar mejl...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <AlertCircle className="h-8 w-8 text-destructive mb-3" />
            <p className="text-sm text-destructive text-center">{error}</p>
            <Button variant="outline" size="sm" onClick={onRefresh} className="mt-4">
              Försök igen
            </Button>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Mail className="h-8 w-8 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">Inga mejl i inkorgen</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {emails.map((email) => (
              <button
                key={email.id}
                onClick={() => onSelectEmail(email)}
                className={cn(
                  "w-full text-left p-4 hover:bg-gray-50 transition-colors group",
                  selectedEmail?.id === email.id && "bg-primary/5 border-l-2 border-primary",
                  !email.isRead && "bg-blue-50/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={cn(
                        "text-sm truncate",
                        !email.isRead ? "font-semibold text-foreground" : "text-gray-700"
                      )}>
                        {email.fromName}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0">
                        {formatDate(email.date)}
                      </span>
                    </div>
                    <p className={cn(
                      "text-sm truncate mb-1",
                      !email.isRead ? "font-medium text-foreground" : "text-gray-600"
                    )}>
                      {email.subject}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {email.preview}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default EmailInbox;
