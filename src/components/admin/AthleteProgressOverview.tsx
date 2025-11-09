import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Target, Trophy, Calendar, ChevronRight } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useNavigate } from "react-router-dom";

interface AthleteProgressOverviewProps {
  athleteId: string;
  athleteEmail: string;
}

export function AthleteProgressOverview({ athleteId, athleteEmail }: AthleteProgressOverviewProps) {
  const navigate = useNavigate();

  const { data: progressData, isLoading } = useQuery({
    queryKey: ['athlete-progress-overview', athleteId],
    queryFn: async () => {
      // Fetch recent swing analyses
      const { data: analyses, error: analysesError } = await supabase
        .from('swing_analyses')
        .select('*')
        .eq('user_id', athleteId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (analysesError) throw analysesError;

      // Fetch active goals
      const { data: goals, error: goalsError } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', athleteId)
        .eq('status', 'active');

      if (goalsError) throw goalsError;

      // Calculate statistics
      if (!analyses || analyses.length === 0) {
        return {
          recentSwings: 0,
          averageScore: 0,
          trend: 0,
          chartData: [],
          activeGoals: goals?.length || 0,
          goals: goals || [],
          lastActivity: null,
        };
      }

      const chartData = analyses
        .reverse()
        .map((a) => ({
          date: format(new Date(a.created_at), 'MMM d'),
          score: a.overall_score,
        }));

      const avgScore = analyses.reduce((sum, a) => sum + a.overall_score, 0) / analyses.length;
      
      // Calculate trend (compare recent 5 vs older 5)
      let trend = 0;
      if (analyses.length >= 6) {
        const recent5 = analyses.slice(0, 5);
        const older5 = analyses.slice(5, 10);
        const recentAvg = recent5.reduce((sum, a) => sum + a.overall_score, 0) / recent5.length;
        const olderAvg = older5.reduce((sum, a) => sum + a.overall_score, 0) / older5.length;
        trend = recentAvg - olderAvg;
      }

      return {
        recentSwings: analyses.length,
        averageScore: Math.round(avgScore),
        trend: Math.round(trend * 10) / 10,
        chartData,
        activeGoals: goals?.length || 0,
        goals: goals || [],
        lastActivity: analyses[0].created_at,
      };
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!progressData) return null;

  const daysSinceActive = progressData.lastActivity
    ? differenceInDays(new Date(), new Date(progressData.lastActivity))
    : null;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{athleteEmail}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              {daysSinceActive !== null && (
                <>
                  <Calendar className="h-3 w-3" />
                  {daysSinceActive === 0
                    ? 'Active today'
                    : daysSinceActive === 1
                    ? 'Active yesterday'
                    : `Active ${daysSinceActive}d ago`}
                </>
              )}
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/player/${athleteId}`)}
            className="h-8"
          >
            View Profile
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {progressData.recentSwings === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No swing data yet</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{progressData.averageScore}</div>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold flex items-center justify-center gap-1">
                  {progressData.trend > 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-green-500">+{progressData.trend}</span>
                    </>
                  ) : progressData.trend < 0 ? (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="text-red-500">{progressData.trend}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Trend</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{progressData.recentSwings}</div>
                <p className="text-xs text-muted-foreground">Recent Swings</p>
              </div>
            </div>

            {/* Mini Chart */}
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData.chartData}>
                  <defs>
                    <linearGradient id={`gradient-${athleteId}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill={`url(#gradient-${athleteId})`}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Active Goals */}
            {progressData.activeGoals > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Active Goals
                  </span>
                  <Badge variant="secondary">{progressData.activeGoals}</Badge>
                </div>
                <div className="space-y-2">
                  {progressData.goals.slice(0, 2).map((goal: any) => {
                    const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
                    return (
                      <div key={goal.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{goal.metric_name}</span>
                          <span className="font-medium">{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-2 border border-dashed rounded-lg">
                <Target className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-xs text-muted-foreground">No active goals</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
