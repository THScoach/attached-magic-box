import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Anchor, Settings, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PillarCardProps {
  pillar: "ANCHOR" | "ENGINE" | "WHIP";
  score: number;
  subtitle: string;
  className?: string;
}

const pillarConfig = {
  ANCHOR: {
    icon: Anchor,
    color: "text-anchor-foreground",
    bg: "bg-anchor",
    border: "border-anchor",
    progress: "bg-anchor",
    tooltip: "Stability & Ground Force - Foundation of power generation"
  },
  ENGINE: {
    icon: Settings,
    color: "text-engine-foreground",
    bg: "bg-engine",
    border: "border-engine",
    progress: "bg-engine",
    tooltip: "Tempo & Sequence - Optimal timing and kinetic chain"
  },
  WHIP: {
    icon: Zap,
    color: "text-whip-foreground",
    bg: "bg-whip",
    border: "border-whip",
    progress: "bg-whip",
    tooltip: "Release & Acceleration - Bat speed through contact zone"
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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className={cn(
            "p-6 transition-all hover:shadow-lg border-2 cursor-help",
            config.border,
            className
          )}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-3 rounded-lg", config.bg)}>
                  <Icon className={cn("h-6 w-6", config.color)} />
                </div>
                <div>
                  <h3 className={cn("font-bold text-lg", config.color)}>{pillar}</h3>
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
              <Progress value={score} className="h-2 bg-muted">
                <div 
                  className={cn("h-full transition-all", config.bg)} 
                  style={{ width: `${score}%` }}
                />
              </Progress>
            </div>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
