import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

// Reboot correction factors
const REBOOT_CORRECTION_FACTORS = {
  pelvis: 2.0,
  upperTorso: 1.4,
  arm: 2.2
};

interface KeyBiomechanicsProps {
  metrics: {
    peakPelvisRotVel?: number | null; // °/s (raw from Reboot)
    peakShoulderRotVel?: number | null; // °/s (raw from Reboot, Upper Torso)
    peakArmRotVel?: number | null; // °/s (raw from Reboot)
    peakBatSpeed?: number | null; // mph
    attackAngle?: number | null; // degrees
    xFactorMaxPelvis?: number | null; // X-Factor at Max Pelvis turn
  };
}

export function KeyBiomechanics({ metrics }: KeyBiomechanicsProps) {
  // Apply correction factors
  const pelvisRaw = metrics.peakPelvisRotVel || 0;
  const upperTorsoRaw = metrics.peakShoulderRotVel || 0; // Shoulder = Upper Torso in Reboot
  const armRaw = metrics.peakArmRotVel || 0;

  const pelvisCorrected = pelvisRaw > 0 ? Math.round(pelvisRaw * REBOOT_CORRECTION_FACTORS.pelvis) : 0;
  const upperTorsoCorrected = upperTorsoRaw > 0 ? Math.round(upperTorsoRaw * REBOOT_CORRECTION_FACTORS.upperTorso) : 0;
  const armCorrected = armRaw > 0 ? Math.round(armRaw * REBOOT_CORRECTION_FACTORS.arm) : 0;

  // Only show component if we have at least one metric
  const hasData = pelvisCorrected > 0 || upperTorsoCorrected > 0 || armCorrected > 0 || 
                  (metrics.xFactorMaxPelvis !== undefined && metrics.xFactorMaxPelvis !== null) ||
                  (metrics.peakBatSpeed !== undefined && metrics.peakBatSpeed !== null && metrics.peakBatSpeed > 0) || 
                  (metrics.attackAngle !== undefined && metrics.attackAngle !== null);

  if (!hasData) {
    return null; // Don't render if no data
  }

  const getStatus = (value: number | undefined | null, optimal: [number, number], developing: [number, number]) => {
    if (value === undefined || value === null || value === 0) return "N/A";
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
    tooltip,
    displayValue
  }: { 
    label: string; 
    value: number | undefined | null; 
    unit: string; 
    status: string;
    tooltip: string;
    displayValue?: string;
  }) => {
    if (value === undefined || value === null || value === 0) return null; // Don't render row if no data
    
    return (
      <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          <InfoTooltip content={tooltip} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">
            {displayValue || `${value.toFixed(value < 10 ? 1 : 0)}${unit}`}
          </span>
          <StatusIcon status={status} />
        </div>
      </div>
    );
  };

  const hasRotationalData = pelvisCorrected > 0 || upperTorsoCorrected > 0 || armCorrected > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Key Biomechanics
          {hasRotationalData && (
            <span className="text-xs font-normal text-muted-foreground">
              Corrected to MLB standards
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Extracted from PDF
          </h3>
          
          <MetricRow
            label="Pelvis"
            value={pelvisCorrected}
            unit=" deg/s"
            status={getStatus(pelvisCorrected, [600, 800], [500, 900])}
            tooltip={`Raw: ${pelvisRaw.toFixed(1)} → Corrected: ${pelvisCorrected} deg/s (2.0x). Elite MLB: 600-800 deg/s.`}
          />
          
          <MetricRow
            label="Upper Torso"
            value={upperTorsoCorrected}
            unit=" deg/s"
            status={getStatus(upperTorsoCorrected, [900, 1200], [800, 1300])}
            tooltip={`Raw: ${upperTorsoRaw.toFixed(1)} → Corrected: ${upperTorsoCorrected} deg/s (1.4x). Elite MLB: 900-1200 deg/s.`}
          />

          <MetricRow
            label="Arm"
            value={armCorrected}
            unit=" deg/s"
            status={getStatus(armCorrected, [1500, 2000], [1300, 2200])}
            tooltip={`Raw: ${armRaw.toFixed(1)} → Corrected: ${armCorrected} deg/s (2.2x). Elite MLB: 1500-2000 deg/s.`}
          />

          <MetricRow
            label="X-Factor"
            value={metrics.xFactorMaxPelvis ? Math.abs(metrics.xFactorMaxPelvis) : null}
            unit="°"
            status={getStatus(
              metrics.xFactorMaxPelvis ? Math.abs(metrics.xFactorMaxPelvis) : null,
              [15, 35],
              [10, 40]
            )}
            tooltip="Hip-shoulder separation at maximum pelvis turn. Creates elastic energy. Elite: 15-35 degrees."
            displayValue={metrics.xFactorMaxPelvis !== undefined && metrics.xFactorMaxPelvis !== null ? `${metrics.xFactorMaxPelvis.toFixed(1)}°` : undefined}
          />

          <MetricRow
            label="Bat Speed"
            value={metrics.peakBatSpeed}
            unit=" mph"
            status={getStatus(metrics.peakBatSpeed, [70, 80], [65, 85])}
            tooltip="Maximum bat velocity. Elite MLB: 70-80 mph. Result of efficient kinetic chain. If missing from PDF, shows N/A."
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
