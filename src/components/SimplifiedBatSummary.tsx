import { Card } from "@/components/ui/card";
import { MetricSourceBadge } from "./MetricSourceBadge";
import { LetterGrade, getGradeColor } from "@/lib/gradingSystem";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SimplifiedBatSummaryProps {
  batSpeed: number;
  attackAngle: number;
  timeInZone: number;
  level: string;
  overallGrade: LetterGrade;
  batSpeedPercentage?: number;
  attackAnglePercentage?: number;
  timeInZonePercentage?: number;
}

export function SimplifiedBatSummary({
  batSpeed,
  attackAngle,
  timeInZone,
  level,
  overallGrade,
  batSpeedPercentage = 0,
  attackAnglePercentage = 0,
  timeInZonePercentage = 0,
}: SimplifiedBatSummaryProps) {
  const averagePercentage = Math.round((batSpeedPercentage + attackAnglePercentage + timeInZonePercentage) / 3);
  
  const getPerformanceLabel = (percentage: number) => {
    if (percentage >= 90) return { label: "Elite", color: "text-green-500" };
    if (percentage >= 80) return { label: "Excellent", color: "text-green-400" };
    if (percentage >= 70) return { label: "Good", color: "text-blue-500" };
    if (percentage >= 60) return { label: "Developing", color: "text-yellow-500" };
    return { label: "Needs Work", color: "text-orange-500" };
  };
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
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="text-sm text-muted-foreground">Overall Bat Grade</div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Info className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Grade Breakdown</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-2">Your Overall Grade</div>
                    <div className={`text-5xl font-bold ${getGradeColor(overallGrade)}`}>
                      {overallGrade}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {averagePercentage}% Average
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-muted-foreground">
                      How It's Calculated:
                    </div>

                    {/* Bat Speed Score */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Bat Speed</span>
                        <span className={getPerformanceLabel(batSpeedPercentage).color}>
                          {Math.round(batSpeedPercentage)}%
                        </span>
                      </div>
                      <Progress value={batSpeedPercentage} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {batSpeed} mph vs {level} benchmark (60-80 mph)
                      </div>
                    </div>

                    {/* Attack Angle Score */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Attack Angle</span>
                        <span className={getPerformanceLabel(attackAnglePercentage).color}>
                          {Math.round(attackAnglePercentage)}%
                        </span>
                      </div>
                      <Progress value={attackAnglePercentage} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {attackAngle}° (ideal range: 8-12°)
                      </div>
                    </div>

                    {/* Time in Zone Score */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Time in Zone</span>
                        <span className={getPerformanceLabel(timeInZonePercentage).color}>
                          {Math.round(timeInZonePercentage)}%
                        </span>
                      </div>
                      <Progress value={timeInZonePercentage} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {timeInZone} ms in optimal zone
                      </div>
                    </div>

                    {/* Formula */}
                    <div className="pt-4 border-t">
                      <div className="text-xs text-muted-foreground text-center">
                        Overall Grade = ({Math.round(batSpeedPercentage)}% + {Math.round(attackAnglePercentage)}% + {Math.round(timeInZonePercentage)}%) ÷ 3
                      </div>
                      <div className="text-xs text-muted-foreground text-center mt-1">
                        = {averagePercentage}% = {overallGrade}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-primary/10 rounded-lg">
                    <div className="text-xs text-muted-foreground">
                      💡 <span className="font-semibold">Note:</span> We're continuously refining this grading system based on collected data and research insights.
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
