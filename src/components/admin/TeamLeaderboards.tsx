import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, TrendingUp, Zap, Target, Medal } from "lucide-react";
import { useState } from "react";
import { subDays, subMonths, startOfWeek, startOfMonth } from "date-fns";

interface TeamLeaderboardsProps {
  athletes: Array<{
    athlete_id: string;
    athlete_email: string;
  }>;
}

type TimePeriod = 'week' | 'month' | 'all';
type LeaderboardType = 'improvement' | 'swings' | 'avgScore' | 'goals';

export function TeamLeaderboards({ athletes }: TeamLeaderboardsProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('improvement');

  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ['team-leaderboards', athletes.map(a => a.athlete_id), timePeriod, leaderboardType],
    queryFn: async () => {
      if (athletes.length === 0) return null;

      const athleteIds = athletes.map(a => a.athlete_id);
      
      // Calculate date range
      let startDate: Date;
      if (timePeriod === 'week') {
        startDate = startOfWeek(new Date());
      } else if (timePeriod === 'month') {
        startDate = startOfMonth(new Date());
      } else {
        startDate = subMonths(new Date(), 6); // All time = last 6 months
      }

      // Fetch analyses
      const { data: analyses, error: analysesError } = await supabase
        .from('swing_analyses')
        .select('*')
        .in('user_id', athleteIds)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (analysesError) throw analysesError;

      // Fetch goals
      const { data: goals, error: goalsError } = await supabase
        .from('user_goals')
        .select('*')
        .in('user_id', athleteIds);

      if (goalsError) throw goalsError;

      // Fetch user info
      const usersResponse = await supabase.auth.admin.listUsers();
      const userMapData = usersResponse.data?.users.map((u: any) => [
        u.id as string,
        (u.email || 'Unknown') as string
      ] as const) || [];
      const userMap = new Map<string, string>(userMapData);

      // Calculate stats for each athlete
      const athleteStats = athleteIds.map(athleteId => {
        const athleteAnalyses = analyses?.filter(a => a.user_id === athleteId) || [];
        const athleteGoals = goals?.filter(g => g.user_id === athleteId) || [];

        // Calculate improvement
        let improvement = 0;
        if (athleteAnalyses.length >= 2) {
          const firstHalf = athleteAnalyses.slice(0, Math.floor(athleteAnalyses.length / 2));
          const secondHalf = athleteAnalyses.slice(Math.floor(athleteAnalyses.length / 2));
          
          if (firstHalf.length > 0 && secondHalf.length > 0) {
            const firstAvg = firstHalf.reduce((sum, a) => sum + a.overall_score, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((sum, a) => sum + a.overall_score, 0) / secondHalf.length;
            improvement = secondAvg - firstAvg;
          }
        }

        // Calculate average score
        const avgScore = athleteAnalyses.length > 0
          ? athleteAnalyses.reduce((sum, a) => sum + a.overall_score, 0) / athleteAnalyses.length
          : 0;

        // Calculate goal completion
        const completedGoals = athleteGoals.filter(g => g.status === 'completed').length;
        const totalGoals = athleteGoals.length;
        const goalCompletionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

        return {
          athleteId,
          name: userMap.get(athleteId) || 'Unknown',
          email: userMap.get(athleteId) || 'Unknown',
          improvement: Math.round(improvement * 10) / 10,
          totalSwings: athleteAnalyses.length,
          avgScore: Math.round(avgScore * 10) / 10,
          goalCompletionRate: Math.round(goalCompletionRate),
          completedGoals,
          totalGoals,
        };
      });

      // Sort based on leaderboard type
      let sortedStats = [...athleteStats];
      switch (leaderboardType) {
        case 'improvement':
          sortedStats.sort((a, b) => b.improvement - a.improvement);
          break;
        case 'swings':
          sortedStats.sort((a, b) => b.totalSwings - a.totalSwings);
          break;
        case 'avgScore':
          sortedStats.sort((a, b) => b.avgScore - a.avgScore);
          break;
        case 'goals':
          sortedStats.sort((a, b) => b.goalCompletionRate - a.goalCompletionRate);
          break;
      }

      return sortedStats;
    },
    enabled: athletes.length > 0,
  });

  const getMedalIcon = (rank: number) => {
    if (rank === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-amber-700" />;
    return <span className="font-bold text-muted-foreground">{rank + 1}</span>;
  };

  const getLeaderboardConfig = () => {
    switch (leaderboardType) {
      case 'improvement':
        return {
          title: 'Most Improved',
          description: 'Athletes with the highest improvement',
          icon: TrendingUp,
          valueKey: 'improvement' as const,
          valueLabel: 'Improvement',
          valueFormatter: (v: number) => `${v > 0 ? '+' : ''}${v}`,
          color: 'text-green-600',
        };
      case 'swings':
        return {
          title: 'Most Active',
          description: 'Athletes with the most swings analyzed',
          icon: Zap,
          valueKey: 'totalSwings' as const,
          valueLabel: 'Swings',
          valueFormatter: (v: number) => v.toString(),
          color: 'text-primary',
        };
      case 'avgScore':
        return {
          title: 'Highest Average',
          description: 'Athletes with the highest average scores',
          icon: Trophy,
          valueKey: 'avgScore' as const,
          valueLabel: 'Avg Score',
          valueFormatter: (v: number) => v.toFixed(1),
          color: 'text-yellow-600',
        };
      case 'goals':
        return {
          title: 'Goal Crushers',
          description: 'Athletes with the best goal completion rate',
          icon: Target,
          valueKey: 'goalCompletionRate' as const,
          valueLabel: 'Goals',
          valueFormatter: (v: number) => `${v}%`,
          color: 'text-purple-600',
        };
    }
  };

  if (athletes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Add athletes to view leaderboards</p>
        </CardContent>
      </Card>
    );
  }

  const config = getLeaderboardConfig();
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Leaderboard Type</label>
              <Select value={leaderboardType} onValueChange={(v: LeaderboardType) => setLeaderboardType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="improvement">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Most Improved
                    </div>
                  </SelectItem>
                  <SelectItem value="swings">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Most Active
                    </div>
                  </SelectItem>
                  <SelectItem value="avgScore">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Highest Average
                    </div>
                  </SelectItem>
                  <SelectItem value="goals">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Goal Completion
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Period</label>
              <Select value={timePeriod} onValueChange={(v: TimePeriod) => setTimePeriod(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {config.title}
          </CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !leaderboardData || leaderboardData.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No data available for this period</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboardData.map((athlete, index) => (
                <div
                  key={athlete.athleteId}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    index === 0 
                      ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/20' 
                      : index === 1
                      ? 'bg-gradient-to-r from-gray-300/10 to-transparent border-gray-300/20'
                      : index === 2
                      ? 'bg-gradient-to-r from-amber-700/10 to-transparent border-amber-700/20'
                      : 'bg-muted/30'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-background border-2 flex items-center justify-center">
                      {getMedalIcon(index)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{athlete.email}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                        {leaderboardType === 'improvement' && (
                          <>
                            <span>{athlete.totalSwings} swings</span>
                            <span>•</span>
                            <span>Avg: {athlete.avgScore}</span>
                          </>
                        )}
                        {leaderboardType === 'swings' && (
                          <>
                            <span>Avg: {athlete.avgScore}</span>
                            <span>•</span>
                            <span>{athlete.improvement > 0 ? '+' : ''}{athlete.improvement} improvement</span>
                          </>
                        )}
                        {leaderboardType === 'avgScore' && (
                          <>
                            <span>{athlete.totalSwings} swings</span>
                            <span>•</span>
                            <span>{athlete.improvement > 0 ? '+' : ''}{athlete.improvement} improvement</span>
                          </>
                        )}
                        {leaderboardType === 'goals' && (
                          <>
                            <span>{athlete.completedGoals}/{athlete.totalGoals} goals</span>
                            <span>•</span>
                            <span>Avg: {athlete.avgScore}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-2xl font-bold ${config.color}`}>
                      {config.valueFormatter(athlete[config.valueKey] as number)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {config.valueLabel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Leaderboards Summary */}
      {leaderboardData && leaderboardData.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Most Improved */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Most Improved
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const sorted = [...leaderboardData].sort((a, b) => b.improvement - a.improvement);
                const top = sorted[0];
                return top ? (
                  <div>
                    <div className="font-semibold truncate text-sm">{top.email.split('@')[0]}</div>
                    <div className="text-2xl font-bold text-green-600 mt-1">
                      {top.improvement > 0 ? '+' : ''}{top.improvement}
                    </div>
                  </div>
                ) : <div className="text-sm text-muted-foreground">No data</div>;
              })()}
            </CardContent>
          </Card>

          {/* Most Active */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Most Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const sorted = [...leaderboardData].sort((a, b) => b.totalSwings - a.totalSwings);
                const top = sorted[0];
                return top ? (
                  <div>
                    <div className="font-semibold truncate text-sm">{top.email.split('@')[0]}</div>
                    <div className="text-2xl font-bold text-primary mt-1">{top.totalSwings}</div>
                  </div>
                ) : <div className="text-sm text-muted-foreground">No data</div>;
              })()}
            </CardContent>
          </Card>

          {/* Highest Average */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Highest Avg
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const sorted = [...leaderboardData].sort((a, b) => b.avgScore - a.avgScore);
                const top = sorted[0];
                return top ? (
                  <div>
                    <div className="font-semibold truncate text-sm">{top.email.split('@')[0]}</div>
                    <div className="text-2xl font-bold text-yellow-600 mt-1">{top.avgScore}</div>
                  </div>
                ) : <div className="text-sm text-muted-foreground">No data</div>;
              })()}
            </CardContent>
          </Card>

          {/* Goal Completion */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                Goal Crusher
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const sorted = [...leaderboardData].sort((a, b) => b.goalCompletionRate - a.goalCompletionRate);
                const top = sorted[0];
                return top ? (
                  <div>
                    <div className="font-semibold truncate text-sm">{top.email.split('@')[0]}</div>
                    <div className="text-2xl font-bold text-purple-600 mt-1">{top.goalCompletionRate}%</div>
                  </div>
                ) : <div className="text-sm text-muted-foreground">No data</div>;
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
