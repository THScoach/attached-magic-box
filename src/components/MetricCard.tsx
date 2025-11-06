import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { MetricDefinition, MembershipTier, hasMetricAccess, getMLBBenchmarks } from "@/lib/fourBsFramework";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MetricCardProps {
  metric: MetricDefinition;
  value?: number | string;
  userTier: MembershipTier;
  isLocked?: boolean;
  confidenceRange?: { min: number; max: number };
  showBenchmarks?: boolean;
  onClick?: () => void;
}

export function MetricCard({
  metric,
  value,
  userTier,
  isLocked,
  confidenceRange,
  showBenchmarks = false,
  onClick,
}: MetricCardProps) {
  const hasAccess = hasMetricAccess(userTier, metric);
  const locked = isLocked || !hasAccess;

  const getAccuracyBadge = () => {
    if (metric.accuracy >= 90) {
      return (
        <Badge variant="default" className="gap-1 bg-green-600">
          <CheckCircle2 className="h-3 w-3" />
          {metric.accuracy}% Accurate
        </Badge>
      );
    } else if (metric.accuracy >= 70) {
      return (
        <Badge variant="secondary" className="gap-1">
          <AlertTriangle className="h-3 w-3 text-yellow-600" />
          ~{metric.accuracy}% Est.
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="gap-1">
          <AlertTriangle className="h-3 w-3 text-orange-600" />
          ~{metric.accuracy}% Est.
        </Badge>
      );
    }
  };

  const benchmarks = showBenchmarks ? getMLBBenchmarks(metric.id) : [];

  return (
    <Card
      className={cn(
        "transition-all cursor-pointer hover:shadow-md",
        locked && "opacity-60 bg-muted/50"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{metric.icon}</span>
            <div>
              <h3 className="font-semibold text-sm leading-tight">{metric.name}</h3>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </div>
          </div>
          {locked && <Lock className="h-4 w-4 text-muted-foreground" />}
        </div>

        {locked ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-2 blur-sm select-none">85</div>
            <p className="text-xs text-muted-foreground">
              {metric.requiredTier.charAt(0).toUpperCase() + metric.requiredTier.slice(1)} tier required
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-3">
              {confidenceRange ? (
                <div>
                  <div className="text-3xl font-bold">
                    {confidenceRange.min}-{confidenceRange.max}
                  </div>
                  <div className="text-xs text-muted-foreground">{metric.unit}</div>
                </div>
              ) : (
                <div>
                  <div className="text-4xl font-bold">
                    {value !== undefined && value !== null ? value : '--'}
                  </div>
                  <div className="text-xs text-muted-foreground">{metric.unit}</div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              {getAccuracyBadge()}
              {metric.sensorRequired && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="gap-1">
                        <Info className="h-3 w-3" />
                        Sensor
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Requires {metric.sensorRequired}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {benchmarks.length > 0 && (
              <div className="text-xs space-y-1 border-t pt-2 mt-2">
                <p className="font-semibold mb-1">Benchmarks:</p>
                {benchmarks.slice(0, 3).map((bench, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-muted-foreground">{bench.level}:</span>
                    <span className="font-medium">
                      {bench.avg ? `${bench.avg}` : `${bench.min}-${bench.max}`} {metric.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
