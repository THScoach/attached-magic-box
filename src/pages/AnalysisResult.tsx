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
import { CoachRickAvatar } from "@/components/CoachRickAvatar";
import { ChevronDown, ChevronUp, Target, Play, Pause, MessageCircle, TrendingUp, History, ChevronLeft, ChevronRight, SkipBack, SkipForward } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { SwingAnalysis } from "@/types/swing";
import { generateVelocityData, mockDrills } from "@/lib/mockAnalysis";
import { toast } from "sonner";
import { drawSkeletonOnCanvas, PoseData } from "@/lib/videoAnalysis";
import { supabase } from "@/integrations/supabase/client";
import { useCoachRickAccess } from "@/hooks/useCoachRickAccess";

export default function AnalysisResult() {
  const navigate = useNavigate();
  const { analysisId } = useParams<{ analysisId?: string }>();
  const { hasAccess: hasCoachRickAccess } = useCoachRickAccess();
  const [analysis, setAnalysis] = useState<SwingAnalysis | null>(null);
  const [showDrills, setShowDrills] = useState(false);
  const [showCoachChat, setShowCoachChat] = useState(false);
  const [showDrillFeedback, setShowDrillFeedback] = useState(false);
  const [videoType, setVideoType] = useState<'analysis' | 'drill'>('analysis');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showTiming, setShowTiming] = useState(false);
  const [showCOMPath, setShowCOMPath] = useState(false);
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
    // If accessing via player profile route with analysisId, load from database
    if (analysisId) {
      loadAnalysisFromDatabase(analysisId);
    } else {
      // Otherwise load from sessionStorage (legacy behavior)
      loadAnalysisFromSession();
    }
  }, [analysisId]);

  const loadAnalysisFromDatabase = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('swing_analyses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Convert database format to SwingAnalysis format
      const metrics = (data.metrics as any) || {};
      const analysisData: SwingAnalysis = {
        id: data.id,
        videoUrl: data.video_url || '',
        analyzedAt: new Date(data.created_at),
        hitsScore: Number(data.overall_score),
        anchorScore: Number(data.anchor_score),
        engineScore: Number(data.engine_score),
        whipScore: Number(data.whip_score),
        tempoRatio: metrics.tempoRatio || 0,
        primaryOpportunity: metrics.primaryOpportunity,
        impactStatement: metrics.impactStatement,
        recommendedDrills: metrics.recommendedDrills || [],
        poseData: metrics.poseData,
        pelvisTiming: metrics.pelvisTiming,
        torsoTiming: metrics.torsoTiming,
        handsTiming: metrics.handsTiming,
        pelvisMaxVelocity: metrics.pelvisMaxVelocity,
        torsoMaxVelocity: metrics.torsoMaxVelocity,
        armMaxVelocity: metrics.armMaxVelocity,
        batMaxVelocity: metrics.batMaxVelocity,
        xFactor: metrics.xFactor,
        xFactorStance: metrics.xFactorStance,
        pelvisRotation: metrics.pelvisRotation,
        shoulderRotation: metrics.shoulderRotation,
        comDistance: metrics.comDistance,
        comMaxVelocity: metrics.comMaxVelocity,
        mlbComparison: metrics.mlbComparison,
        exitVelocity: metrics.exitVelocity,
        launchAngle: metrics.launchAngle,
        projectedDistance: metrics.projectedDistance
      };

      setAnalysis(analysisData);
      setVideoType(data.video_type as 'analysis' | 'drill');
    } catch (error) {
      console.error('Error loading analysis:', error);
      toast.error('Failed to load analysis');
    }
  };

  const loadAnalysisFromSession = () => {
    const stored = sessionStorage.getItem('latestAnalysis');
    const analysisType = sessionStorage.getItem('latestAnalysisType') || 'analysis';
    const storedPlayerId = sessionStorage.getItem('selectedPlayerId');
    
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
      loadSessionData();
    } else {
      toast.error('No analysis data found');
      // Navigate back to player profile if we have a player ID, otherwise to analyze
      if (storedPlayerId) {
        navigate(`/player/${storedPlayerId}`);
      } else {
        navigate('/analyze');
      }
    }
  };

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
    setShowTiming(false);
    setShowCOMPath(false);
    if (!showSkeleton && analysis?.poseData) {
      toast.success("Skeleton overlay enabled");
    } else if (showSkeleton) {
      toast.info("Skeleton overlay disabled");
    } else {
      toast.info("No pose data available for this analysis");
    }
  };

  const toggleTiming = () => {
    setShowTiming(!showTiming);
    setShowSkeleton(false);
    setShowCOMPath(false);
    if (!showTiming) {
      toast.success("Timing overlay enabled");
    } else {
      toast.info("Timing overlay disabled");
    }
  };

  const toggleCOMPath = () => {
    setShowCOMPath(!showCOMPath);
    setShowSkeleton(false);
    setShowTiming(false);
    if (!showCOMPath) {
      toast.success("COM Path overlay enabled");
    } else {
      toast.info("COM Path overlay disabled");
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
    
    // Autoplay the video
    videoRef.current.play().catch(err => {
      console.log('Autoplay prevented:', err);
      // Autoplay might be blocked by browser policy, that's okay
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Update overlays during video playback
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;
    if (!showSkeleton && !showTiming && !showCOMPath) {
      // Clear canvas when no overlay is shown
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const updateOverlay = () => {
      if (!video || !canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size to match video
      canvas.width = video.videoWidth || video.clientWidth;
      canvas.height = video.videoHeight || video.clientHeight;

      // Clear previous frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (showSkeleton && analysis?.poseData) {
        const poseData = analysis.poseData as PoseData[];
        const currentTime = video.currentTime * 1000;
        const closestPose = poseData.reduce((prev, curr) => {
          return Math.abs(curr.timestamp - currentTime) < Math.abs(prev.timestamp - currentTime) 
            ? curr 
            : prev;
        });

        if (closestPose) {
          drawSkeletonOnCanvas(canvas, closestPose.keypoints, canvas.width, canvas.height);
        }
      }

      if (showTiming && analysis) {
        drawTimingOverlay(ctx, canvas.width, canvas.height, currentFrame, analysis);
      }

      if (showCOMPath && analysis) {
        drawCOMPathOverlay(ctx, canvas.width, canvas.height, currentFrame);
      }
    };

    const intervalId = setInterval(updateOverlay, 33); // ~30fps
    return () => clearInterval(intervalId);
  }, [showSkeleton, showTiming, showCOMPath, analysis, isPlaying, currentFrame]);

  const drawTimingOverlay = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number,
    frame: number,
    analysis: SwingAnalysis
  ) => {
    const totalFrames = Math.floor(duration * FPS);
    
    // Draw timing markers for pelvis, torso, and hands
    const timingEvents = [
      { label: 'Pelvis', frame: analysis.pelvisTiming ? Math.floor((analysis.pelvisTiming / 1000) * FPS) : null, color: '#FF6B6B' },
      { label: 'Torso', frame: analysis.torsoTiming ? Math.floor((analysis.torsoTiming / 1000) * FPS) : null, color: '#4ECDC4' },
      { label: 'Hands', frame: analysis.handsTiming ? Math.floor((analysis.handsTiming / 1000) * FPS) : null, color: '#95E1D3' }
    ];

    timingEvents.forEach((event, index) => {
      if (event.frame === null || event.frame === undefined) return;
      
      const x = (event.frame / totalFrames) * width;
      
      // Draw vertical line
      ctx.strokeStyle = event.color;
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw label at top
      ctx.fillStyle = event.color;
      ctx.font = 'bold 16px sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(event.label, x + 5, 30 + (index * 25));
      ctx.shadowBlur = 0;
    });

    // Draw current frame indicator
    const currentX = (frame / totalFrames) * width;
    ctx.strokeStyle = '#FFD93D';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(currentX, 0);
    ctx.lineTo(currentX, height);
    ctx.stroke();
  };

  const drawCOMPathOverlay = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    frame: number
  ) => {
    // Simulate COM path based on frame progression
    // In a real implementation, this would use actual COM tracking data
    const totalFrames = Math.floor(duration * FPS);
    const progress = frame / totalFrames;
    
    // Draw COM path (simplified visualization)
    const centerX = width / 2;
    const centerY = height / 2;
    const pathLength = width * 0.3;
    
    ctx.strokeStyle = '#6C5CE7';
    ctx.lineWidth = 4;
    ctx.shadowColor = 'rgba(108, 92, 231, 0.6)';
    ctx.shadowBlur = 10;
    
    // Draw the path up to current frame
    ctx.beginPath();
    for (let i = 0; i <= Math.min(frame, totalFrames); i++) {
      const t = i / totalFrames;
      const x = centerX - pathLength/2 + (pathLength * t);
      const y = centerY + Math.sin(t * Math.PI) * 50; // Slight arc
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // Draw current COM position
    const currentX = centerX - pathLength/2 + (pathLength * progress);
    const currentY = centerY + Math.sin(progress * Math.PI) * 50;
    
    ctx.fillStyle = '#6C5CE7';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(currentX, currentY, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw COM label
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px sans-serif';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText('COM', currentX + 12, currentY - 10);
  };

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

                {/* Overlay Canvas */}
                {(showSkeleton || showTiming || showCOMPath) && (
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
                    variant={showTiming ? "default" : "secondary"}
                    className="text-xs"
                    onClick={toggleTiming}
                  >
                    Timing
                  </Button>
                  <Button 
                    size="sm" 
                    variant={showCOMPath ? "default" : "secondary"}
                    className="text-xs"
                    onClick={toggleCOMPath}
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
          <div className="flex items-start gap-4 mb-4">
            <CoachRickAvatar size="md" className="shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">Coach Rick Says:</h3>
              <p className="text-sm text-muted-foreground">Your #1 Opportunity</p>
            </div>
          </div>
          
          <div className="relative ml-0 md:ml-36">
            <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
              <p className="mb-3 text-foreground font-medium">
                {analysis.primaryOpportunity}
              </p>
              
              <p className="text-sm text-muted-foreground mb-4">
                💪 {analysis.impactStatement}
              </p>
              
              <Button className="w-full" onClick={() => setShowDrills(true)}>
                Show Me The Fix
              </Button>
            </div>
          </div>
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
