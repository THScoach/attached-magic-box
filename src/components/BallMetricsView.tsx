import { ExitVelocityRocket } from "./ExitVelocityRocket";
import { LaunchAngleSprayChart } from "./LaunchAngleSprayChart";
import { HardHitTarget } from "./HardHitTarget";
import { MetricsDisclaimer } from "./MetricsDisclaimer";
import { LetterGrade } from "@/lib/gradingSystem";

interface BallMetricsViewProps {
  exitVelocity: number;
  level: string;
  exitVelocityGrade: LetterGrade;
  exitVelocityImprovement?: number;
  flyBallPercentage: number;
  lineDrivePercentage: number;
  groundBallPercentage: number;
  launchAngleGrade: LetterGrade;
  hardHitPercentage: number;
  totalSwings: number;
  hardHitCount: number;
  hardHitGrade: LetterGrade;
}

export function BallMetricsView({
  exitVelocity,
  level,
  exitVelocityGrade,
  exitVelocityImprovement,
  flyBallPercentage,
  lineDrivePercentage,
  groundBallPercentage,
  launchAngleGrade,
  hardHitPercentage,
  totalSwings,
  hardHitCount,
  hardHitGrade,
}: BallMetricsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-3xl">⚾</span>
        <h2 className="text-2xl font-bold">BALL (Output)</h2>
      </div>

      <MetricsDisclaimer type="ball" />

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <ExitVelocityRocket
          exitVelocity={exitVelocity}
          level={level}
          grade={exitVelocityGrade}
          improvement={exitVelocityImprovement}
        />
        
        <LaunchAngleSprayChart
          flyBallPercentage={flyBallPercentage}
          lineDrivePercentage={lineDrivePercentage}
          groundBallPercentage={groundBallPercentage}
          grade={launchAngleGrade}
        />
        
        <div className="lg:col-span-2">
          <HardHitTarget
            hardHitPercentage={hardHitPercentage}
            totalSwings={totalSwings}
            hardHitCount={hardHitCount}
            grade={hardHitGrade}
          />
        </div>
      </div>
    </div>
  );
}
