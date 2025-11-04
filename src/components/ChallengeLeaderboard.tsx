import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Target, Medal, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Challenge {
  id: string;
  title: string;
  challenge_type: string;
  start_date: string;
  end_date: string;
  status: string;
  metric_target: string | null;
}

interface LeaderboardEntry {
  user_id: string;
  player_id: string | null;
  user_first_name: string;
  user_last_name: string;
  first_name: string | null;
  last_name: string | null;
  team_name: string | null;
  rank: number;
  current_score: number;
  baseline_score: number | null;
  improvement_percentage: number | null;
  swings_completed: number;
}

const challengeTypeLabels: Record<string, string> = {
  most_swings: "Most Swings",
  highest_score: "Highest Score",
  most_improved: "Most Improved",
  consistency: "Consistency",
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return <span className="text-muted-foreground font-semibold">#{rank}</span>;
};

export function ChallengeLeaderboard() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  useEffect(() => {
    if (selectedChallenge) {
      loadLeaderboard(selectedChallenge);
      
      // Set up realtime subscription
      const channel = supabase
        .channel('challenge_updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'challenge_participants',
            filter: `challenge_id=eq.${selectedChallenge}`,
          },
          () => {
            loadLeaderboard(selectedChallenge);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedChallenge]);

  const loadChallenges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('team_challenges')
        .select('*')
        .in('status', ['active', 'upcoming'])
        .order('start_date', { ascending: false });

      if (error) throw error;

      setChallenges(data || []);
      if (data && data.length > 0) {
        setSelectedChallenge(data[0].id);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async (challengeId: string) => {
    try {
      const { data, error } = await supabase
        .from('challenge_leaderboard')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('rank', { ascending: true });

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Challenge Leaderboards</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading challenges...</p>
        </CardContent>
      </Card>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Challenge Leaderboards</CardTitle>
          <CardDescription>No active challenges at this time</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const challenge = challenges.find(c => c.id === selectedChallenge);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Challenge Leaderboards
            </CardTitle>
            <CardDescription>Real-time rankings and progress</CardDescription>
          </div>
          {challenge && (
            <Badge variant={challenge.status === 'active' ? 'default' : 'secondary'} className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {getTimeRemaining(challenge.end_date)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedChallenge || undefined} onValueChange={setSelectedChallenge}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {challenges.map((c) => (
              <TabsTrigger key={c.id} value={c.id}>
                {c.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {challenges.map((c) => (
            <TabsContent key={c.id} value={c.id} className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{challengeTypeLabels[c.challenge_type]}</Badge>
                    <Badge variant={c.status === 'active' ? 'default' : 'secondary'}>
                      {c.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(c.start_date).toLocaleDateString()} - {new Date(c.end_date).toLocaleDateString()}
                  </p>
                </div>
                {c.metric_target && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Target</p>
                    <p className="text-2xl font-bold">{parseFloat(c.metric_target)}</p>
                  </div>
                )}
              </div>

              {leaderboard.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No participants yet
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry) => {
                    const displayName = entry.first_name && entry.last_name
                      ? `${entry.first_name} ${entry.last_name}`
                      : `${entry.user_first_name} ${entry.user_last_name}`;
                    
                    const initials = displayName
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase();

                    const progressPercent = c.metric_target
                      ? Math.min((entry.current_score / parseFloat(c.metric_target)) * 100, 100)
                      : 0;

                    return (
                      <div
                        key={`${entry.user_id}-${entry.player_id}`}
                        className={`flex items-center gap-4 p-4 rounded-lg border ${
                          entry.rank <= 3 ? 'bg-primary/5 border-primary/20' : 'bg-card'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-[80px]">
                          {getRankIcon(entry.rank)}
                        </div>

                        <Avatar>
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{displayName}</p>
                            {entry.team_name && (
                              <Badge variant="outline" className="text-xs">
                                {entry.team_name}
                              </Badge>
                            )}
                          </div>
                          
                          {c.metric_target && (
                            <Progress value={progressPercent} className="h-2 mt-2" />
                          )}

                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>{entry.swings_completed} swings</span>
                            {entry.improvement_percentage !== null && (
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                +{entry.improvement_percentage.toFixed(1)}%
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {entry.current_score.toFixed(c.challenge_type === 'most_swings' ? 0 : 1)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {c.challenge_type === 'most_swings' && 'swings'}
                            {c.challenge_type === 'highest_score' && 'score'}
                            {c.challenge_type === 'most_improved' && 'improvement'}
                            {c.challenge_type === 'consistency' && 'consistency'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
