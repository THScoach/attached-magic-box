import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useSwingComparison } from "@/hooks/useSwingComparison";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface MetricRowProps {
  label: string;
  valueA: number;
  valueB: number;
  difference: number;
  unit?: string;
  format?: (val: number) => string;
}

function MetricRow({ label, valueA, valueB, difference, unit = "", format: formatFn }: MetricRowProps) {
  const displayA = formatFn ? formatFn(valueA) : valueA.toFixed(1);
  const displayB = formatFn ? formatFn(valueB) : valueB.toFixed(1);
  const displayDiff = formatFn ? formatFn(Math.abs(difference)) : Math.abs(difference).toFixed(1);
  
  const isImprovement = difference > 0;
  const isNeutral = Math.abs(difference) < 0.5;

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex-1 text-sm font-medium">{label}</div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground w-16 text-right">
          {displayA}{unit}
        </div>
        <div className="w-24 flex items-center justify-center gap-2">
          {isNeutral ? (
            <>
              <Minus className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{displayDiff}{unit}</span>
            </>
          ) : isImprovement ? (
            <>
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-bold text-green-500">+{displayDiff}{unit}</span>
            </>
          ) : (
            <>
              <TrendingDown className="h-4 w-4 text-red-500" />
              <span className="text-sm font-bold text-red-500">-{displayDiff}{unit}</span>
            </>
          )}
        </div>
        <div className="text-sm font-semibold w-16 text-left">
          {displayB}{unit}
        </div>
      </div>
    </div>
  );
}

export function SwingComparison({ playerId }: { playerId?: string }) {
  const {
    availableSwings,
    isLoadingSwings,
    selectedSwings,
    comparisonData,
    selectSwing,
    clearComparison,
  } = useSwingComparison(playerId);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoA = videoRefA.current;
    const videoB = videoRefB.current;
    if (!videoA || !videoB) return;

    const handleTimeUpdate = () => {
      setCurrentTime(videoA.currentTime);
    };

    videoA.addEventListener('timeupdate', handleTimeUpdate);
    return () => videoA.removeEventListener('timeupdate', handleTimeUpdate);
  }, [comparisonData]);

  const togglePlayPause = () => {
    const videoA = videoRefA.current;
    const videoB = videoRefB.current;
    if (!videoA || !videoB) return;

    if (isPlaying) {
      videoA.pause();
      videoB.pause();
    } else {
      videoA.play();
      videoB.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    const videoA = videoRefA.current;
    const videoB = videoRefB.current;
    if (!videoA || !videoB) return;

    videoA.currentTime = 0;
    videoB.currentTime = 0;
    setCurrentTime(0);
    if (isPlaying) {
      videoA.play();
      videoB.play();
    }
  };

  const syncVideos = () => {
    const videoA = videoRefA.current;
    const videoB = videoRefB.current;
    if (!videoA || !videoB) return;

    videoB.currentTime = videoA.currentTime;
  };

  useEffect(() => {
    syncVideos();
  }, [currentTime]);

  if (isLoadingSwings) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading swings...
        </CardContent>
      </Card>
    );
  }

  if (availableSwings.length < 2) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-2">Not enough swings to compare</p>
          <p className="text-sm text-muted-foreground">Record at least 2 swings to use comparison mode</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compare Swings</CardTitle>
          <CardDescription>Select two swings to analyze differences in mechanics and performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Baseline Swing</label>
              <Select value={selectedSwings[0] || ""} onValueChange={(val) => selectSwing(0, val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first swing..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSwings.map(swing => (
                    <SelectItem key={swing.id} value={swing.id} disabled={swing.id === selectedSwings[1]}>
                      {format(new Date(swing.created_at), 'MMM d, yyyy h:mm a')} - Score: {swing.overall_score}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Comparison Swing</label>
              <Select value={selectedSwings[1] || ""} onValueChange={(val) => selectSwing(1, val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second swing..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSwings.map(swing => (
                    <SelectItem key={swing.id} value={swing.id} disabled={swing.id === selectedSwings[0]}>
                      {format(new Date(swing.created_at), 'MMM d, yyyy h:mm a')} - Score: {swing.overall_score}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedSwings[0] && selectedSwings[1] && (
            <Button variant="outline" onClick={clearComparison}>
              Clear Selection
            </Button>
          )}
        </CardContent>
      </Card>

      {comparisonData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Video Comparison</CardTitle>
              <CardDescription>Synchronized playback of both swings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">Baseline</Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(comparisonData.swingA.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRefA}
                      src={comparisonData.swingA.video_url}
                      className="w-full h-full"
                      playsInline
                      onEnded={() => setIsPlaying(false)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <Badge>Comparison</Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(comparisonData.swingB.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRefB}
                      src={comparisonData.swingB.video_url}
                      className="w-full h-full"
                      playsInline
                      onEnded={() => setIsPlaying(false)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" size="icon" onClick={handleRestart}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button size="lg" onClick={togglePlayPause}>
                  {isPlaying ? (
                    <>
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Play
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Detailed comparison of key swing metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <span>Overall Scores</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </h3>
                  <MetricRow
                    label="H.I.T.S. Score"
                    valueA={comparisonData.swingA.overall_score}
                    valueB={comparisonData.swingB.overall_score}
                    difference={comparisonData.differences.overall_score}
                  />
                  <MetricRow
                    label="ANCHOR Score"
                    valueA={comparisonData.swingA.anchor_score}
                    valueB={comparisonData.swingB.anchor_score}
                    difference={comparisonData.differences.anchor_score}
                  />
                  <MetricRow
                    label="ENGINE Score"
                    valueA={comparisonData.swingA.engine_score}
                    valueB={comparisonData.swingB.engine_score}
                    difference={comparisonData.differences.engine_score}
                  />
                  <MetricRow
                    label="WHIP Score"
                    valueA={comparisonData.swingA.whip_score}
                    valueB={comparisonData.swingB.whip_score}
                    difference={comparisonData.differences.whip_score}
                  />
                </div>

                {comparisonData.swingA.bat_metrics && comparisonData.swingB.bat_metrics && (
                  <div>
                    <h3 className="font-semibold mb-4">Bat Metrics</h3>
                    <MetricRow
                      label="Bat Speed"
                      valueA={comparisonData.swingA.bat_metrics.bat_speed}
                      valueB={comparisonData.swingB.bat_metrics.bat_speed}
                      difference={comparisonData.differences.bat_speed}
                      unit=" mph"
                    />
                    <MetricRow
                      label="Attack Angle"
                      valueA={comparisonData.swingA.bat_metrics.attack_angle}
                      valueB={comparisonData.swingB.bat_metrics.attack_angle}
                      difference={comparisonData.swingB.bat_metrics.attack_angle - comparisonData.swingA.bat_metrics.attack_angle}
                      unit="°"
                    />
                    <MetricRow
                      label="Time in Zone"
                      valueA={comparisonData.swingA.bat_metrics.time_in_zone}
                      valueB={comparisonData.swingB.bat_metrics.time_in_zone}
                      difference={comparisonData.swingB.bat_metrics.time_in_zone - comparisonData.swingA.bat_metrics.time_in_zone}
                      unit=" ms"
                    />
                  </div>
                )}

                {comparisonData.swingA.ball_metrics && comparisonData.swingB.ball_metrics && (
                  <div>
                    <h3 className="font-semibold mb-4">Ball Metrics</h3>
                    <MetricRow
                      label="Exit Velocity"
                      valueA={comparisonData.swingA.ball_metrics.exit_velocity}
                      valueB={comparisonData.swingB.ball_metrics.exit_velocity}
                      difference={comparisonData.differences.exit_velocity}
                      unit=" mph"
                    />
                  </div>
                )}

                {comparisonData.swingA.body_metrics && comparisonData.swingB.body_metrics && (
                  <div>
                    <h3 className="font-semibold mb-4">Body Metrics</h3>
                    <MetricRow
                      label="Tempo Ratio"
                      valueA={comparisonData.swingA.body_metrics.tempo_ratio}
                      valueB={comparisonData.swingB.body_metrics.tempo_ratio}
                      difference={comparisonData.differences.tempo_ratio}
                      format={(val) => `${val.toFixed(2)}:1`}
                    />
                    <MetricRow
                      label="Sequence Efficiency"
                      valueA={comparisonData.swingA.body_metrics.sequence_efficiency}
                      valueB={comparisonData.swingB.body_metrics.sequence_efficiency}
                      difference={comparisonData.swingB.body_metrics.sequence_efficiency - comparisonData.swingA.body_metrics.sequence_efficiency}
                      unit="%"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
