import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";
import { Users, TrendingUp, Award, X } from "lucide-react";
import { format, subDays } from "date-fns";

interface AthleteComparisonProps {
  athletes: Array<{
    athlete_id: string;
    athlete_email: string;
  }>;
}

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--bat))',
  'hsl(var(--body))',
  'hsl(var(--ball))',
  'hsl(var(--brain))',
  '#10b981',
  '#f59e0b',
  '#ef4444',
];

export function AthleteComparison({ athletes }: AthleteComparisonProps) {
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);

  const toggleAthlete = (athleteId: string) => {
    setSelectedAthletes(prev => 
      prev.includes(athleteId)
        ? prev.filter(id => id !== athleteId)
        : [...prev, athleteId].slice(0, 8) // Max 8 athletes
    );
  };

  const { data: comparisonData, isLoading } = useQuery({
    queryKey: ['athlete-comparison', selectedAthletes],
    queryFn: async () => {
      if (selectedAthletes.length === 0) return null;

      const thirtyDaysAgo = subDays(new Date(), 30);

      // Fetch analyses for selected athletes
      const { data: analyses, error: analysesError } = await supabase
        .from('swing_analyses')
        .select('*')
        .in('user_id', selectedAthletes)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (analysesError) throw analysesError;

      // Fetch user info
      const usersResponse = await supabase.auth.admin.listUsers();
      const userMapData = usersResponse.data?.users.map((u: any) => [
        u.id as string,
        (u.email || 'Unknown') as string
      ] as const) || [];
      const userMap = new Map<string, string>(userMapData);

      if (!analyses || analyses.length === 0) return null;

      // Process data for each athlete
      const athleteStats = selectedAthletes.map(athleteId => {
        const athleteAnalyses = analyses.filter(a => a.user_id === athleteId);
        
        if (athleteAnalyses.length === 0) {
          return {
            id: athleteId,
            name: userMap.get(athleteId)?.split('@')[0] || 'Unknown',
            avgScore: 0,
            totalSwings: 0,
            improvement: 0,
            avgBat: 0,
            avgBody: 0,
            avgBall: 0,
            avgBrain: 0,
            chartData: [],
          };
        }

        const avgScore = athleteAnalyses.reduce((sum, a) => sum + a.overall_score, 0) / athleteAnalyses.length;
        
        // Calculate improvement
        const firstHalf = athleteAnalyses.slice(0, Math.floor(athleteAnalyses.length / 2));
        const secondHalf = athleteAnalyses.slice(Math.floor(athleteAnalyses.length / 2));
        const firstAvg = firstHalf.length > 0 
          ? firstHalf.reduce((sum, a) => sum + a.overall_score, 0) / firstHalf.length 
          : avgScore;
        const secondAvg = secondHalf.length > 0
          ? secondHalf.reduce((sum, a) => sum + a.overall_score, 0) / secondHalf.length
          : avgScore;
        const improvement = secondAvg - firstAvg;

        // Calculate pillar averages
        const avgBat = athleteAnalyses.reduce((sum, a) => sum + (a.bat_score || 0), 0) / athleteAnalyses.length;
        const avgBody = athleteAnalyses.reduce((sum, a) => sum + (a.body_score || 0), 0) / athleteAnalyses.length;
        const avgBall = athleteAnalyses.reduce((sum, a) => sum + (a.ball_score || 0), 0) / athleteAnalyses.length;
        const avgBrain = athleteAnalyses.reduce((sum, a) => sum + (a.brain_score || 0), 0) / athleteAnalyses.length;

        // Create chart data
        const chartData = athleteAnalyses.map(a => ({
          date: format(new Date(a.created_at), 'MM/dd'),
          score: a.overall_score,
        }));

        return {
          id: athleteId,
          name: userMap.get(athleteId)?.split('@')[0] || 'Unknown',
          avgScore: Math.round(avgScore),
          totalSwings: athleteAnalyses.length,
          improvement: Math.round(improvement * 10) / 10,
          avgBat: Math.round(avgBat),
          avgBody: Math.round(avgBody),
          avgBall: Math.round(avgBall),
          avgBrain: Math.round(avgBrain),
          chartData,
        };
      });

      // Create combined timeline data
      const allDates = new Set<string>();
      analyses.forEach(a => {
        allDates.add(format(new Date(a.created_at), 'MM/dd'));
      });

      const sortedDates = Array.from(allDates).sort((a, b) => {
        const dateA = new Date('2024/' + a);
        const dateB = new Date('2024/' + b);
        return dateA.getTime() - dateB.getTime();
      });

      const combinedChartData = sortedDates.map(date => {
        const dataPoint: any = { date };
        
        athleteStats.forEach(athlete => {
          const dayData = athlete.chartData.filter(d => d.date === date);
          if (dayData.length > 0) {
            const avgForDay = dayData.reduce((sum, d) => sum + d.score, 0) / dayData.length;
            dataPoint[athlete.name] = Math.round(avgForDay);
          }
        });

        return dataPoint;
      });

      // Pillar comparison data
      const pillarComparison = [
        {
          pillar: 'BAT',
          ...Object.fromEntries(athleteStats.map(a => [a.name, a.avgBat]))
        },
        {
          pillar: 'BODY',
          ...Object.fromEntries(athleteStats.map(a => [a.name, a.avgBody]))
        },
        {
          pillar: 'BALL',
          ...Object.fromEntries(athleteStats.map(a => [a.name, a.avgBall]))
        },
        {
          pillar: 'BRAIN',
          ...Object.fromEntries(athleteStats.map(a => [a.name, a.avgBrain]))
        },
      ];

      return {
        athleteStats,
        combinedChartData,
        pillarComparison,
      };
    },
    enabled: selectedAthletes.length > 0,
  });

  if (athletes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Add athletes to start comparing progress</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Athlete Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Athletes to Compare</CardTitle>
          <CardDescription>Choose up to 8 athletes to compare their progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {athletes.map((athlete) => (
              <div
                key={athlete.athlete_id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => toggleAthlete(athlete.athlete_id)}
              >
                <Checkbox
                  checked={selectedAthletes.includes(athlete.athlete_id)}
                  disabled={
                    !selectedAthletes.includes(athlete.athlete_id) &&
                    selectedAthletes.length >= 8
                  }
                />
                <span className="text-sm">{athlete.athlete_email}</span>
              </div>
            ))}
          </div>
          {selectedAthletes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              {selectedAthletes.map((id) => {
                const athlete = athletes.find(a => a.athlete_id === id);
                return (
                  <Badge key={id} variant="secondary" className="gap-1">
                    {athlete?.athlete_email}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => toggleAthlete(id)}
                    />
                  </Badge>
                );
              })}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAthletes([])}
                className="h-6 text-xs"
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {!isLoading && comparisonData && (
        <>
          {/* Summary Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {comparisonData.athleteStats.map((athlete, index) => (
              <Card key={athlete.id}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index] }}
                      />
                      <h3 className="font-semibold truncate">{athlete.name}</h3>
                    </div>
                    <div className="text-3xl font-bold">{athlete.avgScore}</div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Avg Score</span>
                      <Badge
                        variant={athlete.improvement >= 0 ? 'default' : 'secondary'}
                        className={athlete.improvement >= 0 ? 'bg-green-500' : ''}
                      >
                        {athlete.improvement >= 0 ? '+' : ''}{athlete.improvement}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {athlete.totalSwings} swings
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Progress Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progress Over Time (30 Days)
              </CardTitle>
              <CardDescription>Compare overall score trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={comparisonData.combinedChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    domain={[0, 100]}
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
                  <Legend />
                  {comparisonData.athleteStats.map((athlete, index) => (
                    <Line
                      key={athlete.id}
                      type="monotone"
                      dataKey={athlete.name}
                      stroke={CHART_COLORS[index]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pillar Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                4B Pillar Comparison
              </CardTitle>
              <CardDescription>Average scores by pillar</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparisonData.pillarComparison}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="pillar"
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    domain={[0, 100]}
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
                  <Legend />
                  {comparisonData.athleteStats.map((athlete, index) => (
                    <Bar
                      key={athlete.id}
                      dataKey={athlete.name}
                      fill={CHART_COLORS[index]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detailed Stats Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Comparison</CardTitle>
              <CardDescription>Side-by-side athlete metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Metric</th>
                      {comparisonData.athleteStats.map((athlete, index) => (
                        <th key={athlete.id} className="text-center p-3">
                          <div className="flex items-center justify-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: CHART_COLORS[index] }}
                            />
                            <span className="text-sm font-medium">{athlete.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm text-muted-foreground">Avg Score</td>
                      {comparisonData.athleteStats.map(a => (
                        <td key={a.id} className="p-3 text-center font-semibold">{a.avgScore}</td>
                      ))}
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm text-muted-foreground">Improvement</td>
                      {comparisonData.athleteStats.map(a => (
                        <td key={a.id} className="p-3 text-center">
                          <Badge variant={a.improvement >= 0 ? 'default' : 'secondary'} className={a.improvement >= 0 ? 'bg-green-500' : ''}>
                            {a.improvement >= 0 ? '+' : ''}{a.improvement}
                          </Badge>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm text-muted-foreground">Total Swings</td>
                      {comparisonData.athleteStats.map(a => (
                        <td key={a.id} className="p-3 text-center font-semibold">{a.totalSwings}</td>
                      ))}
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm text-muted-foreground">BAT Score</td>
                      {comparisonData.athleteStats.map(a => (
                        <td key={a.id} className="p-3 text-center">{a.avgBat}</td>
                      ))}
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm text-muted-foreground">BODY Score</td>
                      {comparisonData.athleteStats.map(a => (
                        <td key={a.id} className="p-3 text-center">{a.avgBody}</td>
                      ))}
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm text-muted-foreground">BALL Score</td>
                      {comparisonData.athleteStats.map(a => (
                        <td key={a.id} className="p-3 text-center">{a.avgBall}</td>
                      ))}
                    </tr>
                    <tr className="hover:bg-muted/50">
                      <td className="p-3 text-sm text-muted-foreground">BRAIN Score</td>
                      {comparisonData.athleteStats.map(a => (
                        <td key={a.id} className="p-3 text-center">{a.avgBrain}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!isLoading && !comparisonData && selectedAthletes.length > 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No swing data available for selected athletes</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
