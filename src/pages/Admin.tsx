import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KnowledgeBaseManager } from "@/components/admin/KnowledgeBaseManager";
import { DrillsManager } from "@/components/admin/DrillsManager";
import { AthleteListManager } from "@/components/admin/AthleteListManager";
import { SwingUploadQueue } from "@/components/admin/SwingUploadQueue";
import { PerformanceAlerts } from "@/components/admin/PerformanceAlerts";
import { AutomationsPanel } from "@/components/admin/AutomationsPanel";
import { ContentLibraryManager } from "@/components/admin/ContentLibraryManager";
import { SeedModelPlayers } from "@/components/SeedModelPlayers";
import { PlayerSelector } from "@/components/PlayerSelector";
import { BookOpen, Dumbbell, ShieldAlert, Users, UserCheck, TrendingUp, Activity, Bell, Zap, Upload, Target, Library } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useUserRole();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalAthletes: 0,
    totalCoaches: 0,
    totalAnalyses: 0,
    activePrograms: 0,
    programCompletion: 0,
    athleteEngagement: 0,
    unseenActivity: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin]);

  const loadStats = async () => {
    try {
      const [athletesRes, coachesRes, analysesRes, programsRes] = await Promise.all([
        supabase.from("players").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "coach"),
        supabase.from("swing_analyses").select("id", { count: "exact", head: true }),
        supabase.from("training_programs").select("id", { count: "exact", head: true }).eq("is_active", true),
      ]);

      // Mock calculations for new KPIs
      const programCompletion = Math.round(Math.random() * 30 + 70); // 70-100%
      const athleteEngagement = Math.round(Math.random() * 20 + 75); // 75-95%
      const unseenActivity = Math.round(Math.random() * 15 + 5); // 5-20

      setStats({
        totalAthletes: athletesRes.count || 0,
        totalCoaches: coachesRes.count || 0,
        totalAnalyses: analysesRes.count || 0,
        activePrograms: programsRes.count || 0,
        programCompletion,
        athleteEngagement,
        unseenActivity,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-6">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto" />
          <div>
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access the admin dashboard.
            </p>
          </div>
          <Button onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 px-6 pt-8 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">System overview and management</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to App
          </Button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* KPI Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-primary" />
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{loadingStats ? "..." : stats.totalAthletes}</div>
            <p className="text-xs text-muted-foreground">Total Athletes</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <UserCheck className="h-5 w-5 text-primary" />
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{loadingStats ? "..." : stats.totalCoaches}</div>
            <p className="text-xs text-muted-foreground">Total Coaches</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold text-primary">{loadingStats ? "..." : stats.programCompletion}%</span>
            </div>
            <div className="text-sm font-medium">Program Completion</div>
            <p className="text-xs text-muted-foreground">Overall avg</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold text-primary">{loadingStats ? "..." : stats.athleteEngagement}%</span>
            </div>
            <div className="text-sm font-medium">Athlete Engagement</div>
            <p className="text-xs text-muted-foreground">Active this week</p>
          </Card>
        </div>

        {/* Unseen Activity Alert */}
        {stats.unseenActivity > 0 && (
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Unseen Activity</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.unseenActivity} new items require your attention
                  </p>
                </div>
              </div>
              <Button size="sm">Review</Button>
            </div>
          </Card>
        )}

        {/* Management Tools */}
        <div className="mb-6">
          <SeedModelPlayers />
        </div>
        
        <Tabs defaultValue="athletes" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="athletes">
              <Users className="h-4 w-4 mr-2" />
              Athletes
            </TabsTrigger>
            <TabsTrigger value="queue">
              <Upload className="h-4 w-4 mr-2" />
              Queue
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <Bell className="h-4 w-4 mr-2" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="automations">
              <Zap className="h-4 w-4 mr-2" />
              Auto
            </TabsTrigger>
            <TabsTrigger value="library">
              <Library className="h-4 w-4 mr-2" />
              Library
            </TabsTrigger>
            <TabsTrigger value="knowledge">
              <BookOpen className="h-4 w-4 mr-2" />
              KB
            </TabsTrigger>
            <TabsTrigger value="drills">
              <Dumbbell className="h-4 w-4 mr-2" />
              Drills
            </TabsTrigger>
          </TabsList>

          <TabsContent value="athletes">
            <AthleteListManager />
          </TabsContent>

          <TabsContent value="queue">
            <SwingUploadQueue />
          </TabsContent>

          <TabsContent value="alerts">
            <PerformanceAlerts />
          </TabsContent>

          <TabsContent value="automations">
            <AutomationsPanel />
          </TabsContent>

          <TabsContent value="library">
            <ContentLibraryManager />
          </TabsContent>

          <TabsContent value="knowledge">
            <KnowledgeBaseManager />
          </TabsContent>

          <TabsContent value="drills">
            <DrillsManager />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
