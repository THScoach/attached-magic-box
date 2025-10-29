import { Card } from "@/components/ui/card";
import { SwingAnalysis } from "@/types/swing";
import { TrendingUp, Target, Gauge } from "lucide-react";

interface RebootStyleMetricsProps {
  analysis: SwingAnalysis;
}

export function RebootStyleMetrics({ analysis }: RebootStyleMetricsProps) {
  // MLB averages for comparison
  const mlbAverages = {
    pelvisVelocity: 520,
    torsoVelocity: 950,
    armVelocity: 1150,
    batSpeed: 72,
    xFactor: 27,
    comDistance: 45,
  };

  const getPercentage = (value: number, mlbAvg: number) => {
    return ((value / mlbAvg) * 100).toFixed(0);
  };

  return (
    <div className="space-y-4">
      {/* Segment Angular Velocities */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-lg">Segment Angular Velocity</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Pelvis</p>
              <p className="text-2xl font-bold text-primary">
                {analysis.pelvisMaxVelocity || 0}
              </p>
              <p className="text-xs text-muted-foreground">deg/s</p>
              <p className="text-xs mt-1">
                <span className={
                  (analysis.pelvisMaxVelocity || 0) >= mlbAverages.pelvisVelocity 
                    ? "text-green-500" 
                    : "text-yellow-500"
                }>
                  {getPercentage(analysis.pelvisMaxVelocity || 0, mlbAverages.pelvisVelocity)}% of MLB avg
                </span>
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Torso</p>
              <p className="text-2xl font-bold text-primary">
                {analysis.torsoMaxVelocity || 0}
              </p>
              <p className="text-xs text-muted-foreground">deg/s</p>
              <p className="text-xs mt-1">
                <span className={
                  (analysis.torsoMaxVelocity || 0) >= mlbAverages.torsoVelocity 
                    ? "text-green-500" 
                    : "text-yellow-500"
                }>
                  {getPercentage(analysis.torsoMaxVelocity || 0, mlbAverages.torsoVelocity)}% of MLB avg
                </span>
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Arm</p>
              <p className="text-2xl font-bold text-primary">
                {analysis.armMaxVelocity || 0}
              </p>
              <p className="text-xs text-muted-foreground">deg/s</p>
              <p className="text-xs mt-1">
                <span className={
                  (analysis.armMaxVelocity || 0) >= mlbAverages.armVelocity 
                    ? "text-green-500" 
                    : "text-yellow-500"
                }>
                  {getPercentage(analysis.armMaxVelocity || 0, mlbAverages.armVelocity)}% of MLB avg
                </span>
              </p>
            </div>
          </div>

          {analysis.batMaxVelocity && (
            <div className="text-center pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-1">Bat Speed</p>
              <p className="text-3xl font-bold text-primary">{analysis.batMaxVelocity}</p>
              <p className="text-xs text-muted-foreground">mph</p>
              <p className="text-xs mt-1">
                <span className={
                  (analysis.batMaxVelocity || 0) >= mlbAverages.batSpeed 
                    ? "text-green-500" 
                    : "text-yellow-500"
                }>
                  {getPercentage(analysis.batMaxVelocity || 0, mlbAverages.batSpeed)}% of MLB avg
                </span>
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* X-Factor & Rotation */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-lg">Torso Kinematics</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground">X-Factor (Stance)</p>
              <p className="text-xl font-bold">{analysis.xFactorStance || 0}°</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground">Max X-Factor</p>
              <p className="text-xl font-bold">{analysis.xFactor || 0}°</p>
              <p className="text-xs mt-1">
                <span className={
                  (analysis.xFactor || 0) >= mlbAverages.xFactor 
                    ? "text-green-500" 
                    : "text-yellow-500"
                }>
                  MLB avg: {mlbAverages.xFactor}°
                </span>
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground">Pelvis Rotation</p>
              <p className="text-xl font-bold">{analysis.pelvisRotation || 0}°</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground">Shoulder Rotation</p>
              <p className="text-xl font-bold">{analysis.shoulderRotation || 0}°</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Center of Mass */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Gauge className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-lg">Center of Mass</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-lg bg-muted">
            <p className="text-xs text-muted-foreground mb-1">Travel Distance</p>
            <p className="text-2xl font-bold">{analysis.comDistance || 0}%</p>
            <p className="text-xs text-muted-foreground mt-1">of body height</p>
            <p className="text-xs mt-1">
              <span className={
                (analysis.comDistance || 0) >= mlbAverages.comDistance 
                  ? "text-green-500" 
                  : "text-yellow-500"
              }>
                MLB avg: {mlbAverages.comDistance}%
              </span>
            </p>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-muted">
            <p className="text-xs text-muted-foreground mb-1">Max Velocity</p>
            <p className="text-2xl font-bold">{analysis.comMaxVelocity?.toFixed(2) || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">m/s</p>
          </div>
        </div>
      </Card>

      {/* Kinematic Sequence Timing */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <h3 className="font-bold text-lg mb-4">Kinematic Sequence</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Pelvis Peak</span>
            <span className="font-bold">{analysis.pelvisTiming || 0}ms</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between">
            <span className="text-sm">Torso Peak</span>
            <span className="font-bold">{analysis.torsoTiming || 0}ms</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between">
            <span className="text-sm">Hands Peak</span>
            <span className="font-bold">{analysis.handsTiming || 0}ms</span>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tempo Ratio</span>
              <span className="text-xl font-bold text-primary">{analysis.tempoRatio}:1</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Optimal: 1.3-1.5 (timing between segments)
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
