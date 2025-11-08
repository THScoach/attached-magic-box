import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { TrendingUp, Brain, Zap } from "lucide-react";

interface CorrelationDataPoint {
  date: string;
  brainReactionTime: number;
  bodyTempoRatio: number;
  swingSuccess: number;
}

interface BrainTempoCorrelationProps {
  data: CorrelationDataPoint[];
}

export function BrainTempoCorrelation({ data }: BrainTempoCorrelationProps) {
  // Calculate correlation coefficient
  const calculateCorrelation = () => {
    if (data.length < 2) return 0;
    
    const n = data.length;
    const sumBrain = data.reduce((sum, d) => sum + d.brainReactionTime, 0);
    const sumTempo = data.reduce((sum, d) => sum + d.bodyTempoRatio, 0);
    const sumBrainTempo = data.reduce((sum, d) => sum + (d.brainReactionTime * d.bodyTempoRatio), 0);
    const sumBrainSq = data.reduce((sum, d) => sum + (d.brainReactionTime * d.brainReactionTime), 0);
    const sumTempoSq = data.reduce((sum, d) => sum + (d.bodyTempoRatio * d.bodyTempoRatio), 0);
    
    const numerator = (n * sumBrainTempo) - (sumBrain * sumTempo);
    const denominator = Math.sqrt(
      ((n * sumBrainSq) - (sumBrain * sumBrain)) * 
      ((n * sumTempoSq) - (sumTempo * sumTempo))
    );
    
    return denominator === 0 ? 0 : numerator / denominator;
  };

  const correlation = calculateCorrelation();
  const correlationStrength = Math.abs(correlation) > 0.7 ? "Strong" : 
                             Math.abs(correlation) > 0.4 ? "Moderate" : "Weak";

  // Transform data for scatter plot
  const scatterData = data.map(d => ({
    x: d.brainReactionTime,
    y: d.bodyTempoRatio,
    success: d.swingSuccess
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <Zap className="h-4 w-4" />
          Brain-Body Tempo Correlation
          <InfoTooltip content="Shows the relationship between cognitive reaction time and physical tempo ratio. Elite hitters sync mental and physical timing." />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Correlation Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Correlation</p>
            <p className="text-2xl font-bold">{correlation.toFixed(3)}</p>
            <p className="text-xs text-muted-foreground">{correlationStrength}</p>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Avg Reaction</p>
            <p className="text-2xl font-bold">
              {(data.reduce((sum, d) => sum + d.brainReactionTime, 0) / data.length).toFixed(0)}ms
            </p>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Avg Tempo</p>
            <p className="text-2xl font-bold">
              {(data.reduce((sum, d) => sum + d.bodyTempoRatio, 0) / data.length).toFixed(2)}:1
            </p>
          </div>
        </div>

        {/* Scatter Plot */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Correlation Scatter Plot
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Reaction Time" 
                unit="ms"
                label={{ value: 'Reaction Time (ms)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Tempo Ratio"
                label={{ value: 'Tempo Ratio', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold">Data Point</p>
                        <p className="text-sm">Reaction: {data.x}ms</p>
                        <p className="text-sm">Tempo: {data.y.toFixed(2)}:1</p>
                        <p className="text-sm">Success: {data.success}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter 
                data={scatterData} 
                fill="hsl(var(--primary))" 
                fillOpacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Time Series */}
        <div>
          <h4 className="font-semibold mb-3">Trends Over Time</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="brainReactionTime" 
                stroke="hsl(var(--primary))" 
                name="Reaction Time (ms)"
                strokeWidth={2}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="bodyTempoRatio" 
                stroke="hsl(var(--accent))" 
                name="Tempo Ratio"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Insight */}
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
          <h4 className="font-semibold mb-2">🎯 Key Insight</h4>
          <p className="text-sm">
            {Math.abs(correlation) > 0.7 ? (
              <>Your brain reaction time and body tempo show <strong>strong synchronization</strong>. 
              This indicates excellent mind-body connection – a hallmark of elite hitters. 
              Faster cognitive processing correlates with more efficient physical timing.</>
            ) : Math.abs(correlation) > 0.4 ? (
              <>There's a <strong>moderate relationship</strong> between your cognitive reaction time and physical tempo. 
              Continue working on drills that combine visual recognition with timed movements to strengthen this connection.</>
            ) : (
              <>The connection between your cognitive reaction time and physical tempo could be stronger. 
              Focus on drills that integrate visual cues with timed physical responses to develop better synchronization.</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
