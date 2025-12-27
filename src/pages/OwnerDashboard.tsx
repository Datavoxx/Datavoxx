import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AppHeader from "@/components/AppHeader";
import DecorativeBackground from "@/components/DecorativeBackground";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Loader2,
  Users,
  FileText,
  Mail,
  Search,
  Image,
  MessageSquare,
  Gift,
  HelpCircle,
  CreditCard,
  Link2,
  Wrench,
  Crown,
  TrendingUp,
  Calendar,
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

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { isOwner, isLoading: roleLoading } = useUserRole();
  const { user, isLoading: authLoading } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!user || !isOwner) return;

      try {
        // Fetch all data in parallel
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
          supabase.from("ad_generations").select("*").order("created_at", { ascending: false }).limit(100),
          supabase.from("email_conversations").select("*").order("created_at", { ascending: false }).limit(100),
          supabase.from("research_conversations").select("*").order("created_at", { ascending: false }).limit(100),
          supabase.from("template_requests").select("*").order("created_at", { ascending: false }),
          supabase.from("bonus_requests").select("*").order("created_at", { ascending: false }),
          supabase.from("help_requests").select("*").order("created_at", { ascending: false }),
          supabase.from("feedback").select("*").order("created_at", { ascending: false }),
          supabase.from("daily_credits").select("*").order("date", { ascending: false }).limit(100),
          supabase.from("email_connection_requests").select("*").order("created_at", { ascending: false }),
          supabase.from("tool_access_requests").select("*").order("created_at", { ascending: false }),
          supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        ]);

        // Calculate stats
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
    };

    if (!authLoading && !roleLoading && user) {
      fetchAllData();
    }
  }, [user, isOwner, authLoading, roleLoading]);

  // Redirect non-owners
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color = "text-primary",
  }: {
    title: string;
    value: number | string;
    icon: any;
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
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
              Fullständig överblick av all data
            </p>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              <StatCard title="Användare" value={stats.totalUsers} icon={Users} color="text-blue-500" />
              <StatCard title="Annonser" value={stats.totalAds} icon={FileText} color="text-green-500" />
              <StatCard title="Email" value={stats.totalEmails} icon={Mail} color="text-purple-500" />
              <StatCard title="Research" value={stats.totalResearch} icon={Search} color="text-orange-500" />
              <StatCard title="Mallförfrågningar" value={stats.totalTemplateRequests} icon={Image} color="text-pink-500" />
              <StatCard title="Bonus" value={stats.totalBonusRequests} icon={Gift} color="text-amber-500" />
              <StatCard title="Hjälp" value={stats.totalHelpRequests} icon={HelpCircle} color="text-cyan-500" />
              <StatCard title="Feedback" value={stats.totalFeedback} icon={MessageSquare} color="text-indigo-500" />
              <StatCard title="Credits" value={stats.totalCreditsUsed} icon={CreditCard} color="text-yellow-500" />
              <StatCard title="Email-koppling" value={stats.totalEmailConnections} icon={Link2} color="text-teal-500" />
              <StatCard title="Verktygsförfrågan" value={stats.totalToolRequests} icon={Wrench} color="text-red-500" />
              <StatCard title="Roller" value={Object.keys(stats.usersByRole).length} icon={Crown} color="text-violet-500" />
            </div>
          )}

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

          {/* Data Tabs */}
          {tableData && (
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="grid grid-cols-4 lg:grid-cols-6 gap-1 h-auto mb-6">
                <TabsTrigger value="users" className="text-xs">Användare</TabsTrigger>
                <TabsTrigger value="ads" className="text-xs">Annonser</TabsTrigger>
                <TabsTrigger value="email" className="text-xs">Email</TabsTrigger>
                <TabsTrigger value="research" className="text-xs">Research</TabsTrigger>
                <TabsTrigger value="requests" className="text-xs">Förfrågningar</TabsTrigger>
                <TabsTrigger value="feedback" className="text-xs">Feedback</TabsTrigger>
              </TabsList>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>Alla användare ({tableData.user_roles.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2">
                        {tableData.user_roles.map((ur) => (
                          <div
                            key={ur.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div>
                              <p className="font-medium">{ur.display_name || ur.email || "Okänd"}</p>
                              <p className="text-sm text-muted-foreground">{ur.email}</p>
                            </div>
                            <Badge variant={ur.role === "owner" ? "default" : "secondary"}>
                              {ur.role}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ads">
                <Card>
                  <CardHeader>
                    <CardTitle>Senaste annonser ({tableData.ad_generations.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2">
                        {tableData.ad_generations.map((ad) => (
                          <div key={ad.id} className="p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium">
                                {ad.brand} {ad.model} {ad.year}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(ad.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {ad.generated_ad?.substring(0, 100)}...
                            </p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="email">
                <Card>
                  <CardHeader>
                    <CardTitle>Email-konversationer ({tableData.email_conversations.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2">
                        {tableData.email_conversations.map((ec) => (
                          <div key={ec.id} className="p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium">{ec.user_name}</p>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(ec.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{ec.request}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="research">
                <Card>
                  <CardHeader>
                    <CardTitle>Research ({tableData.research_conversations.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2">
                        {tableData.research_conversations.map((rc) => (
                          <div key={rc.id} className="p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium">{rc.user_name}</p>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(rc.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{rc.question}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requests">
                <div className="grid gap-6">
                  {/* Template Requests */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Mallförfrågningar ({tableData.template_requests.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {tableData.template_requests.map((tr) => (
                            <div
                              key={tr.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                            >
                              <div>
                                <p className="font-medium">{tr.company_name}</p>
                                <p className="text-sm text-muted-foreground">{tr.email}</p>
                              </div>
                              <Badge>{tr.status}</Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Bonus Requests */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Bonus-förfrågningar ({tableData.bonus_requests.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {tableData.bonus_requests.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">Inga bonus-förfrågningar än</p>
                          ) : (
                            tableData.bonus_requests.map((br) => (
                              <div
                                key={br.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                              >
                                <div>
                                  <p className="font-medium">{br.template_name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(br.created_at)}
                                  </p>
                                </div>
                                <Badge>{br.status}</Badge>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Tool Access Requests */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Verktygsförfrågningar ({tableData.tool_access_requests.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {tableData.tool_access_requests.map((tar) => (
                            <div
                              key={tar.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                            >
                              <div>
                                <p className="font-medium">{tar.tool_name}</p>
                                <p className="text-sm text-muted-foreground">{tar.note}</p>
                              </div>
                              <Badge>{tar.status}</Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Email Connection Requests */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Email-koppling ({tableData.email_connection_requests.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {tableData.email_connection_requests.map((ecr) => (
                            <div
                              key={ecr.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                            >
                              <div>
                                <p className="font-medium">{ecr.contact_name || ecr.company_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {ecr.request_type} • {ecr.email_address || ecr.phone_number}
                                </p>
                              </div>
                              <Badge>{ecr.status}</Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="feedback">
                <div className="grid gap-6">
                  {/* Feedback */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Feedback ({tableData.feedback.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {tableData.feedback.map((fb) => (
                            <div key={fb.id} className="p-3 rounded-lg bg-muted/50">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-medium">{fb.email}</p>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(fb.created_at)}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {fb.services?.map((s: string) => (
                                  <Badge key={s} variant="outline" className="text-xs">
                                    {s}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-sm text-muted-foreground">{fb.message}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Help Requests */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Hjälpförfrågningar ({tableData.help_requests.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {tableData.help_requests.map((hr) => (
                            <div key={hr.id} className="p-3 rounded-lg bg-muted/50">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-medium">{hr.email}</p>
                                <Badge>{hr.help_topic}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{hr.description}</p>
                              {hr.wants_pdf && (
                                <Badge variant="outline" className="mt-2">
                                  Vill ha PDF
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
};

export default OwnerDashboard;
