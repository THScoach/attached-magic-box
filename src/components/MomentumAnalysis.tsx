import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Badge } from "@/components/ui/badge";

// Reboot correction factors to match MLB Hawkeye standards
const REBOOT_CORRECTION_FACTORS = {
  pelvis: 2.0,
  upperTorso: 1.4,
  arm: 2.2
};

// MLB Elite Ranges (for corrected values)
const MLB_ELITE_RANGES = {
  pelvis: { min: 600, max: 800, elite: 700 },
  upperTorso: { min: 900, max: 1200, elite: 1000 },
  arm: { min: 1500, max: 2000, elite: 1700 }
};

interface MomentumAnalysisProps {
  metrics: {
    height?: number | null; // inches
    weight?: number | null; // lbs
    peakCOMVelocity?: number | null; // m/s
    peakPelvisRotVel?: number | null; // deg/s (raw from Reboot)
    peakShoulderRotVel?: number | null; // deg/s (raw from Reboot, actually Upper Torso)
    peakArmRotVel?: number | null; // deg/s (raw from Reboot)
  };
}

function getMLBComparison(value: number, range: { min: number; max: number; elite: number }): { status: string; color: string } {
  if (value >= range.min && value <= range.max) {
    return { status: "Elite MLB Range", color: "default" };
  } else if (value >= range.min * 0.9) {
    return { status: "Above Average", color: "secondary" };
  } else if (value >= range.min * 0.8) {
    return { status: "Average", color: "outline" };
  } else {
    return { status: "Below Average", color: "destructive" };
  }
}

export function MomentumAnalysis({ metrics }: MomentumAnalysisProps) {
  // Check if we have COM data
  const hasCOMData = metrics.height !== undefined && metrics.height !== null && 
                     metrics.weight !== undefined && metrics.weight !== null && 
                     metrics.peakCOMVelocity !== undefined && metrics.peakCOMVelocity !== null;

  // Check if we have rotational velocity data
  const hasRotationalData = metrics.peakPelvisRotVel !== undefined && metrics.peakPelvisRotVel !== null &&
                            metrics.peakPelvisRotVel > 0;

  // Don't render if no data at all
  if (!hasCOMData && !hasRotationalData) {
    return null;
  }

  // Calculate mass and momentum (if COM data exists)
  let massKg = 0;
  let peakLinearMomentum = 0;
  if (hasCOMData) {
    massKg = metrics.weight * 0.453592;
    peakLinearMomentum = massKg * metrics.peakCOMVelocity;
  }

  // Calculate corrected rotational velocities (if data exists)
  const pelvisRaw = metrics.peakPelvisRotVel || 0;
  const upperTorsoRaw = metrics.peakShoulderRotVel || 0; // Shoulder = Upper Torso in Reboot
  const armRaw = metrics.peakArmRotVel || 0;

  const pelvisCorrected = Math.round(pelvisRaw * REBOOT_CORRECTION_FACTORS.pelvis);
  const upperTorsoCorrected = Math.round(upperTorsoRaw * REBOOT_CORRECTION_FACTORS.upperTorso);
  const armCorrected = Math.round(armRaw * REBOOT_CORRECTION_FACTORS.arm);

  const pelvisComparison = getMLBComparison(pelvisCorrected, MLB_ELITE_RANGES.pelvis);
  const upperTorsoComparison = getMLBComparison(upperTorsoCorrected, MLB_ELITE_RANGES.upperTorso);
  const armComparison = getMLBComparison(armCorrected, MLB_ELITE_RANGES.arm);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Momentum Analysis
          {hasRotationalData && (
            <span className="text-xs font-normal text-muted-foreground">
              Values corrected to match MLB Hawkeye standards
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Athlete Info */}
          {hasCOMData && (
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
          )}

          {/* Rotational Velocities (Corrected) */}
          {hasRotationalData && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Rotational Velocities
              </h4>
              
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Pelvis</span>
                  <InfoTooltip content={`Raw: ${pelvisRaw.toFixed(1)} deg/s → Corrected: ${pelvisCorrected} deg/s (2.0x factor). First mover in kinetic chain.`} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{pelvisCorrected} deg/s</span>
                  <Badge variant={pelvisComparison.color as any}>{pelvisComparison.status}</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Upper Torso</span>
                  <InfoTooltip content={`Raw: ${upperTorsoRaw.toFixed(1)} deg/s → Corrected: ${upperTorsoCorrected} deg/s (1.4x factor). Second in kinetic chain.`} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{upperTorsoCorrected} deg/s</span>
                  <Badge variant={upperTorsoComparison.color as any}>{upperTorsoComparison.status}</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Arm</span>
                  <InfoTooltip content={`Raw: ${armRaw.toFixed(1)} deg/s → Corrected: ${armCorrected} deg/s (2.2x factor). Final link before bat.`} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{armCorrected} deg/s</span>
                  <Badge variant={armComparison.color as any}>{armComparison.status}</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Linear Momentum */}
          {hasCOMData && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Linear Momentum
              </h4>
              
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}
