import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Anchor, Settings, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PillarCardProps {
  pillar: "ANCHOR" | "ENGINE" | "WHIP";
  score: number;
  subtitle: string;
  className?: string;
}

const pillarConfig = {
  ANCHOR: {
    icon: Anchor,
    color: "text-anchor",
    bg: "bg-anchor/10",
    border: "border-anchor/20",
    progress: "bg-anchor"
  },
  ENGINE: {
    icon: Settings,
    color: "text-engine",
    bg: "bg-engine/10",
    border: "border-engine/20",
    progress: "bg-engine"
  },
  WHIP: {
    icon: Zap,
    color: "text-whip",
    bg: "bg-whip/10",
    border: "border-whip/20",
    progress: "bg-whip"
  }
};

export function PillarCard({ pillar, score, subtitle, className }: PillarCardProps) {
  const config = pillarConfig[pillar];
  const Icon = config.icon;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Card className={cn(
      "p-6 transition-all hover:shadow-lg border-2",
      config.border,
      config.bg,
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", config.bg)}>
            <Icon className={cn("h-6 w-6", config.color)} />
          </div>
          <div>
            <h3 className="font-bold text-lg">{pillar}</h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className={cn("text-3xl font-bold", getScoreColor(score))}>
          {score}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Score</span>
          <span className="font-medium">{score}/100</span>
        </div>
        <Progress value={score} className="h-2" />
      </div>
    </Card>
  );
}
