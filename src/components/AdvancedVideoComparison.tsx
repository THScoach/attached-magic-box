import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw,
  Maximize2,
  Columns2,
  Layers,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoData {
  id: string;
  url: string;
  title: string;
  date: string;
  score: number;
  metrics?: {
    bat_speed?: number;
    exit_velocity?: number;
    launch_angle?: number;
  };
}

interface AdvancedVideoComparisonProps {
  videoA: VideoData;
  videoB: VideoData;
}

type ComparisonMode = "side-by-side" | "overlay" | "split-screen";

export function AdvancedVideoComparison({ videoA, videoB }: AdvancedVideoComparisonProps) {
  const [mode, setMode] = useState<ComparisonMode>("side-by-side");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [opacity, setOpacity] = useState(50);

  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoA = videoRefA.current;
    const videoB = videoRefB.current;

    if (!videoA || !videoB) return;

    const handleTimeUpdate = () => {
      setCurrentTime(videoA.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(Math.max(videoA.duration, videoB.duration));
    };

    videoA.addEventListener("timeupdate", handleTimeUpdate);
    videoA.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      videoA.removeEventListener("timeupdate", handleTimeUpdate);
      videoA.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  const syncVideos = (refA: HTMLVideoElement, refB: HTMLVideoElement) => {
    if (Math.abs(refA.currentTime - refB.currentTime) > 0.1) {
      refB.currentTime = refA.currentTime;
    }
  };

  const handlePlayPause = () => {
    const videoA = videoRefA.current;
    const videoB = videoRefB.current;

    if (!videoA || !videoB) return;

    if (isPlaying) {
      videoA.pause();
      videoB.pause();
    } else {
      syncVideos(videoA, videoB);
      videoA.play();
      videoB.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const videoA = videoRefA.current;
    const videoB = videoRefB.current;

    if (!videoA || !videoB) return;

    const newTime = value[0];
    videoA.currentTime = newTime;
    videoB.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleFrameStep = (direction: "forward" | "backward") => {
    const videoA = videoRefA.current;
    const videoB = videoRefB.current;

    if (!videoA || !videoB) return;

    const frameTime = 1 / 30; // Assuming 30fps
    const newTime = direction === "forward" 
      ? Math.min(currentTime + frameTime, duration)
      : Math.max(currentTime - frameTime, 0);

    videoA.currentTime = newTime;
    videoB.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handlePlaybackRateChange = (rate: string) => {
    const videoA = videoRefA.current;
    const videoB = videoRefB.current;

    if (!videoA || !videoB) return;

    const newRate = parseFloat(rate);
    videoA.playbackRate = newRate;
    videoB.playbackRate = newRate;
    setPlaybackRate(newRate);
  };

  const handleReset = () => {
    const videoA = videoRefA.current;
    const videoB = videoRefB.current;

    if (!videoA || !videoB) return;

    videoA.currentTime = 0;
    videoB.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
    videoA.pause();
    videoB.pause();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Video Comparison</CardTitle>
              <CardDescription>Compare two swings side-by-side</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={mode === "side-by-side" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("side-by-side")}
              >
                <Columns2 className="h-4 w-4 mr-2" />
                Side by Side
              </Button>
              <Button
                variant={mode === "overlay" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("overlay")}
              >
                <Layers className="h-4 w-4 mr-2" />
                Overlay
              </Button>
              <Button
                variant={mode === "split-screen" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("split-screen")}
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Split
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Video Comparison Area */}
      <Card>
        <CardContent className="p-6">
          <div className={cn(
            "relative",
            mode === "side-by-side" && "grid grid-cols-2 gap-4",
            mode === "overlay" && "relative",
            mode === "split-screen" && "relative"
          )}>
            {/* Video A */}
            <div className={cn(
              "relative aspect-video bg-black rounded-lg overflow-hidden",
              mode === "overlay" && "absolute inset-0",
              mode === "split-screen" && "absolute inset-0"
            )}>
              <video
                ref={videoRefA}
                src={videoA.url}
                className="w-full h-full object-contain"
                playsInline
                style={{
                  opacity: mode === "overlay" ? opacity / 100 : 1,
                  clipPath: mode === "split-screen" ? `inset(0 ${100 - opacity}% 0 0)` : "none"
                }}
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-blue-600">
                  {videoA.title} - {videoA.date}
                </Badge>
              </div>
              <div className="absolute bottom-4 left-4 space-y-1">
                <div className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
                  Score: {videoA.score}
                </div>
                {videoA.metrics && (
                  <>
                    {videoA.metrics.bat_speed && (
                      <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                        Bat Speed: {videoA.metrics.bat_speed} mph
                      </div>
                    )}
                    {videoA.metrics.exit_velocity && (
                      <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                        Exit Velo: {videoA.metrics.exit_velocity} mph
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Video B */}
            <div className={cn(
              "relative aspect-video bg-black rounded-lg overflow-hidden",
              mode === "overlay" && "absolute inset-0",
              mode === "split-screen" && "absolute inset-0"
            )}>
              <video
                ref={videoRefB}
                src={videoB.url}
                className="w-full h-full object-contain"
                playsInline
                style={{
                  opacity: mode === "overlay" ? (100 - opacity) / 100 : 1,
                  clipPath: mode === "split-screen" ? `inset(0 0 0 ${opacity}%)` : "none"
                }}
              />
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-600">
                  {videoB.title} - {videoB.date}
                </Badge>
              </div>
              <div className="absolute bottom-4 right-4 space-y-1 text-right">
                <div className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
                  Score: {videoB.score}
                </div>
                {videoB.metrics && (
                  <>
                    {videoB.metrics.bat_speed && (
                      <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                        Bat Speed: {videoB.metrics.bat_speed} mph
                      </div>
                    )}
                    {videoB.metrics.exit_velocity && (
                      <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
                        Exit Velo: {videoB.metrics.exit_velocity} mph
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Opacity/Split Control for Overlay and Split modes */}
            {(mode === "overlay" || mode === "split-screen") && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 bg-black/70 rounded-lg p-4">
                <div className="text-white text-xs mb-2 text-center">
                  {mode === "overlay" ? "Opacity Balance" : "Split Position"}
                </div>
                <Slider
                  value={[opacity]}
                  onValueChange={(value) => setOpacity(value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between mt-2 text-xs text-white/70">
                  <span>Video A</span>
                  <span>Video B</span>
                </div>
              </div>
            )}
          </div>

          {/* Playback Controls */}
          <div className="space-y-4 mt-6">
            {/* Timeline */}
            <div className="space-y-2">
              <Slider
                value={[currentTime]}
                onValueChange={handleSeek}
                min={0}
                max={duration || 100}
                step={0.01}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="icon" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleFrameStep("backward")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  const newTime = Math.max(currentTime - 5, 0);
                  if (videoRefA.current && videoRefB.current) {
                    videoRefA.current.currentTime = newTime;
                    videoRefB.current.currentTime = newTime;
                    setCurrentTime(newTime);
                  }
                }}
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button size="icon" onClick={handlePlayPause}>
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  const newTime = Math.min(currentTime + 5, duration);
                  if (videoRefA.current && videoRefB.current) {
                    videoRefA.current.currentTime = newTime;
                    videoRefB.current.currentTime = newTime;
                    setCurrentTime(newTime);
                  }
                }}
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleFrameStep("forward")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Select value={playbackRate.toString()} onValueChange={handlePlaybackRateChange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.25">0.25x</SelectItem>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="0.75">0.75x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="1.25">1.25x</SelectItem>
                  <SelectItem value="1.5">1.5x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Metrics Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">Metric</div>
            </div>
            <div className="text-center">
              <Badge className="bg-blue-600">{videoA.title}</Badge>
            </div>
            <div className="text-center">
              <Badge className="bg-green-600">{videoB.title}</Badge>
            </div>

            <div className="text-sm font-medium">Overall Score</div>
            <div className="text-center font-bold text-lg">{videoA.score}</div>
            <div className="text-center font-bold text-lg">{videoB.score}</div>

            {videoA.metrics?.bat_speed && videoB.metrics?.bat_speed && (
              <>
                <div className="text-sm font-medium">Bat Speed</div>
                <div className="text-center">{videoA.metrics.bat_speed} mph</div>
                <div className="text-center">{videoB.metrics.bat_speed} mph</div>
              </>
            )}

            {videoA.metrics?.exit_velocity && videoB.metrics?.exit_velocity && (
              <>
                <div className="text-sm font-medium">Exit Velocity</div>
                <div className="text-center">{videoA.metrics.exit_velocity} mph</div>
                <div className="text-center">{videoB.metrics.exit_velocity} mph</div>
              </>
            )}

            {videoA.metrics?.launch_angle && videoB.metrics?.launch_angle && (
              <>
                <div className="text-sm font-medium">Launch Angle</div>
                <div className="text-center">{videoA.metrics.launch_angle}°</div>
                <div className="text-center">{videoB.metrics.launch_angle}°</div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
