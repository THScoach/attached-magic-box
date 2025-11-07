import { Badge } from "@/components/ui/badge";
import { InfoTooltip } from "@/components/ui/info-tooltip";

interface MetricSourceBadgeProps {
  source: "video" | "estimated" | "sensor";
  className?: string;
}

export function MetricSourceBadge({ source, className }: MetricSourceBadgeProps) {
  const config = {
    video: {
      label: "Video-Based",
      variant: "default" as const,
      tooltip: "Calculated from smartphone video analysis. 85-90% accurate for directional guidance.",
    },
    estimated: {
      label: "AI Estimated",
      variant: "secondary" as const,
      tooltip: "Estimated values. For accurate measurements, use sensor equipment like Blast Motion, HitTrax, or Rapsodo.",
    },
    sensor: {
      label: "Sensor Required",
      variant: "outline" as const,
      tooltip: "This metric requires sensor equipment (Blast Motion, Diamond Kinetics, HitTrax, Rapsodo) for accurate measurement.",
    },
  };

  const { label, variant, tooltip } = config[source];

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <Badge variant={variant} className="text-xs">
        {label}
      </Badge>
      <InfoTooltip content={tooltip} />
    </div>
  );
}
