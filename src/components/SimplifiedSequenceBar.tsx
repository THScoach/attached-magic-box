import { Card } from "@/components/ui/card";
import { MetricSourceBadge } from "./MetricSourceBadge";

interface SimplifiedSequenceBarProps {
  legsTiming: "good" | "early" | "late";
  coreTiming: "good" | "early" | "late";
  armsTiming: "good" | "early" | "late";
  batTiming: "good";
  tempoRatio: number;
}

export function SimplifiedSequenceBar({
  legsTiming,
  coreTiming,
  armsTiming,
  batTiming,
  tempoRatio,
}: SimplifiedSequenceBarProps) {
  const getStatusColor = (timing: "good" | "early" | "late") => {
    if (timing === "good") return "bg-success";
    if (timing === "early") return "bg-warning";
    return "bg-destructive";
  };

  const getStatusEmoji = (timing: "good" | "early" | "late") => {
    if (timing === "good") return "🟩🟩🟩";
    if (timing === "early") return "🟨🟨🟥";
    return "🟥🟥🟥";
  };

  const getInterpretation = () => {
    if (legsTiming === "good" && coreTiming === "good" && armsTiming === "good") {
      return "Perfect! Every part of your body is working together like a well-oiled machine.";
    }
    
    const issues: string[] = [];
    if (legsTiming !== "good") issues.push(`hips fired ${legsTiming}`);
    if (coreTiming !== "good") issues.push(`torso rotated ${coreTiming}`);
    if (armsTiming !== "good") issues.push(`arms came through ${armsTiming}`);
    
    return `Your ${issues.join(", ")}. This costs you power.`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <h3 className="font-semibold text-lg">YOUR SEQUENCE</h3>
        </div>
        <MetricSourceBadge source="video" />
      </div>

      {/* Horizontal Sequence Bar */}
      <div className="space-y-6 mb-6">
        <div className="flex items-center gap-2">
          {/* Hips */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="text-2xl">🦵</div>
            <div className={`w-full h-12 rounded-lg ${getStatusColor(legsTiming)} flex items-center justify-center transition-all`}>
              <span className="text-white font-bold text-sm">HIPS</span>
            </div>
            <div className="text-xs">{getStatusEmoji(legsTiming)}</div>
            <div className="text-xs text-muted-foreground capitalize">{legsTiming}</div>
          </div>

          {/* Arrow */}
          <div className="text-3xl text-muted-foreground">→</div>

          {/* Torso */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="text-2xl">🔄</div>
            <div className={`w-full h-12 rounded-lg ${getStatusColor(coreTiming)} flex items-center justify-center transition-all`}>
              <span className="text-white font-bold text-sm">TORSO</span>
            </div>
            <div className="text-xs">{getStatusEmoji(coreTiming)}</div>
            <div className="text-xs text-muted-foreground capitalize">{coreTiming}</div>
          </div>

          {/* Arrow */}
          <div className="text-3xl text-muted-foreground">→</div>

          {/* Arms */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="text-2xl">💪</div>
            <div className={`w-full h-12 rounded-lg ${getStatusColor(armsTiming)} flex items-center justify-center transition-all`}>
              <span className="text-white font-bold text-sm">ARMS</span>
            </div>
            <div className="text-xs">{getStatusEmoji(armsTiming)}</div>
            <div className="text-xs text-muted-foreground capitalize">{armsTiming}</div>
          </div>

          {/* Arrow */}
          <div className="text-3xl text-muted-foreground">→</div>

          {/* Bat */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="text-2xl">⚾</div>
            <div className={`w-full h-12 rounded-lg ${getStatusColor("good")} flex items-center justify-center transition-all`}>
              <span className="text-white font-bold text-sm">BAT</span>
            </div>
            <div className="text-xs">🟩🟩🟩</div>
            <div className="text-xs text-muted-foreground">Contact</div>
          </div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="p-4 bg-muted/50 rounded-lg mb-4">
        <div className="text-sm font-semibold mb-2">📊 What This Means:</div>
        <div className="text-sm text-muted-foreground">
          {getInterpretation()}
        </div>
      </div>

      {/* Tempo Ratio */}
      <div className="p-4 bg-primary/10 rounded-lg">
        <div className="text-sm font-semibold mb-2">⏱️ Load:Fire Tempo</div>
        <div className="text-3xl font-bold text-primary">
          {tempoRatio.toFixed(1)} : 1
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          {tempoRatio >= 2.5 && tempoRatio <= 3.5 ? (
            <>Excellent timing! You're gathering energy before exploding.</>
          ) : tempoRatio > 3.5 ? (
            <>You're loading too long. Work on quicker transition to fire phase.</>
          ) : (
            <>You're firing too early. Focus on gathering more energy during load.</>
          )}
        </div>
      </div>
    </Card>
  );
}
