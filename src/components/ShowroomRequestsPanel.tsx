import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Send, Mail, Building2, Phone, Clock } from "lucide-react";

// Slås på när avsändardomänen showroom@bilgen.se är verifierad
export const SHOWROOM_EMAIL_READY = true;
export const SHOWROOM_TEST_RECIPIENT = "mahad@datavoxx.se";

export interface ShowroomRequest {
  id: string;
  company_name: string | null;
  contact_name: string | null;
  email: string;
  phone: string | null;
  selected_template: string | null;
  source: string;
  status: string;
  notes: string | null;
  test_sent_at: string | null;
  sent_at: string | null;
  created_at: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusLabel: Record<string, { label: string; className: string }> = {
  new: { label: "Ny", className: "bg-blue-100 text-blue-700" },
  tested: { label: "Testad", className: "bg-amber-100 text-amber-700" },
  sent: { label: "Skickad", className: "bg-emerald-100 text-emerald-700" },
};

const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" })
    : "-";

const ShowroomRequestsPanel = ({ open, onOpenChange }: Props) => {
  const [requests, setRequests] = useState<ShowroomRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ShowroomRequest | null>(null);
  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    selected_template: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("showroom_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Kunde inte hämta showroom-förfrågningar:", error);
      toast.error("Kunde inte hämta förfrågningarna");
    } else {
      setRequests((data as ShowroomRequest[]) || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (open) fetchRequests();
  }, [open, fetchRequests]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim()) {
      toast.error("E-post måste fyllas i");
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.from("showroom_requests").insert({
      company_name: form.company_name.trim() || null,
      contact_name: form.contact_name.trim() || null,
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      selected_template: form.selected_template.trim() || null,
      source: "manual",
    });
    setIsSaving(false);

    if (error) {
      console.error("Kunde inte spara förfrågan:", error);
      toast.error("Kunde inte spara förfrågan");
      return;
    }

    toast.success("Förfrågan tillagd");
    setForm({ company_name: "", contact_name: "", email: "", phone: "", selected_template: "" });
    setShowAddForm(false);
    fetchRequests();
  };

  const sendEmail = async (request: ShowroomRequest, mode: "test" | "customer") => {
    setBusyId(request.id);
    try {
      const { error } = await supabase.functions.invoke("send-showroom-email", {
        body: { requestId: request.id, mode },
      });
      if (error) throw error;

      toast.success(
        mode === "test"
          ? `Testmejl skickat till ${SHOWROOM_TEST_RECIPIENT}`
          : `Mejl skickat till ${request.email}`
      );
      fetchRequests();
    } catch (err) {
      console.error("Kunde inte skicka mejl:", err);
      toast.error("Kunde inte skicka mejlet");
    } finally {
      setBusyId(null);
      setConfirmTarget(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Showroom-förfrågningar</DialogTitle>
            <DialogDescription>
              Alla inkomna förfrågningar. Skicka alltid ett testmejl till dig själv innan du mejlar
              kunden.
            </DialogDescription>
          </DialogHeader>

          {!SHOWROOM_EMAIL_READY && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Utskick är avstängt tills avsändardomänen showroom@bilgen.se är klar. Du kan redan nu
              samla och lägga in förfrågningar här.
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setShowAddForm((v) => !v)}>
              <Plus className="h-4 w-4 mr-2" />
              Lägg till manuellt
            </Button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAdd} className="space-y-3 rounded-lg border border-border p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="company_name">Företag</Label>
                  <Input
                    id="company_name"
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                    placeholder="TH Trading"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact_name">Kontaktperson</Label>
                  <Input
                    id="contact_name"
                    value={form.contact_name}
                    onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="req_email">E-post *</Label>
                  <Input
                    id="req_email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="req_phone">Telefon</Label>
                  <Input
                    id="req_phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="req_template">Vald mall</Label>
                  <Input
                    id="req_template"
                    value={form.selected_template}
                    onChange={(e) => setForm({ ...form, selected_template: e.target.value })}
                    placeholder="Showroom 1"
                  />
                </div>
              </div>
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Spara förfrågan
              </Button>
            </form>
          )}

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">
              Inga showroom-förfrågningar än.
            </p>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => {
                const status = statusLabel[request.status] || statusLabel.new;
                const busy = busyId === request.id;
                return (
                  <div key={request.id} className="rounded-lg border border-border p-4 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 font-medium">
                          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="truncate">
                            {request.company_name || request.contact_name || "Okänt företag"}
                          </span>
                        </div>
                        <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                          <p className="flex items-center gap-2 truncate">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            {request.email}
                          </p>
                          {request.phone && (
                            <p className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 shrink-0" />
                              {request.phone}
                            </p>
                          )}
                          <p className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            {formatDate(request.created_at)}
                          </p>
                          {request.selected_template && (
                            <p className="truncate">Mall: {request.selected_template}</p>
                          )}
                        </div>
                      </div>
                      <Badge className={status.className}>{status.label}</Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!SHOWROOM_EMAIL_READY || busy}
                        onClick={() => sendEmail(request, "test")}
                      >
                        {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Skicka test till mig
                      </Button>
                      <Button
                        size="sm"
                        disabled={!SHOWROOM_EMAIL_READY || busy || !request.test_sent_at}
                        onClick={() => setConfirmTarget(request)}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Skicka till kund
                      </Button>
                    </div>

                    {(request.test_sent_at || request.sent_at) && (
                      <p className="text-xs text-muted-foreground">
                        {request.test_sent_at && `Test: ${formatDate(request.test_sent_at)}`}
                        {request.test_sent_at && request.sent_at && " · "}
                        {request.sent_at && `Skickat: ${formatDate(request.sent_at)}`}
                      </p>
                    )}
                    {!request.test_sent_at && SHOWROOM_EMAIL_READY && (
                      <p className="text-xs text-muted-foreground">
                        Skicka ett testmejl först för att låsa upp utskick till kund.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(o) => !o && setConfirmTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Skicka till kund?</AlertDialogTitle>
            <AlertDialogDescription>
              Mejlet skickas till {confirmTarget?.email}. Detta går inte att ångra.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmTarget && sendEmail(confirmTarget, "customer")}
            >
              Skicka
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ShowroomRequestsPanel;
