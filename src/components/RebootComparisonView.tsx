import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface RebootComparisonViewProps {
  reports: Array<{
    id: string;
    label: string;
    reportDate: Date;
    metrics: {
      fireDuration: number;
      tempoRatio: number;
      peakBatSpeed?: number;
      xFactor?: number;
      peakPelvisRotVel?: number;
      totalPower?: number;
      momentumDirectionAngle?: number;
    };
    scores: {
      bodyScore: number;
    };
  }>;
}

export function RebootComparisonView({ reports }: RebootComparisonViewProps) {
  if (reports.length < 2) return null;

  const before = reports[0];
  const current = reports[reports.length - 1];

  const calculateChange = (before: number | undefined, current: number | undefined) => {
    if (before === undefined || current === undefined) return { value: 0, percentage: 0 };
    const value = current - before;
    const percentage = before !== 0 ? (value / before) * 100 : 0;
    return { value, percentage };
  };

  const ChangeIndicator = ({ 
    change, 
    reverseColors = false,
    unit = ''
  }: { 
    change: { value: number; percentage: number };
    reverseColors?: boolean;
    unit?: string;
  }) => {
    const isPositive = change.value > 0;
    const isImprovement = reverseColors ? !isPositive : isPositive;
    
    if (Math.abs(change.value) < 0.01) {
      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Minus className="h-4 w-4" />
          <span className="text-xs">No change</span>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-1 ${isImprovement ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? (
          <TrendingUp className="h-4 w-4" />
        ) : (
          <TrendingDown className="h-4 w-4" />
        )}
        <span className="text-xs font-semibold">
          {isPositive ? '+' : ''}{change.value.toFixed(change.value < 10 ? 1 : 0)}{unit}
        </span>
        <span className="text-xs">
          ({isPositive ? '+' : ''}{change.percentage.toFixed(1)}%)
        </span>
      </div>
    );
  };

  const ComparisonRow = ({
    label,
    beforeValue,
    currentValue,
    unit = '',
    reverseColors = false
  }: {
    label: string;
    beforeValue: number | undefined;
    currentValue: number | undefined;
    unit?: string;
    reverseColors?: boolean;
  }) => {
    const change = calculateChange(beforeValue, currentValue);
    
    return (
      <tr className="border-b border-border/50">
        <td className="py-3 text-sm font-medium">{label}</td>
        <td className="py-3 text-sm text-center">
          {beforeValue !== undefined ? `${beforeValue.toFixed(beforeValue < 10 ? 1 : 0)}${unit}` : 'N/A'}
        </td>
        <td className="py-3 text-sm text-center font-bold">
          {currentValue !== undefined ? `${currentValue.toFixed(currentValue < 10 ? 1 : 0)}${unit}` : 'N/A'}
        </td>
        <td className="py-3 text-right">
          <ChangeIndicator change={change} reverseColors={reverseColors} unit={unit} />
        </td>
      </tr>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Tracking</CardTitle>
        <div className="text-sm text-muted-foreground">
          Comparing {before.label} ({before.reportDate.toLocaleDateString()}) → {current.label} ({current.reportDate.toLocaleDateString()})
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-3 text-sm font-semibold">Metric</th>
                <th className="text-center py-3 text-sm font-semibold">Before</th>
                <th className="text-center py-3 text-sm font-semibold">Current</th>
                <th className="text-right py-3 text-sm font-semibold">Change</th>
              </tr>
            </thead>
            <tbody>
              <ComparisonRow
                label="Fire Duration"
                beforeValue={before.metrics.fireDuration}
                currentValue={current.metrics.fireDuration}
                unit="ms"
                reverseColors={true}
              />
              <ComparisonRow
                label="Tempo Ratio"
                beforeValue={before.metrics.tempoRatio}
                currentValue={current.metrics.tempoRatio}
                unit=":1"
              />
              <ComparisonRow
                label="Body Score"
                beforeValue={before.scores.bodyScore}
                currentValue={current.scores.bodyScore}
              />
              <ComparisonRow
                label="Peak Bat Speed"
                beforeValue={before.metrics.peakBatSpeed}
                currentValue={current.metrics.peakBatSpeed}
                unit=" mph"
              />
              <ComparisonRow
                label="X-Factor"
                beforeValue={before.metrics.xFactor}
                currentValue={current.metrics.xFactor}
                unit="°"
              />
              <ComparisonRow
                label="Peak Pelvis Velocity"
                beforeValue={before.metrics.peakPelvisRotVel}
                currentValue={current.metrics.peakPelvisRotVel}
                unit="°/s"
              />
              <ComparisonRow
                label="Total Power Output"
                beforeValue={before.metrics.totalPower}
                currentValue={current.metrics.totalPower}
                unit="W"
              />
              <ComparisonRow
                label="Momentum Alignment"
                beforeValue={before.metrics.momentumDirectionAngle}
                currentValue={current.metrics.momentumDirectionAngle}
                unit="°"
                reverseColors={true}
              />
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
