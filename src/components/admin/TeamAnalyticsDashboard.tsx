import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Trophy, Target, Users, Award, Zap, Calendar } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

interface TeamAnalyticsDashboardProps {
  athleteIds: string[];
}

export function TeamAnalyticsDashboard({ athleteIds }: TeamAnalyticsDashboardProps) {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['team-analytics', athleteIds],
    queryFn: async () => {
      if (athleteIds.length === 0) return null;

      const thirtyDaysAgo = subDays(new Date(), 30);
      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());

      // Fetch all swing analyses for the team
      const { data: analyses, error: analysesError } = await supabase
        .from('swing_analyses')
        .select('*')
        .in('user_id', athleteIds)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (analysesError) throw analysesError;

      // Fetch all goals for the team
      const { data: goals, error: goalsError } = await supabase
        .from('user_goals')
        .select('*')
        .in('user_id', athleteIds);

      if (goalsError) throw goalsError;

      // Fetch user profiles for names
      const usersResponse = await supabase.auth.admin.listUsers();
      const userMapData = usersResponse.data?.users.map((u: any) => [
        u.id as string,
        (u.email || 'Unknown') as string
      ] as const) || [];
      const userMap = new Map<string, string>(userMapData);

      if (!analyses || analyses.length === 0) {
        return {
          totalSwings: 0,
          avgImprovement: 0,
          activeAthletes: 0,
          totalAthletes: athleteIds.length,
          goalCompletionRate: 0,
          mostImproved: null,
          swingDistribution: [],
          improvementByAthlete: [],
          weeklyActivity: [],
          pillarBreakdown: [],
        };
      }

      // Calculate improvement for each athlete
      const athleteImprovements: any[] = [];
      athleteIds.forEach((athleteId) => {
        const athleteAnalyses = analyses.filter(a => a.user_id === athleteId);
        if (athleteAnalyses.length >= 2) {
          const oldestScore = athleteAnalyses[0].overall_score;
          const newestScore = athleteAnalyses[athleteAnalyses.length - 1].overall_score;
          const improvement = newestScore - oldestScore;
          
          if (improvement !== 0) {
            athleteImprovements.push({
              athleteId,
              email: userMap.get(athleteId),
              improvement: Math.round(improvement * 10) / 10,
              swings: athleteAnalyses.length,
            });
          }
        }
      });

      // Sort by improvement
      athleteImprovements.sort((a, b) => b.improvement - a.improvement);

      // Calculate swing distribution by athlete
      const swingCounts: { [key: string]: number } = {};
      analyses.forEach(a => {
        swingCounts[a.user_id] = (swingCounts[a.user_id] || 0) + 1;
      });

      const swingDistribution = Object.entries(swingCounts)
        .map(([userId, count]) => {
          const email = userMap.get(userId) || 'Unknown';
          return {
            name: email.split('@')[0],
            swings: count,
          };
        })
        .sort((a, b) => b.swings - a.swings);

      // Calculate average improvement
      const avgImprovement = athleteImprovements.length > 0
        ? athleteImprovements.reduce((sum, a) => sum + a.improvement, 0) / athleteImprovements.length
        : 0;

      // Active athletes (swung in last 7 days)
      const recentAnalyses = analyses.filter(a => 
        new Date(a.created_at) >= weekStart && new Date(a.created_at) <= weekEnd
      );
      const activeAthletes = new Set(recentAnalyses.map(a => a.user_id)).size;

      // Goal completion rate
      const activeGoals = goals?.filter(g => g.status === 'active') || [];
      const completedGoals = goals?.filter(g => g.status === 'completed') || [];
      const totalGoals = goals?.length || 0;
      const goalCompletionRate = totalGoals > 0 
        ? Math.round((completedGoals.length / totalGoals) * 100)
        : 0;

      // Weekly activity (last 7 days)
      const weeklyActivity = [];
      for (let i = 6; i >= 0; i--) {
        const day = subDays(new Date(), i);
        const dayStart = new Date(day.setHours(0, 0, 0, 0));
        const dayEnd = new Date(day.setHours(23, 59, 59, 999));
        
        const daySwings = analyses.filter(a => {
          const swingDate = new Date(a.created_at);
          return swingDate >= dayStart && swingDate <= dayEnd;
        });

        weeklyActivity.push({
          day: format(day, 'EEE'),
          swings: daySwings.length,
        });
      }

      // Pillar breakdown (average scores)
      const totalAnalyses = analyses.length;
      const pillarBreakdown = [
        {
          name: 'BAT',
          value: Math.round(analyses.reduce((sum, a) => sum + (a.bat_score || 0), 0) / totalAnalyses),
          color: 'hsl(var(--bat))',
        },
        {
          name: 'BODY',
          value: Math.round(analyses.reduce((sum, a) => sum + (a.body_score || 0), 0) / totalAnalyses),
          color: 'hsl(var(--body))',
        },
        {
          name: 'BALL',
          value: Math.round(analyses.reduce((sum, a) => sum + (a.ball_score || 0), 0) / totalAnalyses),
          color: 'hsl(var(--ball))',
        },
        {
          name: 'BRAIN',
          value: Math.round(analyses.reduce((sum, a) => sum + (a.brain_score || 0), 0) / totalAnalyses),
          color: 'hsl(var(--brain))',
        },
      ];

      return {
        totalSwings: analyses.length,
        avgImprovement: Math.round(avgImprovement * 10) / 10,
        activeAthletes,
        totalAthletes: athleteIds.length,
        goalCompletionRate,
        mostImproved: athleteImprovements[0] || null,
        swingDistribution: swingDistribution.slice(0, 8),
        improvementByAthlete: athleteImprovements.slice(0, 5),
        weeklyActivity,
        pillarBreakdown,
      };
    },
    enabled: athleteIds.length > 0,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No team data available yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{analyticsData.totalSwings}</div>
                <p className="text-sm text-muted-foreground">Total Swings (30d)</p>
              </div>
              <Zap className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {analyticsData.avgImprovement > 0 ? '+' : ''}{analyticsData.avgImprovement}
                </div>
                <p className="text-sm text-muted-foreground">Avg Improvement</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {analyticsData.activeAthletes}/{analyticsData.totalAthletes}
                </div>
                <p className="text-sm text-muted-foreground">Active This Week</p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{analyticsData.goalCompletionRate}%</div>
                <p className="text-sm text-muted-foreground">Goal Completion</p>
              </div>
              <Target className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Most Improved Athlete */}
      {analyticsData.mostImproved && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Most Improved Athlete
            </CardTitle>
            <CardDescription>Top performer over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/10 to-transparent rounded-lg">
              <div>
                <h3 className="font-semibold text-lg">{analyticsData.mostImproved.email}</h3>
                <p className="text-sm text-muted-foreground">
                  {analyticsData.mostImproved.swings} swings analyzed
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">
                  +{analyticsData.mostImproved.improvement}
                </div>
                <p className="text-sm text-muted-foreground">points improved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Team Activity (Last 7 Days)
            </CardTitle>
            <CardDescription>Daily swing count across all athletes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analyticsData.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="swings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pillar Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Team Average by Pillar
            </CardTitle>
            <CardDescription>4B scoring breakdown across team</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analyticsData.pillarBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.pillarBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Swing Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Swing Distribution by Athlete
          </CardTitle>
          <CardDescription>Training volume over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.swingDistribution} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="swings" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Improvers List */}
      {analyticsData.improvementByAthlete.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top 5 Improvers
            </CardTitle>
            <CardDescription>Athletes showing the most progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.improvementByAthlete.map((athlete, index) => (
                <div
                  key={athlete.athleteId}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-lg font-bold w-8 h-8 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">{athlete.email}</p>
                      <p className="text-sm text-muted-foreground">{athlete.swings} swings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={athlete.improvement > 0 ? 'default' : 'secondary'}
                      className={athlete.improvement > 0 ? 'bg-green-500' : ''}
                    >
                      {athlete.improvement > 0 ? '+' : ''}{athlete.improvement}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
