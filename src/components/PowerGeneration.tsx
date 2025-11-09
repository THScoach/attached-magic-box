import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Progress } from "@/components/ui/progress";
import { Zap, CheckCircle, AlertCircle, XCircle, Lightbulb, TrendingUp } from "lucide-react";
import { ResponsiveContainer, Sankey, Tooltip } from "recharts";

interface PowerGenerationProps {
  metrics: {
    rotationalPower?: number; // Watts
    linearPower?: number; // Watts
    totalPower?: number; // Watts
    energyTransferEfficiency?: number; // percentage
    momentumAlignmentAngle?: number; // degrees from optimal
    kinematicSequenceProper?: boolean;
    connectionAtImpact?: number; // percentage
  };
}

export function PowerGeneration({ metrics }: PowerGenerationProps) {
  // Calculate effective power
  const effectivePower = metrics.totalPower && metrics.energyTransferEfficiency 
    ? metrics.totalPower * (metrics.energyTransferEfficiency / 100)
    : undefined;

  // Calculate momentum alignment percentage
  const momentumAlignmentPercent = metrics.momentumAlignmentAngle !== undefined
    ? Math.max(0, 100 - (metrics.momentumAlignmentAngle / 30) * 100)
    : undefined;

  // Calculate kinematic sequence percentage
  const kinematicSequencePercent = metrics.kinematicSequenceProper !== undefined
    ? (metrics.kinematicSequenceProper ? 100 : 50)
    : undefined;

  // Calculate Swing Efficiency Score
  const swingEfficiencyScore = (() => {
    const scores = [
      metrics.energyTransferEfficiency,
      momentumAlignmentPercent,
      kinematicSequencePercent,
      metrics.connectionAtImpact,
    ].filter((s): s is number => s !== undefined);
    
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : undefined;
  })();

  const getStatus = (value: number | undefined, thresholds: { elite: number; good: number }) => {
    if (value === undefined) return "unknown";
    if (value >= thresholds.elite) return "elite";
    if (value >= thresholds.good) return "good";
    return "developing";
  };

  const totalPowerStatus = getStatus(metrics.totalPower, { elite: 4000, good: 3000 });
  const efficiencyStatus = getStatus(metrics.energyTransferEfficiency, { elite: 75, good: 60 });
  const effectivePowerStatus = getStatus(effectivePower, { elite: 3200, good: 2100 });
  const swingEfficiencyStatus = getStatus(swingEfficiencyScore, { elite: 80, good: 65 });

  // Contextual coaching message
  const getCoachingMessage = () => {
    if (!metrics.totalPower || !metrics.energyTransferEfficiency) return null;
    
    if (metrics.totalPower > 4000 && metrics.energyTransferEfficiency < 70) {
      return "Focus on efficiency before generating more power - you're losing energy in the transfer!";
    }
    if (metrics.totalPower < 3500 && metrics.energyTransferEfficiency > 80) {
      return "Great mechanics! Now add strength training to increase power output.";
    }
    if (metrics.totalPower >= 4000 && metrics.energyTransferEfficiency >= 75) {
      return "Elite profile - maintain this efficiency while continuing strength work!";
    }
    return "Balance power development with efficiency improvements.";
  };

  // Power flow data for Sankey diagram
  const powerFlowData = (() => {
    if (!metrics.totalPower || !metrics.energyTransferEfficiency) return null;
    
    const totalPower = metrics.totalPower;
    const efficiency = metrics.energyTransferEfficiency / 100;
    const effectivePowerValue = totalPower * efficiency;
    const energyLoss = totalPower - effectivePowerValue;
    const powerToBall = effectivePowerValue * 0.85; // Assume 85% of effective power transfers to ball
    const remainingLoss = effectivePowerValue - powerToBall;

    return {
      nodes: [
        { name: "Total Power Generated" },
        { name: "Energy Loss (Inefficiency)" },
        { name: "Effective Power to Bat" },
        { name: "Power to Ball" },
        { name: "Final Loss" },
      ],
      links: [
        { source: 0, target: 1, value: energyLoss },
        { source: 0, target: 2, value: effectivePowerValue },
        { source: 2, target: 3, value: powerToBall },
        { source: 2, target: 4, value: remainingLoss },
      ],
    };
  })();

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "elite") return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (status === "good") return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    if (status === "unknown") return <div className="h-5 w-5" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getStatusLabel = (status: string) => {
    if (status === "elite") return "Elite";
    if (status === "good") return "Good";
    if (status === "developing") return "Developing";
    return "N/A";
  };

  const getEliteBenchmark = (metricType: 'total' | 'efficiency') => {
    if (metricType === 'total') return 5000; // Elite benchmark for total power
    return 85; // Elite benchmark for efficiency
  };

  const PowerMetric = ({ 
    label, 
    value, 
    unit,
    icon,
    status,
    benchmark,
    tooltip
  }: {
    label: string;
    value: number | undefined;
    unit: string;
    icon: React.ReactNode;
    status: string;
    benchmark: number;
    tooltip: string;
  }) => (
    <div className="bg-gradient-to-br from-muted/50 to-muted/20 p-4 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
          <InfoTooltip content={tooltip} />
        </div>
        <StatusIcon status={status} />
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold">
          {value !== undefined ? value.toFixed(0) : 'N/A'}
        </span>
        <span className="text-muted-foreground">{unit}</span>
      </div>

      {value !== undefined && (
        <>
          <Progress 
            value={(value / benchmark) * 100} 
            className="h-2"
          />
          <div className="flex items-center justify-between text-xs">
            <span className={
              status === "elite" ? "text-green-600 font-semibold" :
              status === "good" ? "text-yellow-600 font-semibold" :
              "text-red-600 font-semibold"
            }>
              {getStatusLabel(status)}
            </span>
            <span className="text-muted-foreground">
              {((value / benchmark) * 100).toFixed(0)}% of elite benchmark
            </span>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-orange-500" />
          <CardTitle>Power Analysis</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* EFFECTIVE POWER - PRIMARY METRIC */}
        {effectivePower !== undefined && (
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 p-6 rounded-lg border-2 border-green-500/40">
            <div className="flex items-center gap-3 mb-3">
              <Lightbulb className="h-8 w-8 text-green-400" />
              <div>
                <div className="text-sm font-medium text-green-400">What Actually Matters!</div>
                <div className="text-2xl font-bold">Effective Power to Bat</div>
              </div>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold text-green-400">
                {effectivePower.toFixed(0)}
              </span>
              <span className="text-2xl text-muted-foreground">W</span>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              This is the power that actually reaches the bat after accounting for energy transfer efficiency
            </div>
            <Progress 
              value={(effectivePower / 4250) * 100} 
              className="h-3 mt-4"
            />
            <div className="flex items-center justify-between text-sm mt-2">
              <span className={
                effectivePowerStatus === "elite" ? "text-green-400 font-semibold" :
                effectivePowerStatus === "good" ? "text-yellow-400 font-semibold" :
                "text-red-400 font-semibold"
              }>
                {effectivePowerStatus === "elite" ? "Elite" : effectivePowerStatus === "good" ? "Good" : "Developing"}
              </span>
              <span className="text-muted-foreground">
                {((effectivePower / 4250) * 100).toFixed(0)}% of elite benchmark
              </span>
            </div>
          </div>
        )}

        {/* SWING EFFICIENCY SCORE */}
        {swingEfficiencyScore !== undefined && (
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 p-6 rounded-lg border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-blue-400" />
                <span className="text-lg font-semibold">Swing Efficiency Score</span>
                <InfoTooltip content="Overall efficiency combining energy transfer, momentum alignment, kinematic sequencing, and connection quality" />
              </div>
              <div className="text-4xl font-bold text-blue-400">
                {swingEfficiencyScore.toFixed(0)}
                <span className="text-xl text-muted-foreground">/100</span>
              </div>
            </div>
            <Progress 
              value={swingEfficiencyScore} 
              className="h-3"
            />
            <div className="mt-2 text-sm">
              <span className={
                swingEfficiencyStatus === "elite" ? "text-green-400 font-semibold" :
                swingEfficiencyStatus === "good" ? "text-yellow-400 font-semibold" :
                "text-red-400 font-semibold"
              }>
                {swingEfficiencyStatus === "elite" ? "Elite Efficiency" : swingEfficiencyStatus === "good" ? "Good Efficiency" : "Developing Efficiency"}
              </span>
            </div>
          </div>
        )}

        {/* POWER FLOW DIAGRAM */}
        {powerFlowData && (
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Power Flow Analysis
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <Sankey
                  data={powerFlowData}
                  nodeWidth={10}
                  nodePadding={40}
                  margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  link={{ stroke: "hsl(var(--muted-foreground))", strokeOpacity: 0.4 }}
                >
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--background))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px"
                    }}
                  />
                </Sankey>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted-foreground/40"></div>
                <span>Energy Loss</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Effective Transfer</span>
              </div>
            </div>
          </div>
        )}

        {/* COACHING MESSAGE */}
        {getCoachingMessage() && (
          <div className={`p-4 rounded-lg border ${
            metrics.totalPower && metrics.totalPower >= 4000 && metrics.energyTransferEfficiency && metrics.energyTransferEfficiency >= 75
              ? 'border-green-500 bg-green-500/10' 
              : metrics.totalPower && metrics.totalPower < 3500 && metrics.energyTransferEfficiency && metrics.energyTransferEfficiency > 80
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-yellow-500 bg-yellow-500/10'
          }`}>
            <div className="font-semibold mb-1">Coach's Insight</div>
            <p className="text-sm text-muted-foreground">
              {getCoachingMessage()}
            </p>
          </div>
        )}

        {/* DETAILED METRICS GRID */}
        <div className="grid gap-4 md:grid-cols-2">
          <PowerMetric
            label="Rotational Power"
            value={metrics.rotationalPower}
            unit="W"
            icon={<div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-blue-500" />
            </div>}
            status={getStatus(metrics.rotationalPower, { elite: 2000, good: 1500 })}
            benchmark={2500}
            tooltip="Power generated through rotational movements (hips, trunk, shoulders). Represents the explosive turning force in the swing."
          />

          <PowerMetric
            label="Linear Power"
            value={metrics.linearPower}
            unit="W"
            icon={<div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-purple-500" />
            </div>}
            status={getStatus(metrics.linearPower, { elite: 1500, good: 1000 })}
            benchmark={2000}
            tooltip="Power generated through linear movements (weight transfer, forward momentum). Represents the forward drive component."
          />

          <PowerMetric
            label="Total Power Generated"
            value={metrics.totalPower}
            unit="W"
            icon={<div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <Zap className="h-5 w-5 text-muted-foreground" />
            </div>}
            status={totalPowerStatus}
            benchmark={getEliteBenchmark('total')}
            tooltip="Combined rotational and linear power generated by the body. This is before accounting for transfer efficiency."
          />

          <PowerMetric
            label="Energy Transfer Efficiency"
            value={metrics.energyTransferEfficiency}
            unit="%"
            icon={<div className={`h-8 w-8 rounded-full flex items-center justify-center ${
              efficiencyStatus === "elite" ? "bg-green-500/10" :
              efficiencyStatus === "good" ? "bg-yellow-500/10" :
              "bg-red-500/10"
            }`}>
              <Zap className={`h-5 w-5 ${
                efficiencyStatus === "elite" ? "text-green-500" :
                efficiencyStatus === "good" ? "text-yellow-500" :
                "text-red-500"
              }`} />
            </div>}
            status={efficiencyStatus}
            benchmark={getEliteBenchmark('efficiency')}
            tooltip="How efficiently energy flows through the kinetic chain from ground to bat. Elite: >75%. Higher efficiency means less energy lost in the transfer."
          />
        </div>
      </CardContent>
    </Card>
  );
}
