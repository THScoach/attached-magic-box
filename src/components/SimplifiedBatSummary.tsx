import { Card } from "@/components/ui/card";
import { MetricSourceBadge } from "./MetricSourceBadge";
import { LetterGrade, getGradeColor } from "@/lib/gradingSystem";

interface SimplifiedBatSummaryProps {
  batSpeed: number;
  attackAngle: number;
  timeInZone: number;
  level: string;
  overallGrade: LetterGrade;
}

export function SimplifiedBatSummary({
  batSpeed,
  attackAngle,
  timeInZone,
  level,
  overallGrade,
}: SimplifiedBatSummaryProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏏</span>
          <h3 className="font-semibold text-lg">YOUR BAT</h3>
        </div>
        <MetricSourceBadge source="video" />
      </div>

      <div className="space-y-4">
        {/* Overall Grade */}
        <div className="text-center p-6 bg-muted/30 rounded-lg">
          <div className="text-sm text-muted-foreground mb-2">Overall Bat Grade</div>
          <div className={`text-6xl font-bold ${getGradeColor(overallGrade)}`}>
            {overallGrade}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 bg-primary/10 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Bat Speed</div>
            <div className="text-2xl font-bold text-primary">{batSpeed}</div>
            <div className="text-xs text-muted-foreground">mph</div>
          </div>

          <div className="p-4 bg-success/10 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Attack Angle</div>
            <div className="text-2xl font-bold text-success">{attackAngle}°</div>
            <div className="text-xs text-muted-foreground">upward</div>
          </div>

          <div className="p-4 bg-warning/10 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Time in Zone</div>
            <div className="text-2xl font-bold text-warning">{timeInZone}</div>
            <div className="text-xs text-muted-foreground">ms</div>
          </div>
        </div>

        {/* Simple Interpretation */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-sm">
            {batSpeed >= 70 ? (
              <p className="text-green-500">✓ Your bat is moving fast through the zone.</p>
            ) : batSpeed >= 60 ? (
              <p className="text-yellow-500">○ Good bat speed, room to grow.</p>
            ) : (
              <p className="text-orange-500">⚠ Focus on building more bat speed.</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
