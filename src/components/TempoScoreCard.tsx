import { Card } from "@/components/ui/card";
import { Zap, TrendingUp, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TempoScoreCardProps {
  score?: number;
  trend?: number;
}

export function TempoScoreCard({ score = 75, trend = 2.3 }: TempoScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-engine" />
          <h3 className="font-semibold">Tempo Score</h3>
        </div>
        <div className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</div>
      </div>
      
      <div className="space-y-3">
        <Progress value={score} className="h-2 bg-muted">
          <div 
            className="h-full bg-engine transition-all" 
            style={{ width: `${score}%` }}
          />
        </Progress>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">vs Last Week</span>
          <div className="flex items-center gap-1">
            {trend > 0 ? (
              <>
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-green-500 font-semibold">+{trend.toFixed(1)}</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-red-500 font-semibold">{trend.toFixed(1)}</span>
              </>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground pt-2 border-t">
          Optimal sequencing and timing through the zone
        </p>
      </div>
    </Card>
  );
}
