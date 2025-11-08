import { BatSpeedSpeedometer } from "./BatSpeedSpeedometer";
import { AttackAngleLaunchRamp } from "./AttackAngleLaunchRamp";
import { TimeInZoneTarget } from "./TimeInZoneTarget";
import { MetricsDisclaimer } from "./MetricsDisclaimer";
import { MetricSourceBadge } from "./MetricSourceBadge";
import { LetterGrade } from "@/lib/gradingSystem";

interface BatMetricsViewProps {
  batSpeed: number;
  attackAngle: number;
  timeInZone: number;
  level: string;
  batSpeedGrade: LetterGrade;
  attackAngleGrade: LetterGrade;
  timeInZoneGrade: LetterGrade;
  personalBest?: number;
  lastWeekSpeed?: number;
}

export function BatMetricsView({
  batSpeed,
  attackAngle,
  timeInZone,
  level,
  batSpeedGrade,
  attackAngleGrade,
  timeInZoneGrade,
  personalBest,
  lastWeekSpeed,
}: BatMetricsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🏏</span>
          <h2 className="text-2xl font-bold">BAT (Tool)</h2>
        </div>
        <MetricSourceBadge source="video" />
      </div>

      <MetricsDisclaimer type="bat" />

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <BatSpeedSpeedometer
          speed={batSpeed}
          level={level}
          grade={batSpeedGrade}
          personalBest={personalBest}
          lastWeekSpeed={lastWeekSpeed}
        />
        
        <AttackAngleLaunchRamp
          angle={attackAngle}
          grade={attackAngleGrade}
        />
        
        <div className="lg:col-span-2">
          <TimeInZoneTarget
            timeInZone={timeInZone}
            level={level}
            grade={timeInZoneGrade}
          />
        </div>
      </div>
    </div>
  );
}
