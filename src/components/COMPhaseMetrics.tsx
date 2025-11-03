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
  // Calculate phase durations in milliseconds - handle negative values
  const loadDuration = analysis.loadStartTiming && analysis.fireStartTiming
    ? Math.abs(analysis.loadStartTiming - analysis.fireStartTiming)
    : 0;
    
  const fireDuration = analysis.fireStartTiming
    ? Math.abs(analysis.fireStartTiming)
    : 0;
  
  const tempoRatio = loadDuration && fireDuration
    ? (loadDuration / fireDuration).toFixed(2)
    : "0";
  
  // Elite benchmarks from research
  const ELITE_LOAD_DURATION = 650; // ms (typical elite range 600-850ms)
  const ELITE_FIRE_DURATION = 330; // ms (typical elite range 280-380ms)
  const ELITE_TEMPO_RATIO = 2.5; // 2.5:1 ratio (Freeman: 2.50:1)
  
  // Calculate performance percentages - closer to elite = better
  const loadPerformance = loadDuration 
    ? Math.min(100, Math.round((1 - Math.abs(loadDuration - ELITE_LOAD_DURATION) / ELITE_LOAD_DURATION) * 100))
    : 0;
    
  const firePerformance = fireDuration
    ? Math.min(100, Math.round((1 - Math.abs(fireDuration - ELITE_FIRE_DURATION) / ELITE_FIRE_DURATION) * 100))
    : 0;
  
  const ratioPerformance = parseFloat(tempoRatio)
    ? Math.min(100, Math.round((1 - Math.abs(parseFloat(tempoRatio) - ELITE_TEMPO_RATIO) / ELITE_TEMPO_RATIO) * 100))
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
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Phase Timing Breakdown</CardTitle>
          <InfoTooltip content="Elite hitters maintain a ~2.5:1 ratio between Load and Fire phases. Load: 600-850ms (energy storage). Fire: 280-380ms (explosive power). Optimal timing = maximum bat speed." />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Load Phase */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Load Phase</span>
            </div>
            <Badge variant={getPerformanceVariant(loadPerformance)} className="text-xs">
              {loadPerformance >= 90 ? '✓' : loadPerformance >= 70 ? '~' : '×'} {loadPerformance}% Elite
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${getPerformanceColor(loadPerformance)}`}>
              {loadDuration > 0 ? '-' : ''}{Math.abs(loadDuration)}ms
            </span>
            <span className="text-xs text-muted-foreground">
              / {ELITE_LOAD_DURATION}ms elite
            </span>
          </div>
          <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${loadPerformance}%` }}
            />
          </div>
        </div>

        {/* Fire Phase */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Fire Phase</span>
            </div>
            <Badge variant={getPerformanceVariant(firePerformance)} className="text-xs">
              {firePerformance >= 90 ? '✓' : firePerformance >= 70 ? '~' : '×'} {firePerformance}% Elite
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${getPerformanceColor(firePerformance)}`}>
              {fireDuration > 0 ? '-' : ''}{Math.abs(fireDuration)}ms
            </span>
            <span className="text-xs text-muted-foreground">
              / {ELITE_FIRE_DURATION}ms elite
            </span>
          </div>
          <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 transition-all"
              style={{ width: `${firePerformance}%` }}
            />
          </div>
        </div>

        {/* Tempo Ratio */}
        <div className="space-y-3 pt-3 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Tempo Ratio</span>
            </div>
            <Badge variant={getPerformanceVariant(ratioPerformance)} className="text-xs">
              {ratioPerformance >= 90 ? '✓' : ratioPerformance >= 70 ? '~' : '×'} {ratioPerformance}% Elite
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-bold ${getPerformanceColor(ratioPerformance)}`}>
              {tempoRatio}:1
            </span>
            <span className="text-xs text-muted-foreground">
              / {ELITE_TEMPO_RATIO}:1 elite
            </span>
          </div>
        </div>

        {/* Phase Distribution */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Energy Storage</div>
            <div className="text-lg font-bold">
              {Math.round((loadDuration / (loadDuration + fireDuration)) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">of swing</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Power Generation</div>
            <div className="text-lg font-bold">
              {Math.round((fireDuration / (loadDuration + fireDuration)) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">of swing</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
