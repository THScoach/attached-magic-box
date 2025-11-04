import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, TrendingUp, Target, Calendar, Award } from "lucide-react";
import { useTeamChallenges, useChallengeLeaderboard } from "@/hooks/useTeamChallenges";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface ChallengeCardProps {
  challenge: any;
  onViewDetails: (id: string) => void;
}

function ChallengeCard({ challenge, onViewDetails }: ChallengeCardProps) {
  const now = new Date();
  const startDate = new Date(challenge.start_date);
  const endDate = new Date(challenge.end_date);
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const progress = Math.max(0, Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100));

  const statusColors = {
    upcoming: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    active: "bg-green-500/10 text-green-500 border-green-500/20",
    completed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const typeIcons = {
    most_swings: <Target className="h-5 w-5" />,
    highest_score: <Trophy className="h-5 w-5" />,
    most_improved: <TrendingUp className="h-5 w-5" />,
    consistency: <Award className="h-5 w-5" />,
    specific_metric: <Target className="h-5 w-5" />,
  };

  const typeLabels = {
    most_swings: "Most Swings",
    highest_score: "Highest Score",
    most_improved: "Most Improved",
    consistency: "Best Consistency",
    specific_metric: "Specific Metric",
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onViewDetails(challenge.id)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              {typeIcons[challenge.challenge_type as keyof typeof typeIcons]}
            </div>
            <div>
              <CardTitle className="text-lg">{challenge.title}</CardTitle>
              <CardDescription className="mt-1">
                {typeLabels[challenge.challenge_type as keyof typeof typeLabels]}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={statusColors[challenge.status as keyof typeof statusColors]}>
            {challenge.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenge.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{challenge.description}</p>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
          </span>
        </div>

        {challenge.status === 'active' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{daysRemaining} days left</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {challenge.prizes && challenge.prizes.length > 0 && (
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-muted-foreground">
              {challenge.prizes.length} prize{challenge.prizes.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface LeaderboardProps {
  challengeId: string;
}

function Leaderboard({ challengeId }: LeaderboardProps) {
  const { data: leaderboard, isLoading } = useChallengeLeaderboard(challengeId);

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading leaderboard...</div>;
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No participants yet</p>
      </Card>
    );
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "text-yellow-500";
      case 2: return "text-gray-400";
      case 3: return "text-orange-600";
      default: return "text-muted-foreground";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
    }
  };

  return (
    <div className="space-y-3">
      {leaderboard.map((entry) => (
        <Card key={entry.user_id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`text-2xl font-bold ${getRankColor(entry.rank)}`}>
                {getRankIcon(entry.rank)}
              </div>
              <div>
                <p className="font-semibold">
                  {entry.first_name || entry.user_first_name} {entry.last_name || entry.user_last_name}
                </p>
                {entry.team_name && (
                  <p className="text-sm text-muted-foreground">{entry.team_name}</p>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{entry.current_score.toFixed(1)}</p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <span>{entry.swings_completed} swings</span>
                {entry.improvement_percentage !== 0 && (
                  <span className={entry.improvement_percentage > 0 ? "text-green-500" : "text-red-500"}>
                    {entry.improvement_percentage > 0 ? '+' : ''}{entry.improvement_percentage.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function TeamChallenges() {
  const { challenges, myParticipations, isLoadingChallenges } = useTeamChallenges();
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const upcomingChallenges = challenges.filter(c => c.status === 'upcoming');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  if (isLoadingChallenges) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading challenges...
        </CardContent>
      </Card>
    );
  }

  if (selectedChallengeId) {
    const challenge = challenges.find(c => c.id === selectedChallengeId);
    if (!challenge) return null;

    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedChallengeId(null)}>
          ← Back to Challenges
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{challenge.title}</CardTitle>
                <CardDescription className="mt-2">{challenge.description}</CardDescription>
              </div>
              <Badge variant="outline">{challenge.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-semibold">
                  {challenge.challenge_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-semibold">{format(new Date(challenge.start_date), 'MMM d, yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-semibold">{format(new Date(challenge.end_date), 'MMM d, yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prizes</p>
                <p className="font-semibold">{challenge.prizes?.length || 0}</p>
              </div>
            </div>

            {challenge.rules && (
              <div>
                <h3 className="font-semibold mb-2">Rules</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{challenge.rules}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>Live rankings updated in real-time</CardDescription>
          </CardHeader>
          <CardContent>
            <Leaderboard challengeId={challenge.id} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Challenges Available</h3>
          <p className="text-muted-foreground mb-4">
            Your coach hasn't created any challenges yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-6 w-6" />
          Team Challenges
        </CardTitle>
        <CardDescription>Compete with your teammates and track your progress</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">
              Active <Badge variant="secondary" className="ml-2">{activeChallenges.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming <Badge variant="secondary" className="ml-2">{upcomingChallenges.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed <Badge variant="secondary" className="ml-2">{completedChallenges.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-6">
            {activeChallenges.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No active challenges</p>
            ) : (
              activeChallenges.map(challenge => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onViewDetails={setSelectedChallengeId}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4 mt-6">
            {upcomingChallenges.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No upcoming challenges</p>
            ) : (
              upcomingChallenges.map(challenge => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onViewDetails={setSelectedChallengeId}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-6">
            {completedChallenges.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No completed challenges</p>
            ) : (
              completedChallenges.map(challenge => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onViewDetails={setSelectedChallengeId}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
