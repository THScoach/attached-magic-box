import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface KinematicSequenceGraphProps {
  metrics: {
    negativeMoveTime: number;
    maxPelvisTurnTime: number;
    maxShoulderTurnTime: number;
    maxXFactorTime: number;
  };
}

export function KinematicSequenceGraph({ metrics }: KinematicSequenceGraphProps) {
  // Convert timing data to sequence visualization
  const sequenceData = [
    {
      time: 0,
      pelvis: 0,
      shoulders: 0,
      hands: 0,
      label: "Start"
    },
    {
      time: metrics.maxXFactorTime * 1000,
      pelvis: 50,
      shoulders: 20,
      hands: 0,
      label: "X-Factor"
    },
    {
      time: metrics.maxPelvisTurnTime * 1000,
      pelvis: 100,
      shoulders: 70,
      hands: 40,
      label: "Max Pelvis"
    },
    {
      time: metrics.maxShoulderTurnTime * 1000,
      pelvis: 95,
      shoulders: 100,
      hands: 80,
      label: "Max Shoulder"
    },
    {
      time: metrics.negativeMoveTime * 1000,
      pelvis: 85,
      shoulders: 90,
      hands: 100,
      label: "Contact"
    }
  ];

  // Calculate sequence efficiency
  const pelvisShoulderGap = (metrics.maxPelvisTurnTime - metrics.maxShoulderTurnTime) * 1000;
  const isProximalToDistal = pelvisShoulderGap > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Kinematic Sequence</CardTitle>
          <InfoTooltip content="The kinematic sequence shows the timing and order of body segment rotations from pelvis → shoulders → hands. Optimal sequences show each segment reaching peak velocity before the next (proximal-to-distal pattern)." />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Sequence Status */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">Sequence Pattern:</span>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${isProximalToDistal ? 'text-green-600' : 'text-orange-600'}`}>
                {isProximalToDistal ? '✓ Proximal-to-Distal' : '⚠ Distal-to-Proximal'}
              </span>
            </div>
          </div>

          {/* Graph */}
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sequenceData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey="time" 
                label={{ value: 'Time (ms)', position: 'insideBottom', offset: -5 }}
                domain={[0, 'dataMax']}
              />
              <YAxis 
                label={{ value: 'Peak Velocity (%)', angle: -90, position: 'insideLeft' }}
                domain={[0, 100]}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold mb-1">{payload[0].payload.label}</p>
                        <p className="text-xs text-muted-foreground mb-2">
                          {payload[0].payload.time.toFixed(0)}ms
                        </p>
                        {payload.map((entry: any) => (
                          <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {entry.value}%
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="pelvis" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Pelvis"
                dot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="shoulders" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Shoulders"
                dot={{ r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="hands" 
                stroke="#f59e0b" 
                strokeWidth={3}
                name="Hands/Bat"
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Timing Gaps */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t">
            <div className="text-sm">
              <span className="text-muted-foreground">Pelvis → Shoulder Gap:</span>
              <span className={`ml-2 font-bold ${pelvisShoulderGap > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {pelvisShoulderGap > 0 ? '+' : ''}{pelvisShoulderGap.toFixed(0)}ms
              </span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Total Swing Time:</span>
              <span className="ml-2 font-bold">
                {(metrics.negativeMoveTime * 1000).toFixed(0)}ms
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}