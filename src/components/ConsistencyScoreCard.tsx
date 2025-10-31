import { Card } from "@/components/ui/card";
import { Target, Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ConsistencyScoreCardProps {
  score?: number;
  dailyStreak?: number;
}

export function ConsistencyScoreCard({ score = 82, dailyStreak = 7 }: ConsistencyScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Consistency Score</h3>
        </div>
        <div className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</div>
      </div>
      
      <div className="space-y-3">
        <Progress value={score} className="h-2" />

        <div className="flex items-center justify-between text-sm pt-2 border-t">
          <span className="text-muted-foreground">Daily Streak</span>
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-bold text-lg">{dailyStreak}</span>
            <span className="text-muted-foreground">days</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground pt-2 border-t">
          Repeatability and reliability of mechanics
        </p>
      </div>
    </Card>
  );
}
