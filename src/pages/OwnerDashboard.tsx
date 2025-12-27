import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import DecorativeBackground from "@/components/DecorativeBackground";
import OwnerDetailModal, { ModalDataType } from "@/components/OwnerDetailModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Users,
  FileText,
  Mail,
  Search,
  MessageSquare,
  Gift,
  HelpCircle,
  CreditCard,
  Link2,
  Wrench,
  Crown,
  TrendingUp,
  Image,
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalAds: number;
  totalEmails: number;
  totalResearch: number;
  totalTemplateRequests: number;
  totalBonusRequests: number;
  totalHelpRequests: number;
  totalFeedback: number;
  totalCreditsUsed: number;
  totalEmailConnections: number;
  totalToolRequests: number;
  totalProfiles: number;
  usersByRole: Record<string, number>;
}

interface TableData {
  user_roles: any[];
  ad_generations: any[];
  email_conversations: any[];
  research_conversations: any[];
  template_requests: any[];
  bonus_requests: any[];
  help_requests: any[];
  feedback: any[];
  daily_credits: any[];
  email_connection_requests: any[];
  tool_access_requests: any[];
  profiles: any[];
}

interface PhotoroomCredits {
  remaining: number;
  total: number;
  used: number;
  plan: string;
}

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { isOwner, isLoading: roleLoading } = useUserRole();
  const { user, isLoading: authLoading } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalDataType | null>(null);
  const [photoroomCredits, setPhotoroomCredits] = useState<PhotoroomCredits | null>(null);
  const [photoroomLoading, setPhotoroomLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    if (!user || !isOwner) return;

    try {
      const [
        userRolesRes,
        adGenRes,
        emailConvRes,
        researchRes,
        templateReqRes,
        bonusReqRes,
        helpReqRes,
        feedbackRes,
        creditsRes,
        emailConnRes,
        toolReqRes,
        profilesRes,
      ] = await Promise.all([
        supabase.from("user_roles").select("*").order("created_at", { ascending: false }),
        supabase.from("ad_generations").select("*").order("created_at", { ascending: false }),
        supabase.from("email_conversations").select("*").order("created_at", { ascending: false }),
        supabase.from("research_conversations").select("*").order("created_at", { ascending: false }),
        supabase.from("template_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("bonus_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("help_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("feedback").select("*").order("created_at", { ascending: false }),
        supabase.from("daily_credits").select("*").order("date", { ascending: false }),
        supabase.from("email_connection_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("tool_access_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      ]);

      const userRoles = userRolesRes.data || [];
      const usersByRole: Record<string, number> = {};
      userRoles.forEach((ur) => {
        usersByRole[ur.role] = (usersByRole[ur.role] || 0) + 1;
      });

      const totalCreditsUsed = (creditsRes.data || []).reduce(
        (sum, c) => sum + (c.credits_used || 0),
        0
      );

      setStats({
        totalUsers: userRoles.length,
        totalAds: adGenRes.data?.length || 0,
        totalEmails: emailConvRes.data?.length || 0,
        totalResearch: researchRes.data?.length || 0,
        totalTemplateRequests: templateReqRes.data?.length || 0,
        totalBonusRequests: bonusReqRes.data?.length || 0,
        totalHelpRequests: helpReqRes.data?.length || 0,
        totalFeedback: feedbackRes.data?.length || 0,
        totalCreditsUsed,
        totalEmailConnections: emailConnRes.data?.length || 0,
        totalToolRequests: toolReqRes.data?.length || 0,
        totalProfiles: profilesRes.data?.length || 0,
        usersByRole,
      });

      setTableData({
        user_roles: userRoles,
        ad_generations: adGenRes.data || [],
        email_conversations: emailConvRes.data || [],
        research_conversations: researchRes.data || [],
        template_requests: templateReqRes.data || [],
        bonus_requests: bonusReqRes.data || [],
        help_requests: helpReqRes.data || [],
        feedback: feedbackRes.data || [],
        daily_credits: creditsRes.data || [],
        email_connection_requests: emailConnRes.data || [],
        tool_access_requests: toolReqRes.data || [],
        profiles: profilesRes.data || [],
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isOwner]);

  const fetchPhotoroomCredits = useCallback(async () => {
    try {
      setPhotoroomLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/photoroom-credits`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setPhotoroomCredits(data);
      }
    } catch (error) {
      console.error("Error fetching Photoroom credits:", error);
    } finally {
      setPhotoroomLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !roleLoading && user) {
      fetchAllData();
      fetchPhotoroomCredits();
    }
  }, [user, isOwner, authLoading, roleLoading, fetchAllData, fetchPhotoroomCredits]);

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        navigate("/auth");
      } else if (!isOwner) {
        navigate("/start");
      }
    }
  }, [authLoading, roleLoading, user, isOwner, navigate]);

  if (authLoading || roleLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isOwner) return null;

  const openModal = (type: ModalDataType) => {
    setActiveModal(type);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveModal(null);
  };

  const getModalData = (): any[] => {
    if (!tableData || !activeModal) return [];

    const dataMap: Record<ModalDataType, any[]> = {
      users: tableData.user_roles,
      ads: tableData.ad_generations,
      emails: tableData.email_conversations,
      research: tableData.research_conversations,
      template_requests: tableData.template_requests,
      bonus_requests: tableData.bonus_requests,
      help_requests: tableData.help_requests,
      feedback: tableData.feedback,
      credits: tableData.daily_credits,
      email_connections: tableData.email_connection_requests,
      tool_requests: tableData.tool_access_requests,
      profiles: tableData.profiles,
    };

    return dataMap[activeModal] || [];
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color = "text-primary",
    onClick,
  }: {
    title: string;
    value: number | string;
    icon: any;
    color?: string;
    onClick?: () => void;
  }) => (
    <Card
      className={`${onClick ? "cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
        {onClick && (
          <p className="text-xs text-muted-foreground mt-2">Klicka för detaljer →</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-muted/30 to-background animate-fade-in">
      <DecorativeBackground />
      <AppHeader showBackButton />

      <main className="relative flex flex-col items-center px-6 pt-24 pb-16">
        <div className="w-full max-w-7xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 mb-4">
              <Crown className="h-4 w-4" />
              <span className="text-sm font-medium">Owner Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">
              Rapportöversikt
            </h1>
            <p className="text-lg text-muted-foreground">
              Klicka på valfritt kort för att se all data
            </p>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Användare"
                value={stats.totalUsers}
                icon={Users}
                color="text-blue-500"
                onClick={() => openModal("users")}
              />
              <StatCard
                title="Annonser"
                value={stats.totalAds}
                icon={FileText}
                color="text-green-500"
                onClick={() => openModal("ads")}
              />
              <StatCard
                title="Email"
                value={stats.totalEmails}
                icon={Mail}
                color="text-purple-500"
                onClick={() => openModal("emails")}
              />
              <StatCard
                title="Research"
                value={stats.totalResearch}
                icon={Search}
                color="text-orange-500"
                onClick={() => openModal("research")}
              />
              <StatCard
                title="Mallförfrågningar"
                value={stats.totalTemplateRequests}
                icon={Image}
                color="text-pink-500"
                onClick={() => openModal("template_requests")}
              />
              <StatCard
                title="Bonus"
                value={stats.totalBonusRequests}
                icon={Gift}
                color="text-amber-500"
                onClick={() => openModal("bonus_requests")}
              />
              <StatCard
                title="Hjälp"
                value={stats.totalHelpRequests}
                icon={HelpCircle}
                color="text-cyan-500"
                onClick={() => openModal("help_requests")}
              />
              <StatCard
                title="Feedback"
                value={stats.totalFeedback}
                icon={MessageSquare}
                color="text-indigo-500"
                onClick={() => openModal("feedback")}
              />
              <StatCard
                title="Credits"
                value={stats.totalCreditsUsed}
                icon={CreditCard}
                color="text-yellow-500"
                onClick={() => openModal("credits")}
              />
              <StatCard
                title="Email-koppling"
                value={stats.totalEmailConnections}
                icon={Link2}
                color="text-teal-500"
                onClick={() => openModal("email_connections")}
              />
              <StatCard
                title="Verktygsförfrågan"
                value={stats.totalToolRequests}
                icon={Wrench}
                color="text-red-500"
                onClick={() => openModal("tool_requests")}
              />
              <StatCard
                title="Profiler"
                value={stats.totalProfiles}
                icon={Crown}
                color="text-violet-500"
                onClick={() => openModal("profiles")}
              />
            </div>
          )}

          {/* Photoroom Credits Card */}
          <Card className="mb-8 bg-gradient-to-r from-purple-50 to-white dark:from-purple-950/30 dark:to-background border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <Image className="h-5 w-5" />
                Photoroom Credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              {photoroomLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              ) : photoroomCredits ? (
                <div className="space-y-3">
                  <p className="text-2xl font-bold text-foreground">
                    {photoroomCredits.remaining} av {photoroomCredits.total} bilder kvar
                  </p>
                  {/* Progress bar */}
                  <div className="w-full h-3 bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all"
                      style={{
                        width: `${(photoroomCredits.remaining / photoroomCredits.total) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Använt: {photoroomCredits.used}</span>
                    <span>Plan: {photoroomCredits.plan}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Kunde inte hämta credits</p>
              )}
            </CardContent>
          </Card>

          {/* Role Distribution */}
          {stats && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Rollfördelning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(stats.usersByRole).map(([role, count]) => (
                    <Badge key={role} variant="secondary" className="text-sm px-3 py-1">
                      {role}: {count}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {activeModal && (
        <OwnerDetailModal
          isOpen={modalOpen}
          onClose={closeModal}
          dataType={activeModal}
          data={getModalData()}
          onDataUpdate={fetchAllData}
        />
      )}
    </div>
  );
};

export default OwnerDashboard;
