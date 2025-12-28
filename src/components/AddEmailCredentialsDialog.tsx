import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface User {
  user_id: string;
  display_name: string | null;
  email: string | null;
  role: string;
}

interface AddEmailCredentialsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddEmailCredentialsDialog = ({
  isOpen,
  onClose,
  onSuccess,
}: AddEmailCredentialsDialogProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    imap_host: "",
    imap_port: "993",
    imap_username: "",
    imap_password: "",
    smtp_host: "",
    smtp_port: "465",
  });

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, display_name, email, role")
        .order("email");

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Kunde inte hämta användare");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      toast.error("Välj en användare");
      return;
    }

    if (!formData.imap_host || !formData.imap_username || !formData.imap_password) {
      toast.error("Fyll i IMAP-uppgifter");
      return;
    }

    setIsSaving(true);
    try {
      // Insert email credentials
      const { error: credError } = await supabase
        .from("email_credentials")
        .insert({
          user_id: selectedUserId,
          imap_host: formData.imap_host,
          imap_port: parseInt(formData.imap_port),
          imap_username: formData.imap_username,
          imap_password: formData.imap_password,
          smtp_host: formData.smtp_host || formData.imap_host.replace("imap", "smtp"),
          smtp_port: parseInt(formData.smtp_port),
        });

      if (credError) throw credError;

      // Update profile to mark email as connected
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
          email_connected: true,
          connected_email: formData.imap_username 
        })
        .eq("user_id", selectedUserId);

      if (profileError) {
        console.error("Could not update profile:", profileError);
      }

      toast.success("Email-uppgifter sparade!");
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Error saving credentials:", error);
      if (error.code === "23505") {
        toast.error("Användaren har redan email-credentials");
      } else {
        toast.error("Kunde inte spara: " + error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedUserId("");
    setFormData({
      imap_host: "",
      imap_port: "993",
      imap_username: "",
      imap_password: "",
      smtp_host: "",
      smtp_port: "465",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Lägg till Email Access</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User selection */}
          <div className="space-y-2">
            <Label>Välj användare</Label>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Välj användare..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.display_name || user.email || "Okänd"} 
                      {user.email && ` (${user.email})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* IMAP Settings */}
          <div className="space-y-3 pt-2 border-t">
            <p className="text-sm font-medium text-muted-foreground">IMAP-inställningar</p>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">IMAP Host</Label>
                <Input
                  placeholder="imap.one.com"
                  value={formData.imap_host}
                  onChange={(e) => setFormData({ ...formData, imap_host: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">IMAP Port</Label>
                <Input
                  type="number"
                  value={formData.imap_port}
                  onChange={(e) => setFormData({ ...formData, imap_port: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">E-postadress (IMAP Username)</Label>
              <Input
                type="email"
                placeholder="info@foretag.se"
                value={formData.imap_username}
                onChange={(e) => setFormData({ ...formData, imap_username: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Lösenord</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.imap_password}
                onChange={(e) => setFormData({ ...formData, imap_password: e.target.value })}
              />
            </div>
          </div>

          {/* SMTP Settings */}
          <div className="space-y-3 pt-2 border-t">
            <p className="text-sm font-medium text-muted-foreground">SMTP-inställningar (för att skicka)</p>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">SMTP Host</Label>
                <Input
                  placeholder="smtp.one.com"
                  value={formData.smtp_host}
                  onChange={(e) => setFormData({ ...formData, smtp_host: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">SMTP Port</Label>
                <Input
                  type="number"
                  value={formData.smtp_port}
                  onChange={(e) => setFormData({ ...formData, smtp_port: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Avbryt
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Spara
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmailCredentialsDialog;
