import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";

interface MomentumAnalysisProps {
  metrics: {
    height?: number | null; // inches
    weight?: number | null; // lbs
    peakCOMVelocity?: number | null; // m/s
  };
}

export function MomentumAnalysis({ metrics }: MomentumAnalysisProps) {
  // Only show if we have height, weight, AND peakCOMVelocity
  const hasData = metrics.height !== undefined && metrics.height !== null && 
                  metrics.weight !== undefined && metrics.weight !== null && 
                  metrics.peakCOMVelocity !== undefined && metrics.peakCOMVelocity !== null;

  if (!hasData) {
    return null; // Don't render if missing data
  }

  // Calculate mass in kg
  const massKg = metrics.weight * 0.453592;
  
  // Calculate linear momentum (kg⋅m/s)
  const peakLinearMomentum = massKg * metrics.peakCOMVelocity;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Momentum Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Athlete Info */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Athlete Info
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">
                  {Math.floor(metrics.height / 12)}'{metrics.height % 12}"
                </div>
                <div className="text-xs text-muted-foreground">Height</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {metrics.weight}
                </div>
                <div className="text-xs text-muted-foreground">Weight (lbs)</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {massKg.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Mass (kg)</div>
              </div>
            </div>
          </div>

          {/* Momentum Metrics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Peak Linear Momentum</span>
                <InfoTooltip content="Linear momentum = mass × velocity. Represents total forward momentum at peak COM velocity." />
              </div>
              <span className="text-sm font-bold">
                {peakLinearMomentum.toFixed(1)} kg⋅m/s
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Peak COM Velocity</span>
                <InfoTooltip content="Maximum center of mass velocity during the swing. Elite hitters: 1.0-1.2 m/s." />
              </div>
              <span className="text-sm font-bold">
                {metrics.peakCOMVelocity.toFixed(2)} m/s
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
