import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Users, Target, Activity } from "lucide-react";

export default function AdminAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      // Get all analyses
      const { data: analysesData } = await supabase
        .from('swing_analyses')
        .select('*')
        .order('created_at', { ascending: true });

      // Get all players
      const { data: playersData } = await supabase
        .from('players')
        .select('id, first_name, last_name')
        .eq('is_active', true);

      // Calculate trends over time
      const trendData = analysesData?.reduce((acc, analysis) => {
        const date = new Date(analysis.created_at).toLocaleDateString();
        const existing = acc.find(d => d.date === date);
        
        if (existing) {
          existing.count++;
          existing.totalScore += analysis.overall_score;
          existing.avgScore = existing.totalScore / existing.count;
        } else {
          acc.push({
            date,
            count: 1,
            totalScore: analysis.overall_score,
            avgScore: analysis.overall_score
          });
        }
        return acc;
      }, [] as any[]) || [];

      // Calculate pillar distribution
      const pillarData = [
        {
          name: 'Bat',
          average: analysesData?.reduce((sum, a) => sum + a.bat_score, 0) / (analysesData?.length || 1)
        },
        {
          name: 'Ball',
          average: analysesData?.reduce((sum, a) => sum + a.ball_score, 0) / (analysesData?.length || 1)
        },
        {
          name: 'Body',
          average: analysesData?.reduce((sum, a) => sum + a.body_score, 0) / (analysesData?.length || 1)
        },
        {
          name: 'Brain',
          average: analysesData?.reduce((sum, a) => sum + a.brain_score, 0) / (analysesData?.length || 1)
        }
      ];

      // Top performers
      const playerScores = new Map();
      analysesData?.forEach(a => {
        if (a.player_id) {
          const existing = playerScores.get(a.player_id) || { total: 0, count: 0 };
          playerScores.set(a.player_id, {
            total: existing.total + a.overall_score,
            count: existing.count + 1
          });
        }
      });

      const topPerformers = Array.from(playerScores.entries())
        .map(([playerId, stats]) => {
          const player = playersData?.find(p => p.id === playerId);
          return {
            playerId,
            name: player ? `${player.first_name} ${player.last_name}` : 'Unknown',
            avgScore: stats.total / stats.count,
            swings: stats.count
          };
        })
        .sort((a, b) => b.avgScore - a.avgScore)
        .slice(0, 10);

      return {
        totalAnalyses: analysesData?.length || 0,
        totalPlayers: playersData?.length || 0,
        avgScore: analysesData?.reduce((sum, a) => sum + a.overall_score, 0) / (analysesData?.length || 1),
        trendData: trendData.slice(-30), // Last 30 data points
        pillarData,
        topPerformers
      };
    }
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-background">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Team performance insights and trends</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Swings</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalAnalyses || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalPlayers || 0}</div>
            <p className="text-xs text-muted-foreground">In roster</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Team Avg Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {analytics?.avgScore.toFixed(0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Across all swings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg per Player</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.totalPlayers 
                ? (analytics.totalAnalyses / analytics.totalPlayers).toFixed(1)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Swings per player</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Score Trends Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics?.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="avgScore" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4 B's Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.pillarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="average" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics?.topPerformers.map((player, index) => (
              <div
                key={player.playerId}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{player.name}</p>
                    <p className="text-sm text-muted-foreground">{player.swings} swings</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {player.avgScore.toFixed(0)}
                  </div>
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                </div>
              </div>
            ))}

            {(!analytics?.topPerformers || analytics.topPerformers.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No player data available yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
