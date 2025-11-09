import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface KeyBiomechanicsProps {
  metrics: {
    peakPelvisRotVel?: number; // °/s
    peakShoulderRotVel?: number; // °/s
    peakBatSpeed?: number; // mph
    xFactor?: number; // degrees
    hipShoulderSeparation?: number; // ms
    attackAngle?: number; // degrees
    verticalBatAngle?: number; // degrees
    connectionAtImpact?: number; // percentage
    postureAngle?: number; // degrees
    earlyConnection?: number; // percentage
  };
}

export function KeyBiomechanics({ metrics }: KeyBiomechanicsProps) {
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
  }) => (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{label}</span>
        <InfoTooltip content={tooltip} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold">
          {value !== undefined ? `${value.toFixed(value < 10 ? 1 : 0)}${unit}` : 'N/A'}
        </span>
        <StatusIcon status={status} />
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Biomechanics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* LEFT COLUMN - Rotational Metrics */}
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              Rotational Metrics
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
              label="X-Factor / Separation"
              value={metrics.xFactor}
              unit="°"
              status={getStatus(metrics.xFactor, [45, 60], [35, 45])}
              tooltip="Maximum trunk rotation separation between pelvis and shoulders. Optimal: 45-60°. Creates elastic energy storage."
            />
            
            <MetricRow
              label="Hip-Shoulder Separation"
              value={metrics.hipShoulderSeparation}
              unit="ms"
              status={getStatus(metrics.hipShoulderSeparation, [40, 60], [25, 40])}
              tooltip="Time gap between peak hip and shoulder rotation. Optimal: 40-60ms. Indicates proper kinetic chain sequencing."
            />
          </div>

          {/* RIGHT COLUMN - Positional Metrics */}
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              Positional Metrics
            </h3>
            
            <MetricRow
              label="Attack Angle"
              value={metrics.attackAngle}
              unit="°"
              status={getStatus(metrics.attackAngle, [8, 15], [5, 8])}
              tooltip="Bat path angle at contact. Optimal: 8-15°. Matches typical pitch plane for solid contact and launch angle."
            />
            
            <MetricRow
              label="Vertical Bat Angle"
              value={metrics.verticalBatAngle}
              unit="°"
              status={getStatus(metrics.verticalBatAngle, [15, 25], [10, 15])}
              tooltip="Bat angle relative to vertical plane at impact. Indicates swing plane efficiency."
            />
            
            <MetricRow
              label="Connection at Impact"
              value={metrics.connectionAtImpact}
              unit="%"
              status={getStatus(metrics.connectionAtImpact, [80, 100], [60, 80])}
              tooltip="How connected the hands stay to the body through impact. Higher = more efficient power transfer."
            />
            
            <MetricRow
              label="Posture / Spine Angle"
              value={metrics.postureAngle}
              unit="°"
              status={getStatus(metrics.postureAngle, [35, 45], [25, 35])}
              tooltip="Torso angle at impact. Optimal: 35-45° forward tilt. Indicates proper posture and balance."
            />
            
            <MetricRow
              label="Early Connection"
              value={metrics.earlyConnection}
              unit="%"
              status={getStatus(metrics.earlyConnection, [70, 100], [50, 70])}
              tooltip="How well hands stay connected during early swing phase. Important for consistent barrel control."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
