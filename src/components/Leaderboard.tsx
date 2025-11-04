import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Zap } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar?: string;
  score: number;
  level?: number;
  trend?: 'up' | 'down' | 'same';
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  hitsLeaderboard?: LeaderboardEntry[];
  xpLeaderboard?: LeaderboardEntry[];
  streakLeaderboard?: LeaderboardEntry[];
}

const defaultHitsLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Mike Trout", score: 95, level: 42, trend: 'up' },
  { rank: 2, name: "Aaron Judge", score: 93, level: 38, trend: 'same' },
  { rank: 3, name: "Ronald Acuña Jr.", score: 91, level: 35, trend: 'up' },
  { rank: 4, name: "Shohei Ohtani", score: 89, level: 40, trend: 'down' },
  { rank: 5, name: "You", score: 75, level: 8, trend: 'up', isCurrentUser: true },
  { rank: 6, name: "Mookie Betts", score: 74, level: 28 },
  { rank: 7, name: "Fernando Tatis Jr.", score: 72, level: 25 },
];

const defaultXpLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Mike Trout", score: 12500, level: 42 },
  { rank: 2, name: "Aaron Judge", score: 11200, level: 38 },
  { rank: 3, name: "You", score: 2850, level: 8, isCurrentUser: true },
  { rank: 4, name: "Ronald Acuña Jr.", score: 2700, level: 35 },
  { rank: 5, name: "Shohei Ohtani", score: 2400, level: 40 },
];

const defaultStreakLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Mike Trout", score: 47, trend: 'up' },
  { rank: 2, name: "Aaron Judge", score: 32, trend: 'up' },
  { rank: 3, name: "Ronald Acuña Jr.", score: 28, trend: 'up' },
  { rank: 4, name: "You", score: 5, trend: 'up', isCurrentUser: true },
  { rank: 5, name: "Shohei Ohtani", score: 4, trend: 'same' },
];

export function Leaderboard({ 
  hitsLeaderboard = defaultHitsLeaderboard,
  xpLeaderboard = defaultXpLeaderboard,
  streakLeaderboard = defaultStreakLeaderboard,
}: LeaderboardProps) {
  const renderLeaderboardEntry = (entry: LeaderboardEntry, metric: string) => (
    <div
      key={entry.rank}
      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
        entry.isCurrentUser
          ? 'bg-primary/10 border-2 border-primary'
          : 'bg-muted/30 hover:bg-muted/50'
      }`}
    >
      {/* Rank */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
        entry.rank === 1 ? 'bg-amber-500 text-white' :
        entry.rank === 2 ? 'bg-gray-400 text-white' :
        entry.rank === 3 ? 'bg-amber-700 text-white' :
        'bg-muted text-muted-foreground'
      }`}>
        {entry.rank <= 3 ? (
          entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'
        ) : (
          entry.rank
        )}
      </div>

      {/* Avatar & Name */}
      <Avatar className="w-10 h-10">
        <AvatarImage src={entry.avatar} alt={entry.name} />
        <AvatarFallback>{entry.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate flex items-center gap-2">
          {entry.name}
          {entry.isCurrentUser && (
            <Badge variant="secondary" className="text-xs">You</Badge>
          )}
        </div>
        {entry.level && (
          <div className="text-xs text-muted-foreground">Level {entry.level}</div>
        )}
      </div>

      {/* Score */}
      <div className="text-right">
        <div className="font-bold text-lg">{entry.score}{metric === 'streak' ? ' 🔥' : ''}</div>
        {entry.trend && (
          <div className={`text-xs ${
            entry.trend === 'up' ? 'text-green-500' :
            entry.trend === 'down' ? 'text-red-500' :
            'text-muted-foreground'
          }`}>
            {entry.trend === 'up' ? '↗' : entry.trend === 'down' ? '↘' : '→'}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5" />
        <h3 className="text-xl font-bold">Leaderboard</h3>
      </div>

      <Tabs defaultValue="hits" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="hits" className="text-xs sm:text-sm">
            <Trophy className="w-4 h-4 mr-1" />
            H.I.T.S.
          </TabsTrigger>
          <TabsTrigger value="xp" className="text-xs sm:text-sm">
            <TrendingUp className="w-4 h-4 mr-1" />
            XP
          </TabsTrigger>
          <TabsTrigger value="streak" className="text-xs sm:text-sm">
            <Zap className="w-4 h-4 mr-1" />
            Streak
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hits" className="space-y-2">
          <div className="text-sm text-muted-foreground mb-3">
            Top players by H.I.T.S. score
          </div>
          {hitsLeaderboard.map(entry => renderLeaderboardEntry(entry, 'hits'))}
        </TabsContent>

        <TabsContent value="xp" className="space-y-2">
          <div className="text-sm text-muted-foreground mb-3">
            Top players by total XP
          </div>
          {xpLeaderboard.map(entry => renderLeaderboardEntry(entry, 'xp'))}
        </TabsContent>

        <TabsContent value="streak" className="space-y-2">
          <div className="text-sm text-muted-foreground mb-3">
            Longest current practice streaks
          </div>
          {streakLeaderboard.map(entry => renderLeaderboardEntry(entry, 'streak'))}
        </TabsContent>
      </Tabs>

      <div className="mt-4 p-3 bg-accent/50 rounded-lg text-center">
        <div className="text-xs text-muted-foreground">
          💪 Keep practicing to climb the ranks!
        </div>
      </div>
    </Card>
  );
}
