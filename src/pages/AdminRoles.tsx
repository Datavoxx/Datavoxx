import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import DecorativeBackground from "@/components/DecorativeBackground";
import { Loader2, Shield, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserRole {
  id: string | null;
  user_id: string | null;
  role: string | null;
  created_at: string | null;
  name: string | null;
  company_name: string | null;
  email: string | null;
}

const ADMIN_USER_ID = "bc8ed488-4ebc-49b1-988b-4b0e926c7b8d";

const AdminRoles = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.id !== ADMIN_USER_ID)) {
      navigate("/");
      return;
    }

    if (user && user.id === ADMIN_USER_ID) {
      fetchUserRoles();
    }
  }, [user, authLoading, navigate]);

  const fetchUserRoles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("user_roles_with_details")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user roles:", error);
        setError("Kunde inte hämta användarroller");
        return;
      }

      setUserRoles(data || []);
    } catch (err) {
      console.error("Error:", err);
      setError("Ett oväntat fel inträffade");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleBadgeStyle = (role: string | null) => {
    switch (role) {
      case "ai_email":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || user.id !== ADMIN_USER_ID) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <DecorativeBackground />
      <AppHeader showBackButton backPath="/start" />

      <main className="relative mx-auto max-w-5xl px-6 pt-24 pb-16">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-background">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Rollhantering
              </h1>
              <p className="text-muted-foreground">
                Administrera användarroller och behörigheter
              </p>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {userRoles.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Användare med roller
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <Shield className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {userRoles.filter((r) => r.role === "ai_email").length}
                </p>
                <p className="text-sm text-muted-foreground">
                  AI Email-användare
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-6 py-4">
            <h2 className="font-semibold text-foreground">
              Alla användare med roller
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16 text-destructive">
              {error}
            </div>
          ) : userRoles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Users className="h-12 w-12 mb-4 opacity-50" />
              <p>Inga användare med roller hittades</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Namn</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Företag</TableHead>
                  <TableHead>Roll</TableHead>
                  <TableHead>Tillagd</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userRoles.map((userRole) => (
                  <TableRow key={userRole.id || userRole.user_id}>
                    <TableCell className="font-medium">
                      {userRole.name || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {userRole.email || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {userRole.company_name || "-"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeStyle(
                          userRole.role
                        )}`}
                      >
                        {userRole.role === "ai_email" ? "AI Email" : userRole.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(userRole.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminRoles;
