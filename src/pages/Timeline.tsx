import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayerSelector } from "@/components/PlayerSelector";
import { ArrowLeft, Trophy, TrendingUp, Target, Calendar, Award, Zap, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface TimelineEvent {
  id: string;
  date: Date;
  type: 'milestone' | 'improvement' | 'achievement' | 'goal';
  title: string;
  description: string;
  icon: any;
  score?: number;
  metric?: string;
  improvement?: number;
}

export default function Timeline() {
  const navigate = useNavigate();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const { data: timelineData, isLoading } = useQuery({
    queryKey: ['player-timeline', selectedPlayer],
    queryFn: async () => {
      if (!selectedPlayer) return null;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch all swing analyses for the player
      const { data: analyses, error: analysesError } = await supabase
        .from('swing_analyses')
        .select('*')
        .eq('user_id', user.id)
        .eq('player_id', selectedPlayer)
        .order('created_at', { ascending: true });

      if (analysesError) throw analysesError;

      if (!analyses || analyses.length === 0) return null;

      // Calculate trends and milestones
      const events: TimelineEvent[] = [];
      const chartData = [];

      // First swing milestone
      events.push({
        id: `first-${analyses[0].id}`,
        date: new Date(analyses[0].created_at),
        type: 'milestone',
        title: 'First Swing Recorded',
        description: 'Started the journey to improvement',
        icon: Star,
        score: analyses[0].overall_score,
      });

      // Process analyses for trends
      let previousScore = analyses[0].overall_score;
      let consecutiveImprovements = 0;
      let personalBestScore = analyses[0].overall_score;
      let personalBestBatSpeed = analyses[0].bat_score || 0;

      analyses.forEach((analysis, index) => {
        // Add to chart data
        chartData.push({
          date: format(new Date(analysis.created_at), 'MMM d'),
          overall: analysis.overall_score,
          bat: analysis.bat_score,
          body: analysis.body_score,
          ball: analysis.ball_score,
          brain: analysis.brain_score,
        });

        // Skip first analysis as we already added it
        if (index === 0) return;

        const currentScore = analysis.overall_score;
        const improvement = currentScore - previousScore;

        // Track consecutive improvements
        if (improvement > 0) {
          consecutiveImprovements++;
          
          // Milestone: 3 consecutive improvements
          if (consecutiveImprovements === 3) {
            events.push({
              id: `streak-${analysis.id}`,
              date: new Date(analysis.created_at),
              type: 'achievement',
              title: 'Hot Streak! 🔥',
              description: '3 consecutive improvements in overall score',
              icon: Zap,
              improvement: improvement,
            });
          }
        } else {
          consecutiveImprovements = 0;
        }

        // Personal best overall score
        if (currentScore > personalBestScore) {
          events.push({
            id: `pb-overall-${analysis.id}`,
            date: new Date(analysis.created_at),
            type: 'achievement',
            title: 'New Personal Best!',
            description: `Overall score: ${currentScore}`,
            icon: Trophy,
            score: currentScore,
            improvement: currentScore - personalBestScore,
          });
          personalBestScore = currentScore;
        }

        // Significant improvement (>10 points)
        if (improvement > 10) {
          events.push({
            id: `improvement-${analysis.id}`,
            date: new Date(analysis.created_at),
            type: 'improvement',
            title: 'Major Breakthrough',
            description: `+${improvement.toFixed(1)} points improvement`,
            icon: TrendingUp,
            improvement: improvement,
          });
        }

        // Milestone scores
        [60, 70, 80, 90].forEach(milestone => {
          if (previousScore < milestone && currentScore >= milestone) {
            events.push({
              id: `milestone-${milestone}-${analysis.id}`,
              date: new Date(analysis.created_at),
              type: 'milestone',
              title: `Reached ${milestone} Score`,
              description: 'Crossed an important threshold',
              icon: Target,
              score: currentScore,
            });
          }
        });

        // BAT pillar improvements
        if (analysis.bat_score > personalBestBatSpeed) {
          const batImprovement = analysis.bat_score - personalBestBatSpeed;
          if (batImprovement > 5) {
            events.push({
              id: `bat-improvement-${analysis.id}`,
              date: new Date(analysis.created_at),
              type: 'improvement',
              title: 'BAT Score Improvement',
              description: `+${batImprovement.toFixed(1)} in BAT metrics`,
              icon: TrendingUp,
              metric: 'BAT',
              improvement: batImprovement,
            });
          }
          personalBestBatSpeed = analysis.bat_score;
        }

        previousScore = currentScore;
      });

      // Total swings milestone
      if (analyses.length >= 10) {
        events.push({
          id: 'swings-10',
          date: new Date(analyses[9].created_at),
          type: 'milestone',
          title: '10 Swings Recorded',
          description: 'Building consistency',
          icon: Award,
        });
      }

      if (analyses.length >= 50) {
        events.push({
          id: 'swings-50',
          date: new Date(analyses[49].created_at),
          type: 'milestone',
          title: '50 Swings Milestone',
          description: 'Dedicated to improvement',
          icon: Award,
        });
      }

      if (analyses.length >= 100) {
        events.push({
          id: 'swings-100',
          date: new Date(analyses[99].created_at),
          type: 'milestone',
          title: '100 Swings Achieved!',
          description: 'Elite commitment level',
          icon: Trophy,
        });
      }

      // Sort events by date
      events.sort((a, b) => a.date.getTime() - b.date.getTime());

      return {
        events,
        chartData,
        totalSwings: analyses.length,
        firstSwingDate: new Date(analyses[0].created_at),
        latestSwingDate: new Date(analyses[analyses.length - 1].created_at),
        daysSinceStart: differenceInDays(new Date(), new Date(analyses[0].created_at)),
      };
    },
    enabled: !!selectedPlayer,
  });

  const getEventColor = (type: string) => {
    switch (type) {
      case 'milestone': return 'bg-blue-500/10 border-blue-500/20 text-blue-600';
      case 'improvement': return 'bg-green-500/10 border-green-500/20 text-green-600';
      case 'achievement': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600';
      case 'goal': return 'bg-purple-500/10 border-purple-500/20 text-purple-600';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-bat/5 to-body/5 px-6 pt-8 pb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold mb-2">Development Timeline</h1>
        <p className="text-muted-foreground">
          Track progress, milestones, and achievements over time
        </p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Player Selection */}
        <Card>
          <CardContent className="pt-6">
            <PlayerSelector
              selectedPlayerId={selectedPlayer}
              onSelectPlayer={setSelectedPlayer}
            />
          </CardContent>
        </Card>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {!isLoading && selectedPlayer && !timelineData && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">No timeline data yet</p>
              <p className="text-sm text-muted-foreground">
                Record swings to start tracking progress
              </p>
            </CardContent>
          </Card>
        )}

        {timelineData && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{timelineData.totalSwings}</div>
                  <p className="text-sm text-muted-foreground">Total Swings</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{timelineData.events.length}</div>
                  <p className="text-sm text-muted-foreground">Milestones</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{timelineData.daysSinceStart}</div>
                  <p className="text-sm text-muted-foreground">Days Training</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {(timelineData.totalSwings / Math.max(1, timelineData.daysSinceStart)).toFixed(1)}
                  </div>
                  <p className="text-sm text-muted-foreground">Swings/Day</p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
                <CardDescription>Overall score progression over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timelineData.chartData}>
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
                    <Area 
                      type="monotone" 
                      dataKey="overall" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 4B Pillars Chart */}
            <Card>
              <CardHeader>
                <CardTitle>4B Pillar Trends</CardTitle>
                <CardDescription>Track each pillar's development</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timelineData.chartData}>
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
                    <Line 
                      type="monotone" 
                      dataKey="bat" 
                      stroke="hsl(var(--bat))" 
                      strokeWidth={2}
                      name="BAT"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="body" 
                      stroke="hsl(var(--body))" 
                      strokeWidth={2}
                      name="BODY"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ball" 
                      stroke="hsl(var(--ball))" 
                      strokeWidth={2}
                      name="BALL"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="brain" 
                      stroke="hsl(var(--brain))" 
                      strokeWidth={2}
                      name="BRAIN"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Timeline Events */}
            <Card>
              <CardHeader>
                <CardTitle>Achievement Timeline</CardTitle>
                <CardDescription>
                  Key milestones and breakthroughs from {format(timelineData.firstSwingDate, 'MMM d, yyyy')} to {format(timelineData.latestSwingDate, 'MMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

                  {/* Events */}
                  <div className="space-y-6">
                    {timelineData.events.map((event, index) => {
                      const Icon = event.icon;
                      return (
                        <div key={event.id} className="relative pl-16">
                          {/* Icon */}
                          <div className={`absolute left-0 w-16 h-16 rounded-full border-4 border-background flex items-center justify-center ${getEventColor(event.type)}`}>
                            <Icon className="h-6 w-6" />
                          </div>

                          {/* Content */}
                          <div className="bg-card border rounded-lg p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className="font-semibold">{event.title}</h3>
                                <p className="text-sm text-muted-foreground">{event.description}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {format(event.date, 'MMM d, yyyy')}
                              </Badge>
                            </div>

                            {event.score !== undefined && (
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className="text-lg font-bold">
                                  {event.score}
                                </Badge>
                                {event.improvement !== undefined && (
                                  <span className="text-sm text-green-600">
                                    +{event.improvement.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            )}

                            {event.metric && event.improvement !== undefined && (
                              <Badge variant="secondary" className="mt-2">
                                {event.metric} +{event.improvement.toFixed(1)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
