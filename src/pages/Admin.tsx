import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AthleteListManager } from "@/components/admin/AthleteListManager";
import { TeamsManager } from "@/components/admin/TeamsManager";
import { AnalyzePlayerModal } from "@/components/AnalyzePlayerModal";
import { CoachRickTrainingDashboard } from "@/components/admin/CoachRickTrainingDashboard";
import { ShieldAlert, Users, UserCheck, TrendingUp, Activity, Target, Camera, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useUserRole();
  const [activeTab, setActiveTab] = useState("players");
  const [analyzeModalOpen, setAnalyzeModalOpen] = useState(false);
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
          <Card 
            className="p-4 cursor-pointer hover:bg-accent transition-colors"
            onClick={() => setActiveTab("players")}
          >
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

        {/* Analyze Player Button */}
        <Button 
          size="lg" 
          className="w-full"
          onClick={() => setAnalyzeModalOpen(true)}
        >
          <Camera className="mr-2 h-5 w-5" />
          Analyze Player
        </Button>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="players">
              <Users className="h-4 w-4 mr-2" />
              Players
            </TabsTrigger>
            <TabsTrigger value="teams">
              <UserCheck className="h-4 w-4 mr-2" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="ai-training">
              <Brain className="h-4 w-4 mr-2" />
              AI Training
            </TabsTrigger>
          </TabsList>

          <TabsContent value="players">
            <AthleteListManager />
          </TabsContent>

          <TabsContent value="teams">
            <TeamsManager />
          </TabsContent>

          <TabsContent value="ai-training">
            <CoachRickTrainingDashboard />
          </TabsContent>
        </Tabs>
      </div>

      {/* Analyze Player Modal */}
      <AnalyzePlayerModal 
        open={analyzeModalOpen} 
        onOpenChange={setAnalyzeModalOpen}
      />

      <BottomNav />
    </div>
  );
}
