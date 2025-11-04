import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, TrendingDown, Minus, Trophy, Users } from "lucide-react";
import { usePeerComparison } from "@/hooks/usePeerComparison";
import { Skeleton } from "@/components/ui/skeleton";

interface PeerComparisonProps {
  playerId?: string;
}

export function PeerComparison({ playerId }: PeerComparisonProps) {
  const [selectedMetric, setSelectedMetric] = useState<'batSpeed' | 'exitVelocity' | 'hitsScore' | 'sequenceEfficiency'>('hitsScore');
  const { rankings, userRank, loading } = usePeerComparison(selectedMetric, playerId);

  const metrics = [
    { key: 'hitsScore', label: 'H.I.T.S. Score', icon: '🎯' },
    { key: 'batSpeed', label: 'Bat Speed', icon: '🏏' },
    { key: 'exitVelocity', label: 'Exit Velocity', icon: '⚾' },
    { key: 'sequenceEfficiency', label: 'Sequence', icon: '💪' },
  ];

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-600';
    return 'text-muted-foreground';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-bold">Peer Rankings</h3>
      </div>

      {/* Metric Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {metrics.map((metric) => (
          <button
            key={metric.key}
            onClick={() => setSelectedMetric(metric.key as any)}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedMetric === metric.key
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="text-2xl mb-1">{metric.icon}</div>
            <div className="text-xs font-medium">{metric.label}</div>
          </button>
        ))}
      </div>

      {/* User's Rank Card */}
      {userRank && (
        <Card className="p-4 mb-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-primary">
                {getRankBadge(userRank.rank)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Rank</p>
                <p className="text-2xl font-bold">{userRank.value.toFixed(1)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Out of</p>
              <p className="text-xl font-bold">{rankings.length} players</p>
            </div>
          </div>
        </Card>
      )}

      {/* Leaderboard */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-4 py-2 text-sm font-medium text-muted-foreground border-b">
          <span>Rank</span>
          <span>Player</span>
          <span>Score</span>
        </div>

        {rankings.slice(0, 20).map((player) => {
          const isCurrentUser = userRank && player.rank === userRank.rank;
          
          return (
            <div
              key={player.userId}
              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                isCurrentUser
                  ? 'bg-primary/10 border border-primary/30'
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <span className={`text-xl font-bold w-12 ${getRankColor(player.rank)}`}>
                  {getRankBadge(player.rank)}
                </span>
                
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-sm">
                    {player.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <p className="font-semibold">
                    {player.name}
                    {isCurrentUser && (
                      <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                    )}
                  </p>
                  {player.level && (
                    <p className="text-xs text-muted-foreground">{player.level}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-bold">{player.value.toFixed(1)}</p>
                  {player.trend !== undefined && (
                    <div className="flex items-center gap-1 text-xs">
                      {player.trend > 0 && (
                        <>
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <span className="text-green-500">+{player.trend.toFixed(1)}</span>
                        </>
                      )}
                      {player.trend < 0 && (
                        <>
                          <TrendingDown className="h-3 w-3 text-red-500" />
                          <span className="text-red-500">{player.trend.toFixed(1)}</span>
                        </>
                      )}
                      {player.trend === 0 && (
                        <>
                          <Minus className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">0</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {rankings.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No rankings available yet. Keep training to join the leaderboard!
          </p>
        </div>
      )}
    </Card>
  );
}
