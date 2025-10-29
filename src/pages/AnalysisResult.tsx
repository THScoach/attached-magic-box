import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PillarCard } from "@/components/PillarCard";
import { VelocityChart } from "@/components/VelocityChart";
import { DrillCard } from "@/components/DrillCard";
import { DrillFeedbackChat } from "@/components/DrillFeedbackChat";
import { BottomNav } from "@/components/BottomNav";
import { CoachRickChat } from "@/components/CoachRickChat";
import { RebootStyleMetrics } from "@/components/RebootStyleMetrics";
import { ChevronDown, ChevronUp, Target, Play, Pause, MessageCircle, TrendingUp, History, ChevronLeft, ChevronRight, SkipBack, SkipForward } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SwingAnalysis } from "@/types/swing";
import { generateVelocityData, mockDrills } from "@/lib/mockAnalysis";
import { toast } from "sonner";
import { drawSkeletonOnCanvas, PoseData } from "@/lib/videoAnalysis";
import { supabase } from "@/integrations/supabase/client";
import { useCoachRickAccess } from "@/hooks/useCoachRickAccess";

export default function AnalysisResult() {
  const navigate = useNavigate();
  const { hasAccess: hasCoachRickAccess } = useCoachRickAccess();
  const [analysis, setAnalysis] = useState<SwingAnalysis | null>(null);
  const [showDrills, setShowDrills] = useState(false);
  const [showCoachChat, setShowCoachChat] = useState(false);
  const [showDrillFeedback, setShowDrillFeedback] = useState(false);
  const [videoType, setVideoType] = useState<'analysis' | 'drill'>('analysis');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [sessionSwings, setSessionSwings] = useState<any[]>([]);
  const [sessionStats, setSessionStats] = useState<{ total: number; avg: number } | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const velocityData = generateVelocityData();
  const FPS = 30; // Frames per second

  useEffect(() => {
    const stored = sessionStorage.getItem('latestAnalysis');
    const analysisType = sessionStorage.getItem('latestAnalysisType') || 'analysis';
    if (stored) {
      const analysisData = JSON.parse(stored);
      console.log('Analysis data:', analysisData);
      console.log('Video URL:', analysisData.videoUrl);
      setAnalysis(analysisData);
      setVideoType(analysisType as 'analysis' | 'drill');
      
      // For drills, automatically show feedback chat
      if (analysisType === 'drill') {
        setShowDrillFeedback(true);
      }
      
      // Load session data and create training program
      const loadSessionData = async () => {
        const sessionId = sessionStorage.getItem('currentSessionId');
        if (!sessionId) return;
        
        const { data: swings } = await supabase
          .from('swing_analyses')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false });
        
        if (swings && swings.length > 0) {
          setSessionSwings(swings);
          const avgScore = swings.reduce((sum, s) => sum + Number(s.overall_score), 0) / swings.length;
          setSessionStats({
            total: swings.length,
            avg: avgScore
          });

          // Create training program for the latest analysis
          const { data: { user } } = await supabase.auth.getUser();
          if (user && swings[0]) {
            // Determine focus pillar based on lowest score
            const latestAnalysis = swings[0];
            const scores = {
              ANCHOR: Number(latestAnalysis.anchor_score),
              ENGINE: Number(latestAnalysis.engine_score),
              WHIP: Number(latestAnalysis.whip_score)
            };
            const focusPillar = Object.entries(scores).reduce((a, b) => 
              a[1] < b[1] ? a : b
            )[0];

            // Check if program already exists for this analysis
            const { data: existingProgram } = await supabase
              .from('training_programs')
              .select('id')
              .eq('analysis_id', latestAnalysis.id)
              .single();

            if (!existingProgram) {
              // Deactivate old programs
              await supabase
                .from('training_programs')
                .update({ is_active: false })
                .eq('user_id', user.id);

              // Create new program
              await supabase
                .from('training_programs')
                .insert({
                  user_id: user.id,
                  analysis_id: latestAnalysis.id,
                  focus_pillar: focusPillar,
                  is_active: true
                });

              // Initialize gamification if not exists
              const { data: gamData } = await supabase
                .from('user_gamification')
                .select('id')
                .eq('user_id', user.id)
                .single();

              if (!gamData) {
                await supabase
                  .from('user_gamification')
                  .insert({
                    user_id: user.id
                  });
              }

              toast.success("New 4-week training program created!");
            }
          }
        }
      };
      
      loadSessionData();
    } else {
      navigate('/analyze');
    }
  }, [navigate]);

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error('Video error:', e);
    console.error('Video element:', videoRef.current);
    console.error('Video src:', videoRef.current?.src);
    toast.error('Unable to load video. Please try analyzing again.');
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleSkeleton = () => {
    setShowSkeleton(!showSkeleton);
    if (!showSkeleton && analysis?.poseData) {
      toast.success("Skeleton overlay enabled");
    } else if (showSkeleton) {
      toast.info("Skeleton overlay disabled");
    } else {
      toast.info("No pose data available for this analysis");
    }
  };

  const stepForward = () => {
    if (!videoRef.current) return;
    const frameTime = 1 / FPS;
    videoRef.current.currentTime = Math.min(
      videoRef.current.currentTime + frameTime,
      videoRef.current.duration
    );
  };

  const stepBackward = () => {
    if (!videoRef.current) return;
    const frameTime = 1 / FPS;
    videoRef.current.currentTime = Math.max(
      videoRef.current.currentTime - frameTime,
      0
    );
  };

  const skipBackward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      videoRef.current.currentTime - 1,
      0
    );
  };

  const skipForward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(
      videoRef.current.currentTime + 1,
      videoRef.current.duration
    );
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    videoRef.current.currentTime = percentage * videoRef.current.duration;
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    setCurrentFrame(Math.floor(time * FPS));
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    console.log('Video loaded successfully');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Update skeleton drawing during video playback
  useEffect(() => {
    if (!showSkeleton || !analysis?.poseData || !videoRef.current || !canvasRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const poseData = analysis.poseData as PoseData[];

    const updateSkeleton = () => {
      if (!video || !canvas) return;

      const currentTime = video.currentTime * 1000; // Convert to milliseconds
      
      // Find the closest pose data to current video time
      const closestPose = poseData.reduce((prev, curr) => {
        return Math.abs(curr.timestamp - currentTime) < Math.abs(prev.timestamp - currentTime) 
          ? curr 
          : prev;
      });

      if (closestPose) {
        drawSkeletonOnCanvas(
          canvas,
          closestPose.keypoints,
          video.videoWidth,
          video.videoHeight
        );
      }
    };

    const intervalId = setInterval(updateSkeleton, 33); // ~30fps

    return () => clearInterval(intervalId);
  }, [showSkeleton, analysis, isPlaying]);

  if (!analysis) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p>Loading analysis...</p>
    </div>;
  }

  const recommendedDrills = mockDrills.slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-engine/20 via-anchor/10 to-whip/10 px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold mb-2">Swing Analysis</h1>
        <p className="text-muted-foreground">
          {new Date(analysis.analyzedAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Session Progress Card */}
        {sessionStats && sessionStats.total > 1 && (
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Session Progress</p>
                <div className="flex gap-4 mt-1">
                  <span className="text-lg font-bold">Swing #{sessionStats.total}</span>
                  <span className="text-lg font-bold text-primary">
                    {sessionStats.avg.toFixed(1)} avg
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.info("Viewing session history coming soon!")}
              >
                <History className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Video Player */}
        <Card className="overflow-hidden">
          <div className="aspect-video bg-black relative group">
            {analysis.videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={analysis.videoUrl}
                  className="w-full h-full object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onError={handleVideoError}
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  loop
                  playsInline
                />

                {/* Skeleton Overlay Canvas */}
                {showSkeleton && analysis.poseData && (
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ mixBlendMode: 'screen' }}
                  />
                )}
                
                {/* Play/Pause Overlay */}
                <div 
                  className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="h-20 w-20 text-white/80 group-hover:scale-110 transition-transform" />
                  ) : (
                    <Play className="h-20 w-20 text-white/80 group-hover:scale-110 transition-transform" />
                  )}
                </div>

                {/* Overlay Controls */}
                <div className="absolute top-4 left-4 right-4 flex gap-2">
                  <Button 
                    size="sm" 
                    variant={showSkeleton ? "default" : "secondary"}
                    className="text-xs"
                    onClick={toggleSkeleton}
                    disabled={!analysis.poseData}
                  >
                    Skeleton
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="text-xs"
                    onClick={() => toast.info("Timing overlay coming soon!")}
                  >
                    Timing
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="text-xs"
                    onClick={() => toast.info("COM Path overlay coming soon!")}
                  >
                    COM Path
                  </Button>
                </div>

                {/* Bottom Controls - Modern Video Player */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/90 to-transparent pt-12 pb-4 px-4">
                  {/* Progress Bar */}
                  <div 
                    className="w-full h-1.5 bg-white/20 rounded-full mb-3 cursor-pointer group/progress hover:h-2 transition-all"
                    onClick={handleSeek}
                  >
                    <div 
                      className="h-full bg-primary rounded-full relative group-hover/progress:bg-primary/90 transition-colors"
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Controls Row */}
                  <div className="flex items-center gap-2">
                    {/* Frame Navigation */}
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-white hover:bg-white/20"
                        onClick={skipBackward}
                        title="Back 1 second"
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-white hover:bg-white/20"
                        onClick={stepBackward}
                        title="Back 1 frame"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 w-9 p-0 text-white hover:bg-white/20"
                        onClick={togglePlayPause}
                      >
                        {isPlaying ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-white hover:bg-white/20"
                        onClick={stepForward}
                        title="Forward 1 frame"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-white hover:bg-white/20"
                        onClick={skipForward}
                        title="Forward 1 second"
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Time Display */}
                    <div className="flex-1 text-white text-xs font-mono ml-2">
                      <span className="font-semibold">{formatTime(currentTime)}</span>
                      <span className="text-white/50"> / </span>
                      <span className="text-white/70">{formatTime(duration)}</span>
                    </div>

                    {/* Frame Counter */}
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                      <span className="text-white/70 text-xs">Frame</span>
                      <span className="text-white font-mono font-bold text-sm">{currentFrame}</span>
                      <span className="text-white/50 text-xs">/ {Math.floor(duration * FPS)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                <p>No video available</p>
              </div>
            )}
          </div>
        </Card>

        {/* Overall H.I.T.S. Score */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Overall H.I.T.S. Score</p>
            <div className="text-6xl font-bold text-primary mb-2">{analysis.hitsScore}</div>
            <p className="text-lg font-medium">Tempo Ratio: {analysis.tempoRatio}:1</p>
          </div>
        </Card>

        {/* Three Pillars */}
        <section>
          <h2 className="text-lg font-bold mb-3">The Three Pillars</h2>
          <div className="space-y-3">
            <PillarCard 
              pillar="ANCHOR" 
              score={analysis.anchorScore}
              subtitle="Stability & Ground Force"
            />
            <PillarCard 
              pillar="ENGINE" 
              score={analysis.engineScore}
              subtitle="Tempo & Sequence"
            />
            <PillarCard 
              pillar="WHIP" 
              score={analysis.whipScore}
              subtitle="Release & Acceleration"
            />
          </div>
        </section>

        {/* Reboot-Style Metrics */}
        <RebootStyleMetrics analysis={analysis} />

        {/* Velocity Chart */}
        <VelocityChart data={velocityData} />

        {/* Drill Feedback for Training Drills */}
        {videoType === 'drill' && showDrillFeedback && analysis.id && (
          <DrillFeedbackChat 
            analysisId={analysis.id}
            drillName="Training Drill"
            onComplete={() => {
              setShowDrillFeedback(false);
              toast.success("Drill feedback saved!");
            }}
          />
        )}

        {/* AI Coach Feedback */}
        <Card className="p-6 bg-blue-500/10 border-blue-500/20">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Target className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Your #1 Opportunity</h3>
            </div>
          </div>
          
          <p className="mb-3 text-foreground">
            {analysis.primaryOpportunity}
          </p>
          
          <p className="text-sm text-muted-foreground mb-4">
            💪 {analysis.impactStatement}
          </p>
          
          <Button className="w-full" onClick={() => setShowDrills(true)}>
            Show Me The Fix
          </Button>
        </Card>

        {/* Recommended Drills */}
        <section>
          <button
            onClick={() => setShowDrills(!showDrills)}
            className="flex items-center justify-between w-full mb-3"
          >
            <h2 className="text-lg font-bold">Recommended Drills</h2>
            {showDrills ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {showDrills && (
            <div className="grid gap-4">
              {recommendedDrills.map(drill => (
                <DrillCard 
                  key={drill.id} 
                  drill={drill}
                  onViewDrill={(id) => {
                    toast.info("Drill details coming soon!");
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Action Buttons */}
        <div className="grid gap-3">
          <Button 
            size="lg"
            className="w-full"
            onClick={() => {
              if (hasCoachRickAccess) {
                setShowCoachChat(true);
              } else {
                toast.error("Upgrade Required", {
                  description: "Chat with Coach Rick is available in Challenge, DIY, and Elite tiers",
                  action: {
                    label: "Upgrade",
                    onClick: () => window.open("https://whop.com/your-product", "_blank")
                  }
                });
              }
            }}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Chat with Coach Rick {!hasCoachRickAccess && "🔒"}
          </Button>
          <Button 
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => navigate('/analyze')}
          >
            Analyze Another Swing
          </Button>
          <Button 
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => navigate('/progress')}
          >
            View Progress
          </Button>
        </div>
      </div>

      {/* Coach Rick Chat Modal */}
      {showCoachChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl">
            <CoachRickChat 
              analysis={analysis}
              onClose={() => setShowCoachChat(false)}
            />
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
