import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Badge } from "@/components/ui/badge";
import { SwingAnalysis } from "@/types/swing";
import { Clock, Zap, TrendingUp } from "lucide-react";

interface COMPhaseMetricsProps {
  analysis: SwingAnalysis;
  duration: number;
}

export function COMPhaseMetrics({ analysis, duration }: COMPhaseMetricsProps) {
  // Calculate phase durations in milliseconds
  const loadDuration = analysis.loadStartTiming && analysis.fireStartTiming
    ? analysis.loadStartTiming - analysis.fireStartTiming
    : 0;
    
  const fireDuration = analysis.fireStartTiming
    ? analysis.fireStartTiming
    : 0;
  
  const tempoRatio = loadDuration && fireDuration
    ? (loadDuration / fireDuration).toFixed(2)
    : "0";
  
  // Elite benchmarks from research
  const ELITE_LOAD_DURATION = 150; // ms (typical range 100-200ms)
  const ELITE_FIRE_DURATION = 50; // ms (typical range 40-60ms)
  const ELITE_TEMPO_RATIO = 3.0; // 3:1 ratio
  
  // Calculate performance percentages
  const loadPerformance = loadDuration 
    ? Math.min(100, Math.round((loadDuration / ELITE_LOAD_DURATION) * 100))
    : 0;
    
  const firePerformance = fireDuration
    ? Math.min(100, Math.round((ELITE_FIRE_DURATION / fireDuration) * 100))
    : 0;
  
  const ratioPerformance = parseFloat(tempoRatio)
    ? Math.min(100, Math.round((parseFloat(tempoRatio) / ELITE_TEMPO_RATIO) * 100))
    : 0;
  
  const getPerformanceColor = (percent: number) => {
    if (percent >= 90) return "text-green-600";
    if (percent >= 70) return "text-yellow-600";
    return "text-red-600";
  };
  
  const getPerformanceVariant = (percent: number): "default" | "secondary" | "outline" => {
    if (percent >= 90) return "default";
    if (percent >= 70) return "secondary";
    return "outline";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Phase Timing Breakdown</CardTitle>
          <InfoTooltip content="Elite hitters maintain a 3:1 ratio between Load and Fire phases. Load phase: 100-200ms (energy storage). Fire phase: 40-60ms (explosive power generation). Optimal timing creates maximum bat speed." />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Load Phase */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="font-semibold">Load Phase</span>
            </div>
            <Badge variant={getPerformanceVariant(loadPerformance)}>
              {loadPerformance}% Elite
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${getPerformanceColor(loadPerformance)}`}>
              {loadDuration}ms
            </span>
            <span className="text-sm text-muted-foreground">
              / {ELITE_LOAD_DURATION}ms elite
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${Math.min(100, (loadDuration / ELITE_LOAD_DURATION) * 100)}%` }}
            />
          </div>
        </div>

        {/* Fire Phase */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="font-semibold">Fire Phase</span>
            </div>
            <Badge variant={getPerformanceVariant(firePerformance)}>
              {firePerformance}% Elite
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${getPerformanceColor(firePerformance)}`}>
              {fireDuration}ms
            </span>
            <span className="text-sm text-muted-foreground">
              / {ELITE_FIRE_DURATION}ms elite
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 transition-all"
              style={{ width: `${Math.min(100, (ELITE_FIRE_DURATION / fireDuration) * 100)}%` }}
            />
          </div>
        </div>

        {/* Tempo Ratio */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <span className="font-semibold">Tempo Ratio</span>
            </div>
            <Badge variant={getPerformanceVariant(ratioPerformance)}>
              {ratioPerformance}% Elite
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${getPerformanceColor(ratioPerformance)}`}>
              {tempoRatio}:1
            </span>
            <span className="text-sm text-muted-foreground">
              / {ELITE_TEMPO_RATIO}:1 elite
            </span>
          </div>
        </div>

        {/* Phase Timing Comparison */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t text-xs">
          <div>
            <div className="text-muted-foreground mb-1">Energy Storage</div>
            <div className="font-semibold">
              {Math.round((loadDuration / (loadDuration + fireDuration)) * 100)}% of swing
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Power Generation</div>
            <div className="font-semibold">
              {Math.round((fireDuration / (loadDuration + fireDuration)) * 100)}% of swing
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
