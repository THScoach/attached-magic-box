import { SwingAnalysis } from "@/types/swing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Scale, TrendingDown, Activity } from "lucide-react";

interface BalanceMetricsProps {
  analysis: SwingAnalysis;
}

export function BalanceMetrics({ analysis }: BalanceMetricsProps) {
  // Elite benchmarks from research
  const benchmarks = {
    comLateral: { elite: 4, warning: 6 },
    comForward: { elite: 14, warning: 10 },
    comVertical: { elite: 3, warning: 4 },
    frontFootWeight: { elite: 75, warning: 60 },
    frontFootGRF: { elite: 120, warning: 100 },
    comCopDistance: { elite: 4, warning: 6 },
    balanceRecovery: { elite: 0.4, warning: 0.6 }
  };

  const getStatusColor = (value: number, elite: number, warning: number, reverse = false) => {
    if (!value) return "text-muted-foreground";
    if (reverse) {
      // For metrics where lower is better
      return value <= elite ? "text-green-500" : value <= warning ? "text-yellow-500" : "text-red-500";
    }
    // For metrics where higher is better
    return value >= elite ? "text-green-500" : value >= warning ? "text-yellow-500" : "text-red-500";
  };

  // Only show if we have at least some of the new metrics
  const hasData = analysis.comLateralMovement || analysis.comForwardMovement || 
                  analysis.frontFootWeightPercent || analysis.comCopDistance;

  if (!hasData) return null;

  return (
    <div className="space-y-4">
      {/* COM Movement Detail */}
      {(analysis.comLateralMovement || analysis.comForwardMovement || analysis.comVerticalMovement) && (
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">COM Movement Breakdown</CardTitle>
              </div>
              <InfoTooltip content="Elite hitters move 10-16 inches forward, less than 4 inches sideways, and maintain 2-3 inches vertical stability. More movement = less efficiency." />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-3 gap-4">
              {analysis.comForwardMovement !== undefined && (
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground mb-1">Forward</p>
                  <p className={`text-2xl font-bold ${getStatusColor(
                    analysis.comForwardMovement, 
                    benchmarks.comForward.elite, 
                    benchmarks.comForward.warning
                  )}`}>
                    {analysis.comForwardMovement.toFixed(1)}"
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Elite: 10-16"</p>
                </div>
              )}
              {analysis.comLateralMovement !== undefined && (
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground mb-1">Lateral</p>
                  <p className={`text-2xl font-bold ${getStatusColor(
                    analysis.comLateralMovement, 
                    benchmarks.comLateral.elite, 
                    benchmarks.comLateral.warning,
                    true
                  )}`}>
                    {analysis.comLateralMovement.toFixed(1)}"
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Elite: 2-4"</p>
                </div>
              )}
              {analysis.comVerticalMovement !== undefined && (
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground mb-1">Vertical</p>
                  <p className={`text-2xl font-bold ${getStatusColor(
                    analysis.comVerticalMovement, 
                    benchmarks.comVertical.elite, 
                    benchmarks.comVertical.warning,
                    true
                  )}`}>
                    {analysis.comVerticalMovement.toFixed(1)}"
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Elite: 2-3"</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weight Transfer & Balance */}
      {(analysis.frontFootWeightPercent || analysis.frontFootGRF || analysis.comCopDistance) && (
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Weight Transfer & Balance</CardTitle>
              </div>
              <InfoTooltip content="Elite MLB hitters transfer 70-80% of weight to front foot and generate 123% of body weight force. Better transfer = more power generation." />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {analysis.frontFootWeightPercent !== undefined && (
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground mb-1">Front Foot Weight</p>
                  <p className={`text-2xl font-bold ${getStatusColor(
                    analysis.frontFootWeightPercent, 
                    benchmarks.frontFootWeight.elite, 
                    benchmarks.frontFootWeight.warning
                  )}`}>
                    {analysis.frontFootWeightPercent.toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Elite: 70-80%</p>
                </div>
              )}
              {analysis.frontFootGRF !== undefined && (
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground mb-1">Ground Force</p>
                  <p className={`text-2xl font-bold ${getStatusColor(
                    analysis.frontFootGRF, 
                    benchmarks.frontFootGRF.elite, 
                    benchmarks.frontFootGRF.warning
                  )}`}>
                    {analysis.frontFootGRF.toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Elite: 120%+ BW</p>
                </div>
              )}
              {analysis.comCopDistance !== undefined && (
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground mb-1">Balance Score</p>
                  <p className={`text-2xl font-bold ${getStatusColor(
                    analysis.comCopDistance, 
                    benchmarks.comCopDistance.elite, 
                    benchmarks.comCopDistance.warning,
                    true
                  )}`}>
                    {analysis.comCopDistance.toFixed(1)}"
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Elite: 2-4"</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* COM Velocity & Timing */}
      {(analysis.comPeakTiming || analysis.comAccelerationPeak || analysis.balanceRecoveryTime) && (
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="p-0 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Power Generation Dynamics</CardTitle>
              </div>
              <InfoTooltip content="Elite timing: COM peaks 100-120ms before contact, acceleration peaks at 5-8 m/s² during front foot plant. Better timing = explosive kinetic chain." />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-3">
              {analysis.comPeakTiming !== undefined && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <span className="text-sm">COM Peak Velocity Timing</span>
                  <span className="font-bold">{analysis.comPeakTiming.toFixed(0)}ms before contact</span>
                </div>
              )}
              {analysis.comAccelerationPeak !== undefined && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <span className="text-sm">Peak COM Acceleration</span>
                  <span className="font-bold">{analysis.comAccelerationPeak.toFixed(1)} m/s²</span>
                </div>
              )}
              {analysis.balanceRecoveryTime !== undefined && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <span className="text-sm">Balance Recovery</span>
                  <span className={`font-bold ${getStatusColor(
                    analysis.balanceRecoveryTime, 
                    benchmarks.balanceRecovery.elite, 
                    benchmarks.balanceRecovery.warning,
                    true
                  )}`}>
                    {analysis.balanceRecoveryTime.toFixed(2)}s
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
