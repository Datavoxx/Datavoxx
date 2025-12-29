import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Check, X, Calendar, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";

export interface EmailUsageUser {
  user_id: string;
  user_name: string;
  total_emails: number;
  last_activity: string;
  has_credentials: boolean;
  company_name?: string;
  email?: string;
}

interface EmailUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: EmailUsageUser[];
}

const EmailUsageModal = ({ isOpen, onClose, users }: EmailUsageModalProps) => {
  const [sortBy, setSortBy] = useState<"emails" | "date">("date");

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      if (sortBy === "emails") {
        return b.total_emails - a.total_emails;
      }
      return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime();
    });
  }, [users, sortBy]);

  const totalEmails = users.reduce((sum, u) => sum + u.total_emails, 0);
  const usersWithCredentials = users.filter((u) => u.has_credentials).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Mail className="h-5 w-5 text-purple-500" />
            Email Assistant Användning
          </DialogTitle>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{users.length}</p>
            <p className="text-xs text-muted-foreground">Aktiva användare</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{totalEmails}</p>
            <p className="text-xs text-muted-foreground">Genererade mejl</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{usersWithCredentials}</p>
            <p className="text-xs text-muted-foreground">Med e-post kopplad</p>
          </div>
        </div>

        {/* Sort Buttons */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setSortBy("date")}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              sortBy === "date"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            Senast aktiv
          </button>
          <button
            onClick={() => setSortBy("emails")}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              sortBy === "emails"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            Flest mejl
          </button>
        </div>

        {/* User List */}
        <ScrollArea className="h-[400px] pr-4">
          {sortedUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Inga användare har använt Email Assistant ännu.
            </p>
          ) : (
            <div className="space-y-3">
              {sortedUsers.map((user) => (
                <div
                  key={user.user_id}
                  className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {user.user_name || "Okänd användare"}
                        </h3>
                        {user.has_credentials ? (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <Check className="h-3 w-3 mr-1" />
                            E-post kopplad
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground">
                            <X className="h-3 w-3 mr-1" />
                            Ej kopplad
                          </Badge>
                        )}
                      </div>
                      {user.company_name && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {user.company_name}
                        </p>
                      )}
                      {user.email && (
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-primary">
                        <MessageSquare className="h-4 w-4" />
                        <span className="font-bold">{user.total_emails}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(user.last_activity), "d MMM yyyy", { locale: sv })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EmailUsageModal;
