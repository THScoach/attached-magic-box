import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Target } from "lucide-react";

interface GritScoreCardProps {
  currentScore: number;
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  totalAssigned: number;
}

export function GritScoreCard({
  currentScore,
  currentStreak,
  longestStreak,
  totalCompleted,
  totalAssigned,
}: GritScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const completionRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-accent/10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">GRIT Score</h3>
          <p className="text-sm text-muted-foreground">Your commitment level</p>
        </div>
        <Target className="h-8 w-8 text-primary" />
      </div>

      <div className="space-y-6">
        {/* Main Score */}
        <div className="text-center">
          <div className={`text-6xl font-bold ${getScoreColor(currentScore)}`}>
            {currentScore}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Completion × On-Time</p>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Completion Rate</span>
            <span className="font-medium text-foreground">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {/* Streak Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
            <Flame className="h-5 w-5 text-orange-500" />
            <div>
              <div className="text-2xl font-bold text-foreground">{currentStreak}</div>
              <div className="text-xs text-muted-foreground">Current Streak</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
            <Trophy className="h-5 w-5 text-primary" />
            <div>
              <div className="text-2xl font-bold text-foreground">{longestStreak}</div>
              <div className="text-xs text-muted-foreground">Best Streak</div>
            </div>
          </div>
        </div>

        {/* Streak Badges */}
        <div className="flex flex-wrap gap-2">
          {currentStreak >= 7 && (
            <Badge variant="secondary" className="gap-1">
              <Flame className="h-3 w-3" /> 7 Day Streak
            </Badge>
          )}
          {currentStreak >= 14 && (
            <Badge variant="secondary" className="gap-1">
              <Flame className="h-3 w-3" /> 14 Day Streak
            </Badge>
          )}
          {currentStreak >= 30 && (
            <Badge variant="secondary" className="gap-1">
              <Trophy className="h-3 w-3" /> 30 Day Streak
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {totalCompleted} of {totalAssigned} tasks completed
          </div>
        </div>
      </div>
    </Card>
  );
}
