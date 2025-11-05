import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SwingPhase } from "@/lib/swingPhaseDetection";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface SwingPhaseTimelineProps {
  phases: SwingPhase[];
  totalDuration: number;
  loadToFireRatio: number;
  quality: {
    score: number;
    issues: string[];
    detectionConfidence: number;
  };
  currentTime?: number;
  onSeekToPhase?: (frame: number) => void;
}

const PHASE_COLORS = {
  stance: 'bg-slate-500',
  load: 'bg-anchor',
  stride: 'bg-engine',
  fire: 'bg-whip',
  contact: 'bg-ball',
  follow_through: 'bg-brain'
};

const PHASE_LABELS = {
  stance: 'Stance',
  load: 'Load',
  stride: 'Stride',
  fire: 'Fire',
  contact: 'Contact',
  follow_through: 'Follow Through'
};

export function SwingPhaseTimeline({
  phases,
  totalDuration,
  loadToFireRatio,
  quality,
  currentTime = 0,
  onSeekToPhase
}: SwingPhaseTimelineProps) {
  if (!phases || phases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Swing Phase Detection</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No swing phases detected. Upload a swing video to analyze timing.
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentPhase = phases.find(
    p => currentTime >= p.startFrame / 30 && currentTime <= p.endFrame / 30
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Swing Phase Detection</CardTitle>
          <div className="flex items-center gap-2">
            {quality.score >= 80 ? (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                High Quality
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Quality: {quality.score}%
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline Visualization */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Timeline</span>
            <span className="text-muted-foreground">{totalDuration.toFixed(2)}s</span>
          </div>
          <div className="relative h-12 bg-muted rounded-lg overflow-hidden">
            {phases.map((phase, idx) => {
              const width = (phase.duration / totalDuration) * 100;
              const left = (phase.startFrame / (phases[phases.length - 1].endFrame)) * 100;
              const isActive = phase === currentPhase;
              
              return (
                <button
                  key={idx}
                  className={`absolute h-full ${PHASE_COLORS[phase.name]} ${
                    isActive ? 'ring-2 ring-primary ring-offset-2' : 'opacity-80 hover:opacity-100'
                  } transition-all cursor-pointer`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  onClick={() => onSeekToPhase?.(phase.startFrame)}
                  title={`${PHASE_LABELS[phase.name]}: ${phase.duration.toFixed(3)}s`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            {phases.map((phase, idx) => (
              <button
                key={idx}
                onClick={() => onSeekToPhase?.(phase.startFrame)}
                className="text-xs hover:bg-accent px-2 py-1 rounded transition-colors"
              >
                <span className={`inline-block w-2 h-2 rounded-full ${PHASE_COLORS[phase.name]} mr-1`} />
                {PHASE_LABELS[phase.name]}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Load-to-Fire Ratio</p>
            <p className="text-2xl font-bold">
              {loadToFireRatio.toFixed(1)}:1
            </p>
            <p className="text-xs text-muted-foreground">
              {loadToFireRatio >= 2.5 && loadToFireRatio <= 3.5 ? (
                <span className="text-green-500">Optimal range (3:1)</span>
              ) : (
                <span className="text-yellow-500">Target: 3:1</span>
              )}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Detection Confidence</p>
            <p className="text-2xl font-bold">
              {(quality.detectionConfidence * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">
              Based on pose tracking
            </p>
          </div>
        </div>

        {/* Phase Details */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Phase Breakdown</p>
          <div className="space-y-1">
            {phases.map((phase, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-2 rounded ${
                  phase === currentPhase ? 'bg-accent' : 'hover:bg-accent/50'
                } transition-colors cursor-pointer`}
                onClick={() => onSeekToPhase?.(phase.startFrame)}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${PHASE_COLORS[phase.name]}`} />
                  <span className="text-sm font-medium">{PHASE_LABELS[phase.name]}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono">
                    {phase.duration.toFixed(3)}s
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({((phase.duration / totalDuration) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Issues */}
        {quality.issues.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              Detection Notes
            </p>
            <ul className="space-y-1">
              {quality.issues.map((issue, idx) => (
                <li key={idx} className="text-xs text-muted-foreground pl-6">
                  • {issue}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
