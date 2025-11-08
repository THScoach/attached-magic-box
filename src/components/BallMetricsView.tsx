import { ExitVelocityRocket } from "./ExitVelocityRocket";
import { LaunchAngleSprayChart } from "./LaunchAngleSprayChart";
import { HardHitTarget } from "./HardHitTarget";
import { MetricsDisclaimer } from "./MetricsDisclaimer";
import { MetricSourceBadge } from "./MetricSourceBadge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload } from "lucide-react";
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
  dataSource?: "video" | "sensor" | "estimated";
  hasExternalData?: boolean;
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
  dataSource = "estimated",
  hasExternalData = false,
}: BallMetricsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">⚾</span>
          <h2 className="text-2xl font-bold">BALL (Output)</h2>
        </div>
        <MetricSourceBadge source={hasExternalData ? "sensor" : "estimated"} />
      </div>

      {!hasExternalData && (
        <Alert className="border-warning/50 bg-warning/10">
          <Upload className="h-4 w-4" />
          <AlertDescription>
            <strong>Ball metrics require sensor data.</strong> Values shown below are estimates only. 
            Upload data from HitTrax, Rapsodo, Blast Motion, or similar devices for accurate readings.
          </AlertDescription>
        </Alert>
      )}

      {hasExternalData && (
        <Alert className="border-success/50 bg-success/10">
          <AlertDescription>
            <strong>✓ Sensor data connected.</strong> Ball metrics shown below are from your external device.
          </AlertDescription>
        </Alert>
      )}

      <MetricsDisclaimer type="ball" />

      <div className={`grid gap-6 md:grid-cols-1 lg:grid-cols-2 ${!hasExternalData ? 'opacity-60' : ''}`}>
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
