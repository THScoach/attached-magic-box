import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, LabelList } from "recharts";
import { CheckCircle, AlertCircle } from "lucide-react";

interface KinematicSequenceBarChartProps {
  metrics: {
    maxPelvisTurnTime: number;
    maxShoulderTurnTime: number;
  };
}

export function KinematicSequenceBarChart({ metrics }: KinematicSequenceBarChartProps) {
  // Convert to milliseconds before impact
  const leadLegTiming = 480; // Estimated ~480ms before impact
  const pelvisTiming = metrics.maxPelvisTurnTime * 1000;
  const shoulderTiming = metrics.maxShoulderTurnTime * 1000;
  const handsTiming = 135; // Estimated ~135ms before impact
  const batTiming = 0; // Impact

  const sequenceData = [
    { segment: "Lead Leg", timing: leadLegTiming, order: 1 },
    { segment: "Pelvis", timing: pelvisTiming, order: 2 },
    { segment: "Shoulders", timing: shoulderTiming, order: 3 },
    { segment: "Hands", timing: handsTiming, order: 4 },
    { segment: "Bat", timing: batTiming, order: 5 },
  ];

  // Check if sequence is proper (descending order)
  const isProperSequence = 
    leadLegTiming > pelvisTiming && 
    pelvisTiming > shoulderTiming && 
    shoulderTiming > handsTiming;

  // Calculate gaps
  const pelvisShoulderGap = pelvisTiming - shoulderTiming;
  const shoulderHandsGap = shoulderTiming - handsTiming;

  // Color based on sequence correctness
  const getBarColor = (index: number) => {
    if (!isProperSequence) return "#ef4444"; // Red if sequence is wrong
    return "#22c55e"; // Green if proper
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
                  <Cell key={`cell-${index}`} fill={getBarColor(index)} />
                ))}
                <LabelList 
                  dataKey="timing" 
                  position="right" 
                  formatter={(value: number) => `${value.toFixed(0)}ms`}
                  style={{ fill: 'hsl(var(--foreground))', fontSize: '12px', fontWeight: 'bold' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Timing Gaps */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Pelvis → Shoulder Gap</div>
              <div className={`text-xl font-bold ${pelvisShoulderGap > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {pelvisShoulderGap > 0 ? '+' : ''}{pelvisShoulderGap.toFixed(0)}ms
              </div>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Shoulder → Hands Gap</div>
              <div className={`text-xl font-bold ${shoulderHandsGap > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {shoulderHandsGap > 0 ? '+' : ''}{shoulderHandsGap.toFixed(0)}ms
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
