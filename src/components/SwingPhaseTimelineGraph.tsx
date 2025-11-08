import { Card } from "@/components/ui/card";
import { MetricSourceBadge } from "./MetricSourceBadge";

interface SwingPhaseTimelineGraphProps {
  loadTime: number;
  launchTime: number;
  contactTime?: number;
}

export function SwingPhaseTimelineGraph({
  loadTime,
  launchTime,
  contactTime = 0,
}: SwingPhaseTimelineGraphProps) {
  // Calculate total swing time
  const totalTime = loadTime + launchTime;
  
  // Calculate percentages for visualization
  const loadPercentage = (loadTime / totalTime) * 100;
  const launchPercentage = (launchTime / totalTime) * 100;
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⏱️</span>
          <h3 className="font-semibold text-lg">SWING PHASE TIMELINE</h3>
        </div>
        <MetricSourceBadge source="video" />
      </div>

      {/* Timeline visualization */}
      <div className="space-y-6">
        {/* Visual timeline bar */}
        <div className="relative h-16 bg-muted rounded-lg overflow-hidden">
          {/* Load phase */}
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 flex items-center justify-center text-white font-semibold transition-all duration-1000"
            style={{ width: `${loadPercentage}%` }}
          >
            <span className="text-xs">LOAD</span>
          </div>
          
          {/* Launch phase */}
          <div
            className="absolute top-0 h-full bg-primary flex items-center justify-center text-white font-semibold transition-all duration-1000"
            style={{ 
              left: `${loadPercentage}%`,
              width: `${launchPercentage}%` 
            }}
          >
            <span className="text-xs">FIRE</span>
          </div>

          {/* Phase markers */}
          <div className="absolute top-0 left-0 h-full w-px bg-white" />
          <div 
            className="absolute top-0 h-full w-px bg-white"
            style={{ left: `${loadPercentage}%` }}
          />
          <div className="absolute top-0 right-0 h-full w-px bg-white" />
        </div>

        {/* Phase labels and times */}
        <div className="flex justify-between text-sm">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mb-1" />
            <div className="font-semibold">LOAD START</div>
            <div className="text-xs text-muted-foreground">0ms</div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-primary mb-1" />
            <div className="font-semibold">FIRE START</div>
            <div className="text-xs text-muted-foreground">{loadTime.toFixed(0)}ms</div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-success mb-1" />
            <div className="font-semibold">CONTACT</div>
            <div className="text-xs text-muted-foreground">{totalTime.toFixed(0)}ms</div>
          </div>
        </div>

        {/* Phase breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-500/10 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Load Phase</div>
            <div className="text-2xl font-bold text-blue-500">{loadTime.toFixed(0)}ms</div>
            <div className="text-xs text-muted-foreground mt-1">
              Gather energy & coil
            </div>
          </div>
          
          <div className="p-4 bg-primary/10 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Fire Phase</div>
            <div className="text-2xl font-bold text-primary">{launchTime.toFixed(0)}ms</div>
            <div className="text-xs text-muted-foreground mt-1">
              Explosive delivery
            </div>
          </div>
        </div>

        {/* Tempo ratio insight */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-sm font-semibold mb-2">📊 Timeline Insight</div>
          <div className="text-sm text-muted-foreground">
            {loadTime / launchTime > 3.5 ? (
              <>Loading for <strong>{loadTime.toFixed(0)}ms</strong> before firing in <strong>{launchTime.toFixed(0)}ms</strong>. 
              Your load is longer than ideal - work on quicker transition to fire phase.</>
            ) : loadTime / launchTime >= 2.5 ? (
              <>Excellent timing! <strong>{loadTime.toFixed(0)}ms</strong> load → <strong>{launchTime.toFixed(0)}ms</strong> fire. 
              This ratio creates optimal elastic energy for power generation.</>
            ) : (
              <>Your load phase (<strong>{loadTime.toFixed(0)}ms</strong>) is too short relative to fire (<strong>{launchTime.toFixed(0)}ms</strong>). 
              Focus on gathering more energy during the load.</>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
