import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PillarCard } from "@/components/PillarCard";
import { VelocityChart } from "@/components/VelocityChart";
import { DrillCard } from "@/components/DrillCard";
import { BottomNav } from "@/components/BottomNav";
import { CoachRickChat } from "@/components/CoachRickChat";
import { ResearchBenchmarks } from "@/components/ResearchBenchmarks";
import { TempoRatioCard } from "@/components/TempoRatioCard";
import { CoachRickAvatar } from "@/components/CoachRickAvatar";
import { MasterCoachReport as MasterCoachReportComponent } from "@/components/MasterCoachReport";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { DetailedMetricsView } from "@/components/DetailedMetricsView";
import { COMPathGraph } from "@/components/COMPathGraph";
import { COMPhaseMetrics } from "@/components/COMPhaseMetrics";
import { SwingAvatar3D } from "@/components/SwingAvatar3D";
import { VideoKeyMomentOverlay } from "@/components/VideoKeyMomentOverlay";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp, Target, Play, Pause, MessageCircle, TrendingUp, ChevronLeft, ChevronRight, SkipBack, SkipForward } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { SwingAnalysis } from "@/types/swing";
import { mockDrills } from "@/lib/mockAnalysis";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCoachRickAccess } from "@/hooks/useCoachRickAccess";
import { cn } from "@/lib/utils";
import type { FrameJointData } from "@/lib/poseAnalysis";
import { calculateFrontLegStability } from "@/lib/frontLegStability";
import { calculateWeightTransfer } from "@/lib/weightTransfer";
import { generateMasterCoachReport } from "@/lib/masterCoachReport";

export default function AnalysisResult() {
  const navigate = useNavigate();
  const { analysisId } = useParams<{ analysisId?: string }>();
  const { hasAccess: hasCoachRickAccess } = useCoachRickAccess();
  const [analysis, setAnalysis] = useState<SwingAnalysis | null>(null);
  const [playerName, setPlayerName] = useState<string>('');
  const [jointData, setJointData] = useState<FrameJointData[]>([]);
  const [showDrills, setShowDrills] = useState(false);
  const [showCoachChat, setShowCoachChat] = useState(false);
  const [showDetailedMetrics, setShowDetailedMetrics] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(0.5);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isBuffering, setIsBuffering] = useState(true);
  const [pausedMoments, setPausedMoments] = useState<Set<string>>(new Set());
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameCallbackIdRef = useRef<number | null>(null);
  const FPS = 30; // Frames per second

  useEffect(() => {
    // If accessing via player profile route with analysisId, load from database
    if (analysisId) {
      loadAnalysisFromDatabase(analysisId);
    } else {
      // For /result/latest route, load the most recent analysis from database
      loadLatestAnalysisFromDatabase();
    }
  }, [analysisId]);

  const loadLatestAnalysisFromDatabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to view analysis');
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('swing_analyses')
        .select('*, players(first_name, last_name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      // Set player name
      if (data.players) {
        const player = data.players as any;
        setPlayerName(`${player.first_name} ${player.last_name}`.trim());
      }

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
        loadStartTiming: metrics.loadStartTiming,
        fireStartTiming: metrics.fireStartTiming,
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
        comLateralMovement: metrics.comLateralMovement,
        comForwardMovement: metrics.comForwardMovement,
        comVerticalMovement: metrics.comVerticalMovement,
        comPeakTiming: metrics.comPeakTiming,
        comAccelerationPeak: metrics.comAccelerationPeak,
        frontFootWeightPercent: metrics.frontFootWeightPercent,
        frontFootGRF: metrics.frontFootGRF,
        comCopDistance: metrics.comCopDistance,
        balanceRecoveryTime: metrics.balanceRecoveryTime,
        mlbComparison: metrics.mlbComparison,
        exitVelocity: metrics.exitVelocity,
        launchAngle: metrics.launchAngle,
        projectedDistance: metrics.projectedDistance
      };

      setAnalysis(analysisData);
      
      // Load joint data from database poseData or sessionStorage
      if (metrics.poseData && Array.isArray(metrics.poseData)) {
        console.log(`Loaded ${metrics.poseData.length} frames of joint data from database`);
        setJointData(metrics.poseData);
      } else {
        // Fallback to sessionStorage if database doesn't have pose data
        const storedJointData = sessionStorage.getItem('latestJointData');
        if (storedJointData) {
          try {
            const parsed = JSON.parse(storedJointData);
            setJointData(parsed.frames || []);
            console.log(`Loaded ${parsed.frames?.length || 0} frames of joint data from sessionStorage`);
          } catch (e) {
            console.error('Failed to parse joint data:', e);
          }
        } else {
          console.log('No joint data available in database or sessionStorage');
        }
      }
      
      console.log('Loaded latest analysis from database:', {
        frontFootGRF: analysisData.frontFootGRF,
        comPeakTiming: analysisData.comPeakTiming,
        hasPoseData: !!metrics.poseData
      });
    } catch (error) {
      console.error('Error loading latest analysis:', error);
      toast.error('Failed to load latest analysis');
      navigate('/analyze');
    }
  };

  const loadAnalysisFromDatabase = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('swing_analyses')
        .select('*, players(first_name, last_name)')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Set player name
      if (data.players) {
        const player = data.players as any;
        setPlayerName(`${player.first_name} ${player.last_name}`.trim());
      }

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
        loadStartTiming: metrics.loadStartTiming,
        fireStartTiming: metrics.fireStartTiming,
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
        comLateralMovement: metrics.comLateralMovement,
        comForwardMovement: metrics.comForwardMovement,
        comVerticalMovement: metrics.comVerticalMovement,
        comPeakTiming: metrics.comPeakTiming,
        comAccelerationPeak: metrics.comAccelerationPeak,
        frontFootWeightPercent: metrics.frontFootWeightPercent,
        frontFootGRF: metrics.frontFootGRF,
        comCopDistance: metrics.comCopDistance,
        balanceRecoveryTime: metrics.balanceRecoveryTime,
        mlbComparison: metrics.mlbComparison,
        exitVelocity: metrics.exitVelocity,
        launchAngle: metrics.launchAngle,
        projectedDistance: metrics.projectedDistance
      };

      setAnalysis(analysisData);
      
      // Load joint data from database poseData
      if (metrics.poseData && Array.isArray(metrics.poseData)) {
        console.log(`Loaded ${metrics.poseData.length} frames of joint data from database`);
        setJointData(metrics.poseData);
      } else {
        console.log('No joint data available in database for this analysis');
        setJointData([]);
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
      toast.error('Failed to load analysis');
    }
  };

  const loadAnalysisFromSession = () => {
    const stored = sessionStorage.getItem('latestAnalysis');
    const storedPlayerId = sessionStorage.getItem('selectedPlayerId');
    
    if (stored) {
      const analysisData = JSON.parse(stored);
      console.log('Analysis data:', analysisData);
      console.log('Video URL:', analysisData.videoUrl);
      setAnalysis(analysisData);
      
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
    if (!videoRef.current || isBuffering) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(err => {
        console.error('Play failed:', err);
        toast.error('Unable to play video');
      });
      setIsPlaying(true);
    }
  };

  // Get the actual media time from video (frame-accurate)
  const getMediaTime = (): Promise<number> => {
    return new Promise((resolve) => {
      if (!videoRef.current) {
        resolve(0);
        return;
      }
      
      const video = videoRef.current;
      if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
        video.requestVideoFrameCallback((now, metadata) => {
          resolve(metadata.mediaTime);
        });
      } else {
        resolve(video.currentTime);
      }
    });
  };

  // Frame-accurate step forward
  const stepForward = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    // Pause if playing
    const wasPlaying = !video.paused;
    if (wasPlaying) video.pause();
    
    // Get current frame time
    const firstMediaTime = await getMediaTime();
    
    // Advance until we hit the next frame
    let attempts = 0;
    const maxAttempts = 100;
    while (attempts < maxAttempts) {
      video.currentTime += 0.001; // Small increment
      const newMediaTime = await getMediaTime();
      if (newMediaTime > firstMediaTime) {
        console.log(`Stepped forward from frame at ${firstMediaTime.toFixed(4)}s to ${newMediaTime.toFixed(4)}s`);
        break;
      }
      attempts++;
    }
    
    if (attempts >= maxAttempts) {
      console.warn('Could not find next frame, using fallback');
      video.currentTime += 1 / FPS;
    }
  };

  // Frame-accurate step backward
  const stepBackward = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    
    // Pause if playing
    const wasPlaying = !video.paused;
    if (wasPlaying) video.pause();
    
    // Get current frame time
    const firstMediaTime = await getMediaTime();
    
    // Go back until we hit the previous frame
    let attempts = 0;
    const maxAttempts = 100;
    while (attempts < maxAttempts) {
      video.currentTime -= 0.001; // Small decrement
      const newMediaTime = await getMediaTime();
      if (newMediaTime < firstMediaTime) {
        console.log(`Stepped backward from frame at ${firstMediaTime.toFixed(4)}s to ${newMediaTime.toFixed(4)}s`);
        break;
      }
      attempts++;
    }
    
    if (attempts >= maxAttempts) {
      console.warn('Could not find previous frame, using fallback');
      video.currentTime = Math.max(0, video.currentTime - 1 / FPS);
    }
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
    const targetTime = percentage * videoRef.current.duration;
    
    // Snap to nearest frame boundary
    const targetFrame = Math.round(targetTime * FPS);
    const snappedTime = targetFrame / FPS;
    
    videoRef.current.currentTime = snappedTime;
    console.log(`Seeked to frame ${targetFrame} at ${snappedTime.toFixed(4)}s`);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || !analysis) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Auto-pause at key moments if video is playing
    if (isPlaying) {
      const tolerance = 0.05; // 50ms tolerance
      const keyMoments = [
        { time: duration - Math.abs(analysis.loadStartTiming || 900) / 1000, label: "Load Start" },
        { time: duration - Math.abs(analysis.fireStartTiming || 340) / 1000, label: "Fire Phase" },
        { time: duration - Math.abs(analysis.pelvisTiming || 180) / 1000, label: "Pelvis Peak" },
        { time: duration - Math.abs(analysis.torsoTiming || 120) / 1000, label: "Torso Peak" },
        { time: duration - Math.abs(analysis.handsTiming || 60) / 1000, label: "Hands Peak" },
        { time: duration, label: "Contact" }
      ];

      for (const moment of keyMoments) {
        const momentKey = `${moment.label}-${moment.time.toFixed(2)}`;
        if (Math.abs(time - moment.time) < tolerance && !pausedMoments.has(momentKey)) {
          // Pause the video
          videoRef.current.pause();
          setIsPlaying(false);
          
          // Mark this moment as paused
          setPausedMoments(prev => new Set(prev).add(momentKey));
          
          // Resume after 1.5 seconds
          if (pauseTimeoutRef.current) {
            clearTimeout(pauseTimeoutRef.current);
          }
          pauseTimeoutRef.current = setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.play();
              setIsPlaying(true);
            }
          }, 1500);
          
          break; // Only pause for one moment at a time
        }
      }
    }
  };

  // Clear pause timeout and reset paused moments when video loops
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setPausedMoments(new Set());
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };

    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  // Reset paused moments when seeking manually
  const resetPausedMoments = () => {
    setPausedMoments(new Set());
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    setDuration(video.duration);
    video.playbackRate = playbackRate;
    
    console.log('Video metadata loaded:');
    console.log('- Duration:', video.duration, 'seconds');
    console.log('- Video dimensions:', video.videoWidth, 'x', video.videoHeight);
    console.log('- Playback rate:', video.playbackRate);
    
    // Calculate approximate total frames
    const totalFrames = Math.round(video.duration * FPS);
    console.log('- Approximate frames (at 30fps):', totalFrames);
  };

  const handleCanPlay = () => {
    console.log('Video can play - buffered enough');
    setIsBuffering(false);
  };

  const handleWaiting = () => {
    console.log('Video waiting - buffering');
    setIsBuffering(true);
  };

  const handleCanPlayThrough = () => {
    console.log('Video loaded successfully - can play through');
    setIsBuffering(false);
    
    // Autoplay the video once fully loaded
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log('Autoplay prevented:', err);
      });
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    toast.info(`Playback speed: ${rate}x`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Frame-accurate video playback using requestVideoFrameCallback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check if requestVideoFrameCallback is supported
    if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
      const updateFrame = (now: number, metadata: any) => {
        // Update frame count based on actual video frame metadata
        if (metadata.mediaTime !== undefined) {
          const frameNum = Math.round(metadata.mediaTime * FPS);
          setCurrentFrame(frameNum);
          
          // Log frame info periodically (every 30 frames)
          if (frameNum % 30 === 0) {
            console.log('Frame:', frameNum, 'Time:', metadata.mediaTime.toFixed(3), 'Presented frames:', metadata.presentedFrames);
          }
        }
        
        // Re-register callback for next frame
        if (video && !video.paused && !video.ended) {
          frameCallbackIdRef.current = video.requestVideoFrameCallback(updateFrame);
        }
      };

      // Start frame callback when video plays
      const handlePlay = () => {
        if (frameCallbackIdRef.current !== null) {
          video.cancelVideoFrameCallback(frameCallbackIdRef.current);
        }
        frameCallbackIdRef.current = video.requestVideoFrameCallback(updateFrame);
      };

      // Cancel frame callback when video pauses
      const handlePause = () => {
        if (frameCallbackIdRef.current !== null) {
          video.cancelVideoFrameCallback(frameCallbackIdRef.current);
          frameCallbackIdRef.current = null;
        }
      };

      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('ended', handlePause);

      // Cleanup
      return () => {
        if (frameCallbackIdRef.current !== null) {
          video.cancelVideoFrameCallback(frameCallbackIdRef.current);
        }
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('ended', handlePause);
      };
    } else {
      // Fallback for browsers without requestVideoFrameCallback
      console.warn('requestVideoFrameCallback not supported, using fallback');
    }
  }, [analysis, FPS]);

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
        <h1 className="text-2xl font-bold mb-2">
          {playerName ? `${playerName} - Swing Analysis` : 'Swing Analysis'}
        </h1>
        <p className="text-muted-foreground">
          {new Date(analysis.analyzedAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Video Player and 3D Motion Tabs */}
        <Tabs defaultValue="video" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="video">Video Analysis</TabsTrigger>
            <TabsTrigger value="motion">3D Motion</TabsTrigger>
          </TabsList>
          
          <TabsContent value="video" className="mt-4">
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
                      onCanPlay={handleCanPlay}
                      onCanPlayThrough={handleCanPlayThrough}
                      onWaiting={handleWaiting}
                      onTimeUpdate={handleTimeUpdate}
                      loop
                      playsInline
                      preload="auto"
                    />
                    
                    {/* Buffering Indicator */}
                    {isBuffering && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="flex flex-col items-center gap-2">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
                          <p className="text-white text-sm">Loading video...</p>
                        </div>
                      </div>
                    )}

                    {/* Key Moment Overlays */}
                    <VideoKeyMomentOverlay
                      analysis={analysis}
                      currentTime={currentTime}
                      duration={duration}
                      videoWidth={videoRef.current?.videoWidth || 1920}
                      videoHeight={videoRef.current?.videoHeight || 1080}
                      onSeekToMoment={(time) => {
                        if (videoRef.current) {
                          resetPausedMoments();
                          videoRef.current.currentTime = time;
                          videoRef.current.pause();
                          setIsPlaying(false);
                        }
                      }}
                    />

                    {/* Play/Pause Overlay */}
                    <div 
                      className={cn(
                        "absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity",
                        isBuffering ? "cursor-wait" : "cursor-pointer"
                      )}
                      onClick={togglePlayPause}
                    >
                      {isPlaying ? (
                        <Pause className="h-20 w-20 text-white/80 group-hover:scale-110 transition-transform" />
                      ) : (
                        <Play className="h-20 w-20 text-white/80 group-hover:scale-110 transition-transform" />
                      )}
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

                      {/* Playback Speed Control */}
                      <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/10">
                        {[0.25, 0.5, 1, 2].map((rate) => (
                          <Button
                            key={rate}
                            size="sm"
                            variant={playbackRate === rate ? "default" : "ghost"}
                            className={cn(
                              "h-7 px-2 text-xs",
                              playbackRate === rate 
                                ? "text-primary-foreground" 
                                : "text-white/70 hover:text-white hover:bg-white/10"
                            )}
                            onClick={() => changePlaybackRate(rate)}
                          >
                            {rate}x
                          </Button>
                        ))}
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
          </TabsContent>

          {/* 3D Motion Tab */}
          <TabsContent value="motion" className="mt-4">
            <Card className="overflow-hidden">
              <div className="aspect-video">
                <SwingAvatar3D 
                  poseData={jointData}
                  currentTime={currentTime}
                  duration={duration}
                />
              </div>
              
              {/* Video Controls Synced Below 3D View */}
              <div className="border-t bg-muted/50 p-4">
                <div className="flex items-center gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={skipBackward}
                    title="Back 1 second"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={stepBackward}
                    title="Back 1 frame"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    size="default"
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
                    onClick={stepForward}
                    title="Forward 1 frame"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={skipForward}
                    title="Forward 1 second"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex-1 text-sm font-mono ml-4">
                    <span className="font-semibold">{formatTime(currentTime)}</span>
                    <span className="text-muted-foreground"> / </span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {[0.25, 0.5, 1].map((rate) => (
                      <Button
                        key={rate}
                        size="sm"
                        variant={playbackRate === rate ? "default" : "ghost"}
                        onClick={() => changePlaybackRate(rate)}
                      >
                        {rate}x
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

        </Tabs>


        {/* Overall H.I.T.S. Score */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <p className="text-sm text-muted-foreground">Overall H.I.T.S. Score</p>
              <InfoTooltip content="Your overall hitting performance score (0-100). Combines timing, power, and mechanics. Higher scores mean better swing efficiency and more consistent hard contact." />
            </div>
            <div className="text-6xl font-bold text-primary mb-2">{analysis.hitsScore}</div>
          </div>
        </Card>

        {/* Enhanced Tempo Ratio Display */}
        <TempoRatioCard 
          tempoRatio={analysis.tempoRatio}
          loadStartTiming={analysis.loadStartTiming}
          fireStartTiming={analysis.fireStartTiming}
        />

        {/* Three Pillars - Condensed */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">The Three Pillars</h2>
              <InfoTooltip content="ANCHOR = Balance & stability. ENGINE = Timing & sequence (kinetic chain). WHIP = Acceleration & release. Master all three for elite hitting." />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDetailedMetrics(true)}
              className="text-xs"
            >
              View Details
            </Button>
          </div>
          <div className="space-y-3">
            <PillarCard 
              pillar="ANCHOR" 
              score={analysis.anchorScore}
              subtitle="Stability & Ground Force"
              jointData={jointData}
              videoWidth={1920}
              videoHeight={1080}
            />
            <PillarCard 
              pillar="ENGINE" 
              score={analysis.engineScore}
              subtitle="Tempo & Sequence"
              jointData={jointData}
              videoWidth={1920}
              videoHeight={1080}
            />
            <PillarCard 
              pillar="WHIP" 
              score={analysis.whipScore}
              subtitle="Release & Acceleration"
              jointData={jointData}
              videoWidth={1920}
              videoHeight={1080}
            />
          </div>
        </section>

        {/* AI Coach Feedback - Your #1 Opportunity */}
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

        {/* Coach Rick Report - Condensed at bottom */}
        {jointData.length > 0 && (() => {
          const stability = calculateFrontLegStability(jointData);
          const weightTransfer = calculateWeightTransfer(jointData);
          const report = generateMasterCoachReport(
            'Player',
            analysis,
            jointData,
            stability,
            weightTransfer
          );
          return <MasterCoachReportComponent report={report} />;
        })()}
      </div>

      {/* Detailed Metrics Sheet */}
      <DetailedMetricsView
        isOpen={showDetailedMetrics}
        onClose={() => setShowDetailedMetrics(false)}
        analysis={analysis}
        jointData={jointData}
        videoWidth={videoRef.current?.videoWidth || 1920}
        videoHeight={videoRef.current?.videoHeight || 1080}
      />

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
