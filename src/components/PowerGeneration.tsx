import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Progress } from "@/components/ui/progress";
import { Zap, CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface PowerGenerationProps {
  metrics: {
    rotationalPower?: number; // Watts
    linearPower?: number; // Watts
    totalPower?: number; // Watts
  };
}

export function PowerGeneration({ metrics }: PowerGenerationProps) {
  // Only show if we have power data
  const hasData = metrics.rotationalPower !== undefined || 
                  metrics.linearPower !== undefined || 
                  metrics.totalPower !== undefined;

  if (!hasData) {
    return null; // Don't render if no data
  }
  const getStatus = (value: number | undefined, thresholds: { elite: number; good: number }) => {
    if (value === undefined) return "unknown";
    if (value >= thresholds.elite) return "elite";
    if (value >= thresholds.good) return "good";
    return "developing";
  };

  const totalPowerStatus = getStatus(metrics.totalPower, { elite: 4000, good: 3000 });

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
          <CardTitle>Power Generation</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* DETAILED METRICS GRID */}
        <div className="grid gap-4 md:grid-cols-2">
          {metrics.rotationalPower !== undefined && (
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
          )}

          {metrics.linearPower !== undefined && (
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
          )}

          {metrics.totalPower !== undefined && (
            <PowerMetric
              label="Total Power Generated"
              value={metrics.totalPower}
              unit="W"
              icon={<div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-orange-500" />
              </div>}
              status={totalPowerStatus}
              benchmark={getEliteBenchmark('total')}
              tooltip="Combined rotational and linear power generated by the body."
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
