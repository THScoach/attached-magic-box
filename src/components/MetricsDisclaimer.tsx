import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface MetricsDisclaimerProps {
  type: "body" | "bat" | "ball";
}

export function MetricsDisclaimer({ type }: MetricsDisclaimerProps) {
  const content = {
    body: {
      title: "Video-Based Body Mechanics",
      description: "These metrics are calculated from smartphone video analysis and are 85-90% accurate for directional guidance. More expensive capture systems (like Reboot Motion or K-Vest) can provide more precise data, but these measurements are reliable for tracking progress and identifying areas to improve.",
    },
    bat: {
      title: "Estimated Bat Metrics",
      description: "Bat metrics like speed, attack angle, and time in zone require sensor equipment for accuracy. These are AI estimates to provide directional guidance. For precise measurements, use Blast Motion, Diamond Kinetics, or similar bat sensors.",
    },
    ball: {
      title: "Estimated Ball Flight Data",
      description: "Ball metrics like exit velocity, launch angle, and hard-hit rate require tracking systems for accuracy. These are AI estimates based on swing mechanics. For actual ball flight data, use HitTrax, Rapsodo, TrackMan, or radar guns.",
    },
  };

  const { title, description } = content[type];

  return (
    <Alert className="bg-muted/50 border-muted">
      <Info className="h-4 w-4" />
      <AlertDescription className="text-sm">
        <strong>{title}:</strong> {description}
      </AlertDescription>
    </Alert>
  );
}
