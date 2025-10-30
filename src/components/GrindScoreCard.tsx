import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useGrindScore } from "@/hooks/useGrindScore";

interface GrindScoreCardProps {
  userId?: string;
}

export function GrindScoreCard({ userId }: GrindScoreCardProps) {
  const { grindScore, loading, streakBadge, completionRate, onTimeRate } = useGrindScore(userId);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (!grindScore) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">GRIND Score</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Complete your first task to start building your GRIND score
        </p>
      </Card>
    );
  }

  const score = Math.round(Number(grindScore.current_score));

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">GRIND Score</h3>
        </div>
        <div className="text-4xl font-bold text-primary">{score}</div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Current Streak</span>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="font-semibold">{grindScore.current_streak} days</span>
            {streakBadge && (
              <Badge variant="secondary" className="ml-1">
                {streakBadge.emoji} {streakBadge.days}+ Day
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Longest Streak</span>
          <span className="font-semibold">{grindScore.longest_streak} days</span>
        </div>
        
        <div className="pt-3 border-t space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Completion Rate</span>
            </div>
            <span className="font-semibold">{completionRate}%</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>On-Time Rate</span>
            </div>
            <span className="font-semibold">{onTimeRate}%</span>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            GRIND = Completion % × On-Time % • Late reduces score • Miss resets streak
          </p>
        </div>
      </div>
    </Card>
  );
}
