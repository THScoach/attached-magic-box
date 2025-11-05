import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileVideo, TrendingUp, Activity, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface ActivityItem {
  id: string;
  playerName: string;
  action: string;
  time: string;
  grade?: string;
}

export default function AdminOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalAnalyses: 0,
    thisWeek: 0,
    avgGrade: "B+"
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [needsAttention, setNeedsAttention] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get total players
      const { count: playersCount } = await supabase
        .from("players")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Get total analyses
      const { count: analysesCount } = await supabase
        .from("swing_analyses")
        .select("*", { count: "exact", head: true });

      // Get this week's analyses
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: weekCount } = await supabase
        .from("swing_analyses")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString());

      // Get recent analyses for activity feed
      const { data: recentAnalyses } = await supabase
        .from("swing_analyses")
        .select(`
          id,
          created_at,
          overall_score,
          player_id,
          players!inner(first_name, last_name)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      const activity: ActivityItem[] = (recentAnalyses || []).map((analysis: any) => ({
        id: analysis.id,
        playerName: `${analysis.players.first_name} ${analysis.players.last_name}`,
        action: "uploaded new swing",
        time: formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true }),
        grade: getLetterGrade(analysis.overall_score)
      }));

      // Check for players needing attention
      const { data: inactivePlayers } = await supabase
        .from("user_activity_tracking")
        .select("user_id, last_swing_upload");

      const attention: string[] = [];
      inactivePlayers?.forEach((player) => {
        if (player.last_swing_upload) {
          const daysSince = Math.floor((Date.now() - new Date(player.last_swing_upload).getTime()) / (1000 * 60 * 60 * 24));
          if (daysSince > 7) {
            attention.push(`Player inactive for ${daysSince} days`);
          }
        }
      });

      setStats({
        totalPlayers: playersCount || 0,
        totalAnalyses: analysesCount || 0,
        thisWeek: weekCount || 0,
        avgGrade: "B+"
      });
      setRecentActivity(activity);
      setNeedsAttention(attention);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLetterGrade = (score: number): string => {
    if (score >= 90) return "A";
    if (score >= 80) return "B+";
    if (score >= 70) return "B";
    if (score >= 60) return "C+";
    return "C";
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground">Welcome to your coaching dashboard</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/admin/players")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlayers}</div>
            <p className="text-xs text-muted-foreground">Total athletes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Analyses</CardTitle>
            <FileVideo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnalyses}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeek}</div>
            <p className="text-xs text-muted-foreground">New swings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.avgGrade}</div>
            <p className="text-xs text-muted-foreground">Team average</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{item.playerName} {item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                  {item.grade && (
                    <div className="px-2 py-1 bg-primary/10 text-primary rounded text-sm font-bold">
                      {item.grade}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Needs Attention */}
      {needsAttention.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">Needs Attention</p>
            <ul className="list-disc list-inside space-y-1">
              {needsAttention.map((item, idx) => (
                <li key={idx} className="text-sm">{item}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
