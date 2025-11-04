import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LetterGrade, getGradeColor } from "@/lib/gradingSystem";

interface HardHitTargetProps {
  hardHitPercentage: number; // 0-100
  totalSwings: number;
  hardHitCount: number;
  grade: LetterGrade;
}

export function HardHitTarget({
  hardHitPercentage,
  totalSwings,
  hardHitCount,
  grade,
}: HardHitTargetProps) {
  const mlbAverage = 40;
  const isElite = hardHitPercentage >= mlbAverage;

  // Calculate how many targets hit
  const targetCount = 10;
  const targetsHit = Math.round((hardHitPercentage / 100) * targetCount);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🎯</span>
        <h3 className="font-semibold text-lg">HARD HIT %</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Balls hit 90+ mph:
      </p>

      {/* Main percentage display */}
      <div className="text-center mb-6">
        <div className="text-6xl font-bold text-primary mb-2">
          {hardHitPercentage}%
        </div>
        <Progress value={hardHitPercentage} className="h-4 mb-2" />
      </div>

      {/* Target Grid */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {Array.from({ length: targetCount }).map((_, i) => (
          <div
            key={i}
            className={`aspect-square rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
              i < targetsHit
                ? 'bg-green-500 scale-100'
                : 'bg-muted/30 scale-90 opacity-50'
            }`}
            style={{
              animationDelay: `${i * 0.1}s`
            }}
          >
            {i < targetsHit ? '🎯' : '○'}
          </div>
        ))}
      </div>

      {/* Status */}
      <div className={`p-4 rounded-lg mb-4 ${isElite ? 'bg-green-500/10' : 'bg-blue-500/10'}`}>
        <div className={`font-bold mb-1 ${isElite ? 'text-green-500' : 'text-blue-500'}`}>
          {isElite ? '✓ CRUSHING IT!' : '⚠ Keep working!'}
        </div>
        <div className="text-sm text-muted-foreground">
          Out of {totalSwings} swings:
        </div>
        <div className="text-sm mt-1">
          <span className="font-bold text-green-500">• {hardHitCount} were hit hard (90+)</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">• {totalSwings - hardHitCount} were soft contact</span>
        </div>
      </div>

      {/* MLB Comparison */}
      <div className="p-3 bg-muted/50 rounded-lg mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">🎯 MLB Average:</span>
          <span className="font-medium">{mlbAverage}%</span>
        </div>
        {isElite && (
          <div className="text-sm text-green-500 font-bold mt-2 text-center">
            🔥 You're WAY above MLB average!
          </div>
        )}
      </div>

      {/* Grade */}
      <div className="text-center">
        <span className="text-muted-foreground">Grade: </span>
        <span className={`text-2xl font-bold ${getGradeColor(grade)}`}>
          {grade}
        </span>
      </div>
    </Card>
  );
}
