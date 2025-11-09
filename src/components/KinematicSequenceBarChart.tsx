import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList } from "recharts";
import { CheckCircle, AlertCircle } from "lucide-react";

interface KinematicSequenceBarChartProps {
  metrics: {
    negativeMoveTime?: number; // seconds
    maxPelvisTurnTime: number; // seconds
    maxShoulderTurnTime: number; // seconds
    maxXFactorTime?: number; // seconds
    peakPelvisRotVel?: number; // °/s
    peakShoulderRotVel?: number; // °/s
    peakArmRotVel?: number; // °/s
  };
}

export function KinematicSequenceBarChart({ metrics }: KinematicSequenceBarChartProps) {
  // Convert to milliseconds before impact (PDF data is in seconds before impact)
  const negativeMoveTiming = metrics.negativeMoveTime ? metrics.negativeMoveTime * 1000 : null;
  const pelvisTiming = metrics.maxPelvisTurnTime * 1000;
  const shoulderTiming = metrics.maxShoulderTurnTime * 1000;
  const maxXFactorTiming = metrics.maxXFactorTime ? metrics.maxXFactorTime * 1000 : null;
  
  // Bat is always at impact (0ms)
  const batTiming = 0;

  // Build sequence data with available metrics
  const sequenceData = [
    ...(negativeMoveTiming ? [{ segment: "Negative Move", timing: negativeMoveTiming, order: 1, isActual: true }] : []),
    { segment: "Pelvis", timing: pelvisTiming, order: 2, isActual: true, velocity: metrics.peakPelvisRotVel },
    { segment: "Shoulders", timing: shoulderTiming, order: 3, isActual: true, velocity: metrics.peakShoulderRotVel },
    ...(metrics.peakArmRotVel ? [{ segment: "Arm", timing: shoulderTiming / 2, order: 4, isActual: false, velocity: metrics.peakArmRotVel }] : []),
    { segment: "Bat", timing: batTiming, order: 5, isActual: true },
  ];

  // Check if sequence is proper (descending order for actual data points)
  const isProperSequence = 
    (!negativeMoveTiming || negativeMoveTiming > pelvisTiming) &&
    pelvisTiming > shoulderTiming;

  // Calculate gaps between consecutive segments
  const pelvisShoulderGap = pelvisTiming - shoulderTiming;

  // Color based on whether data is actual or estimated, and sequence correctness
  const getBarColor = (entry: any) => {
    if (!entry.isActual) return "#94a3b8"; // Gray for estimated data
    if (!isProperSequence) return "#ef4444"; // Red if sequence is wrong
    return "#22c55e"; // Green if proper and actual
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Kinematic Sequence</CardTitle>
            <InfoTooltip content="Peak timing shows when each body segment reached maximum velocity. Proper sequence flows from Lead Leg → Pelvis → Shoulders → Hands → Bat (descending order). This proximal-to-distal pattern maximizes power transfer." />
          </div>
          <div className="flex items-center gap-2">
            {isProperSequence ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-green-600">Proximal-to-Distal</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-semibold text-red-600">Sequence Issues Detected</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground mb-2">
            <strong>Peak Timing & Deceleration Pattern</strong> (Time before impact)
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={sequenceData} 
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                type="number" 
                domain={[0, 500]}
                label={{ value: 'Time before impact (ms)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                type="category" 
                dataKey="segment" 
                width={90}
              />
              <Bar dataKey="timing" fill="#22c55e">
                {sequenceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                ))}
                <LabelList 
                  dataKey="timing" 
                  position="right" 
                  formatter={(value: number, entry: any) => {
                    const label = `${value.toFixed(0)}ms`;
                    return entry.isActual ? label : `${label}*`;
                  }}
                  style={{ fill: 'hsl(var(--foreground))', fontSize: '12px', fontWeight: 'bold' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Timing Gaps and Velocities */}
          <div className="space-y-3 pt-4 border-t">
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Pelvis → Shoulder Gap</div>
              <div className={`text-xl font-bold ${pelvisShoulderGap > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {pelvisShoulderGap > 0 ? '+' : ''}{pelvisShoulderGap.toFixed(0)}ms
              </div>
            </div>
            
            {/* Velocity data if available */}
            {(metrics.peakPelvisRotVel || metrics.peakShoulderRotVel || metrics.peakArmRotVel) && (
              <div className="grid grid-cols-3 gap-3">
                {metrics.peakPelvisRotVel && (
                  <div className="bg-muted/50 p-2 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Pelvis</div>
                    <div className="text-sm font-bold">{metrics.peakPelvisRotVel.toFixed(0)}°/s</div>
                  </div>
                )}
                {metrics.peakShoulderRotVel && (
                  <div className="bg-muted/50 p-2 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Shoulder</div>
                    <div className="text-sm font-bold">{metrics.peakShoulderRotVel.toFixed(0)}°/s</div>
                  </div>
                )}
                {metrics.peakArmRotVel && (
                  <div className="bg-muted/50 p-2 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Arm</div>
                    <div className="text-sm font-bold">{metrics.peakArmRotVel.toFixed(0)}°/s</div>
                  </div>
                )}
              </div>
            )}
            
            {/* Legend for estimated data */}
            {sequenceData.some(d => !d.isActual) && (
              <div className="text-xs text-muted-foreground italic">
                * = Estimated value (not from PDF)
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
