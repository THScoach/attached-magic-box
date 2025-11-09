import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface KeyBiomechanicsProps {
  metrics: {
    peakPelvisRotVel?: number; // °/s
    peakShoulderRotVel?: number; // °/s
    peakBatSpeed?: number; // mph
    attackAngle?: number; // degrees
  };
}

export function KeyBiomechanics({ metrics }: KeyBiomechanicsProps) {
  // Only show component if we have at least one metric
  const hasData = metrics.peakPelvisRotVel !== undefined || 
                  metrics.peakShoulderRotVel !== undefined || 
                  metrics.peakBatSpeed !== undefined || 
                  metrics.attackAngle !== undefined;

  if (!hasData) {
    return null; // Don't render if no data
  }

  const getStatus = (value: number | undefined, optimal: [number, number], developing: [number, number]) => {
    if (value === undefined) return "N/A";
    if (value >= optimal[0] && value <= optimal[1]) return "optimal";
    if (value >= developing[0] && value <= developing[1]) return "developing";
    return "needs-work";
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "optimal") return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === "developing") return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    if (status === "N/A") return <div className="h-4 w-4" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const MetricRow = ({ 
    label, 
    value, 
    unit, 
    status,
    tooltip 
  }: { 
    label: string; 
    value: number | undefined; 
    unit: string; 
    status: string;
    tooltip: string;
  }) => {
    if (value === undefined) return null; // Don't render row if no data
    
    return (
      <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          <InfoTooltip content={tooltip} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">
            {value.toFixed(value < 10 ? 1 : 0)}{unit}
          </span>
          <StatusIcon status={status} />
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Biomechanics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Extracted from PDF
          </h3>
          
          <MetricRow
            label="Peak Pelvis Rotation"
            value={metrics.peakPelvisRotVel}
            unit="°/s"
            status={getStatus(metrics.peakPelvisRotVel, [900, 2000], [700, 900])}
            tooltip="Peak pelvis rotational velocity. Elite: >900°/s. This represents how explosively the hips fire in the swing."
          />
          
          <MetricRow
            label="Peak Shoulder Rotation"
            value={metrics.peakShoulderRotVel}
            unit="°/s"
            status={getStatus(metrics.peakShoulderRotVel, [800, 2000], [600, 800])}
            tooltip="Peak shoulder rotational velocity. Elite: >800°/s. Shows how aggressively the upper body rotates."
          />
          
          <MetricRow
            label="Peak Bat Speed"
            value={metrics.peakBatSpeed}
            unit=" mph"
            status={getStatus(metrics.peakBatSpeed, [70, 100], [60, 70])}
            tooltip="Maximum bat velocity at impact. Elite: >70 mph. Primary indicator of power output."
          />
          
          <MetricRow
            label="Attack Angle"
            value={metrics.attackAngle}
            unit="°"
            status={getStatus(metrics.attackAngle, [8, 15], [5, 8])}
            tooltip="Bat path angle at contact. Optimal: 8-15°. Matches typical pitch plane for solid contact and launch angle."
          />
        </div>
      </CardContent>
    </Card>
  );
}
