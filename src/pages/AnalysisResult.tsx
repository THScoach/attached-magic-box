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
import { BatSpeedQualityCard } from "@/components/BatSpeedQualityCard";
import { MasterCoachReport as MasterCoachReportComponent } from "@/components/MasterCoachReport";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { DetailedMetricsView } from "@/components/DetailedMetricsView";
import { COMPathGraph } from "@/components/COMPathGraph";
import { COMPhaseMetrics } from "@/components/COMPhaseMetrics";
import { SwingAvatar3D } from "@/components/SwingAvatar3D";
import { ReanalyzeButton } from "@/components/ReanalyzeButton";
import { VideoAnalysisWithMarkup } from "@/components/VideoAnalysisWithMarkup";
import { PoseSkeletonOverlay } from "@/components/PoseSkeletonOverlay";
import { SwingPhaseTimeline } from "@/components/SwingPhaseTimeline";
import { DrillRecommendations } from "@/components/DrillRecommendations";
import { AIDrillRecommendations } from "@/components/AIDrillRecommendations";
import { BrainMetricsView } from "@/components/BrainMetricsView";
import { BodyMetricsView } from "@/components/BodyMetricsView";
import { BatMetricsView } from "@/components/BatMetricsView";
import { BallMetricsView } from "@/components/BallMetricsView";
import { SimplifiedSequenceBar } from "@/components/SimplifiedSequenceBar";
import { SimplifiedBatSummary } from "@/components/SimplifiedBatSummary";
import { FourBMotionAnalysis } from "@/components/FourBMotionAnalysis";
import { VideoTempoOverlay } from "@/components/VideoTempoOverlay";
import { detectSwingPhases, type PhaseDetectionResult } from "@/lib/swingPhaseDetection";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { calculateGrade } from "@/lib/gradingSystem";

export default function AnalysisResult() {
  const navigate = useNavigate();
  const { analysisId } = useParams<{ analysisId?: string }>();
  const { hasAccess: hasCoachRickAccess } = useCoachRickAccess();
  const [analysis, setAnalysis] = useState<SwingAnalysis | null>(null);
  const [playerName, setPlayerName] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [rebootData, setRebootData] = useState<any>(null);
  const [analysisCreatedAt, setAnalysisCreatedAt] = useState<string>('');
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
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [videoContainerSize, setVideoContainerSize] = useState({ width: 0, height: 0 });
  const [phaseDetection, setPhaseDetection] = useState<PhaseDetectionResult | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [uploadingReboot, setUploadingReboot] = useState(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const frameCallbackIdRef = useRef<number | null>(null);
  const rebootFileInputRef = useRef<HTMLInputElement>(null);
  const FPS = 30; // Frames per second

  useEffect(() => {
    // Get current user ID
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    getCurrentUser();

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

      // Check if we have a selected player from the upload
      const selectedPlayerId = sessionStorage.getItem('selectedPlayerId');
      
      // Build query - filter by player_id if available
      let query = supabase
        .from('swing_analyses')
        .select('*, players(first_name, last_name)')
        .eq('user_id', user.id);
      
      // If we have a selectedPlayerId, filter by it to get the correct player's latest analysis
      if (selectedPlayerId) {
        query = query.eq('player_id', selectedPlayerId);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      // Store created_at for ReanalyzeButton
      setAnalysisCreatedAt(data.created_at);

      // Set player ID
      if (data.player_id) {
        setPlayerId(data.player_id);
        // Fetch Reboot data for this player
        fetchRebootData(data.player_id);
      }

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
        projectedDistance: metrics.projectedDistance,
        // Bat Speed Quality metrics
        directionScore: data.direction_score || metrics.directionScore,
        timingScore: data.timing_score || metrics.timingScore,
        efficiencyScore: data.efficiency_score || metrics.efficiencyScore,
        swingMechanicsQualityScore: data.swing_mechanics_quality_score || metrics.swingMechanicsQualityScore,
        attackAngle: data.attack_angle || metrics.attackAngle,
        batPathPlane: data.bat_path_plane || metrics.batPathPlane,
        connectionQuality: data.connection_quality || metrics.connectionQuality
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

  const handleRebootUpload = async () => {
    rebootFileInputRef.current?.click();
  };

  const fetchRebootData = async (playerIdToFetch: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch the most recent Reboot Motion data for this player
      const { data, error } = await supabase
        .from('external_session_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('player_id', playerIdToFetch)
        .eq('data_source', 'reboot_motion')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching Reboot data:', error);
        return;
      }

      if (data && data.extracted_metrics) {
        setRebootData(data.extracted_metrics);
      }
    } catch (error) {
      console.error('Error fetching Reboot data:', error);
    }
  };

  const handleRebootFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!playerId) {
      toast.error('Player ID not found');
      return;
    }

    // Check file type
    const isJSON = file.name.toLowerCase().endsWith('.json');
    const isPDF = file.name.toLowerCase().endsWith('.pdf');
    
    if (!isJSON && !isPDF) {
      toast.error('Please upload a JSON or PDF file from Reboot Motion');
      return;
    }

    setUploadingReboot(true);
    toast.loading('Processing Reboot Motion file...');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let rebootData: any = null;

      if (isJSON) {
        // Parse JSON file
        const text = await file.text();
        rebootData = JSON.parse(text);
      } else {
        // Upload PDF to storage first
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${playerId}/reboot-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('swing-videos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get the file path for parsing
        const filePath = `swing-videos/${fileName}`;
        
        // Parse PDF to extract Reboot data
        const { data: parsedData, error: parseError } = await supabase.functions
          .invoke('parse-reboot-pdf', {
            body: { filePath }
          });

        if (parseError) throw parseError;
        
        rebootData = parsedData?.metrics || {};
      }

      // Save to database
      const { error: dbError } = await supabase
        .from('external_session_data')
        .insert({
          user_id: user.id,
          player_id: playerId,
          data_source: 'reboot_motion',
          extracted_metrics: rebootData,
          notes: `Uploaded ${file.name}`
        });

      if (dbError) throw dbError;

      toast.dismiss();
      toast.success('Reboot Motion data uploaded successfully');
      
      // Reload Reboot data
      if (playerId) {
        await fetchRebootData(playerId);
      }
    } catch (error: any) {
      console.error('Reboot upload error:', error);
      toast.dismiss();
      toast.error(error.message || 'Failed to upload Reboot data');
    } finally {
      setUploadingReboot(false);
      // Reset file input
      if (rebootFileInputRef.current) {
        rebootFileInputRef.current.value = '';
      }
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

      // Store created_at for ReanalyzeButton
      setAnalysisCreatedAt(data.created_at);

      // Set player ID
      if (data.player_id) {
        setPlayerId(data.player_id);
        // Fetch Reboot data for this player
        fetchRebootData(data.player_id);
      }

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
        projectedDistance: metrics.projectedDistance,
        // Bat Speed Quality metrics
        directionScore: data.direction_score || metrics.directionScore,
        timingScore: data.timing_score || metrics.timingScore,
        efficiencyScore: data.efficiency_score || metrics.efficiencyScore,
        swingMechanicsQualityScore: data.swing_mechanics_quality_score || metrics.swingMechanicsQualityScore,
        attackAngle: data.attack_angle || metrics.attackAngle,
        batPathPlane: data.bat_path_plane || metrics.batPathPlane,
        connectionQuality: data.connection_quality || metrics.connectionQuality
      };

      setAnalysis(analysisData);
      
      // Load joint data from database poseData
      if (metrics.poseData && Array.isArray(metrics.poseData)) {
        console.log(`Loaded ${metrics.poseData.length} frames of joint data from database`);
        setJointData(metrics.poseData);
        
        // Run phase detection on pose data
        try {
          const poseResults = metrics.poseData.map((frame: any) => ({
            poseLandmarks: frame.landmarks
          }));
          const detection = detectSwingPhases(poseResults, 30);
          setPhaseDetection(detection);
          console.log('Phase detection complete:', detection);
        } catch (error) {
          console.error('Phase detection error:', error);
        }
      } else {
        console.log('No joint data available in database for this analysis');
        setJointData([]);
        setPhaseDetection(null);
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

  const seekToFrame = (frame: number) => {
    if (videoRef.current) {
      const time = frame / FPS;
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      setCurrentFrame(frame);
    }
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
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
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
          {analysisId && analysisCreatedAt && (
            <ReanalyzeButton 
              analysisId={analysisId}
              createdAt={analysisCreatedAt}
              onReanalysisComplete={() => {
                // Reload the latest analysis
                loadLatestAnalysisFromDatabase();
              }}
            />
          )}
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Overall H.I.T.S. Grade - PROMINENTLY AT TOP */}
        <Card className="p-6 bg-gradient-to-br from-primary/20 via-primary/10 to-background border-2 border-primary/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Your H.I.T.S. Score</h2>
              <p className="text-sm text-muted-foreground">Complete swing analysis breakdown</p>
            </div>
            <Button 
              onClick={() => navigate('/4bs')}
              variant="outline"
              size="sm"
            >
              View 4 B's Dashboard →
            </Button>
          </div>
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <p className="text-sm text-muted-foreground">Overall Score</p>
              <InfoTooltip content="Your overall hitting performance score (0-100). Combines BRAIN (decision), BODY (execution), BAT (tool), and BALL (result). Higher scores mean better swing efficiency." />
            </div>
            <div className="text-7xl font-bold text-primary mb-1">{analysis.hitsScore}</div>
            <p className="text-muted-foreground text-sm">Out of 100 points</p>
          </div>
        </Card>

        {/* Quick Navigation Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline"
            className="h-auto py-4"
            onClick={() => document.getElementById('video-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Play className="h-4 w-4 mr-2" />
            <div className="text-left">
              <div className="font-bold">Video Analysis</div>
              <div className="text-xs opacity-70">Watch breakdown</div>
            </div>
          </Button>
          <Button 
            variant="outline"
            className="h-auto py-4"
            onClick={() => document.getElementById('drills-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <Target className="h-4 w-4 mr-2" />
            <div className="text-left">
              <div className="font-bold">Training Drills</div>
              <div className="text-xs opacity-70">Improve your swing</div>
            </div>
          </Button>
        </div>

        {/* Video Player and 3D Motion Tabs */}
        <div id="video-section">
          <Tabs defaultValue="video" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="video">Video Analysis</TabsTrigger>
            <TabsTrigger value="motion">4B Motion Analysis</TabsTrigger>
            <TabsTrigger value="markup">Markup Tools</TabsTrigger>
          </TabsList>
          
          <TabsContent value="video" className="mt-4">
            <Card className="overflow-hidden">
              <div ref={videoContainerRef} className="aspect-video bg-black relative group">
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
                      muted
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

                     {/* Tempo Overlay */}
                    <VideoTempoOverlay
                      videoRef={videoRef}
                      loadTime={(analysis.loadStartTiming || 0.5) * 1000}
                      launchTime={(analysis.fireStartTiming || 0.15) * 1000}
                      phaseDetection={phaseDetection ? {
                        loadStart: phaseDetection.phases.find(p => p.name === 'load')?.startFrame || 0,
                        launchStart: phaseDetection.phases.find(p => p.name === 'fire')?.startFrame || 0,
                        contact: phaseDetection.phases.find(p => p.name === 'contact')?.startFrame || 0,
                      } : null}
                    />
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

          {/* 4B Motion Analysis Tab */}
          <TabsContent value="motion" className="mt-4">
            <input
              ref={rebootFileInputRef}
              type="file"
              accept=".json,.pdf"
              onChange={handleRebootFileSelect}
              style={{ display: 'none' }}
            />
            <FourBMotionAnalysis 
              rebootData={rebootData}
              playerId={playerId}
              onUpload={handleRebootUpload}
            />
          </TabsContent>

          {/* Markup Tools Tab */}
          <TabsContent value="markup" className="mt-4">
            {analysis.videoUrl ? (
              <VideoAnalysisWithMarkup
                videoUrl={analysis.videoUrl}
                title="Video Markup & Analysis"
                description="Draw lines, circles, and annotations to analyze your swing mechanics"
              />
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No video available for markup</p>
              </Card>
            )}
          </TabsContent>

          </Tabs>
        </div>

        {/* Swing Phase Detection Timeline */}
        {phaseDetection && (
          <SwingPhaseTimeline
            phases={phaseDetection.phases}
            totalDuration={phaseDetection.totalDuration}
            loadToFireRatio={phaseDetection.loadToFireRatio}
            quality={phaseDetection.quality}
            currentTime={currentTime}
            onSeekToPhase={seekToFrame}
          />
        )}

        {/* 4 B's Performance Breakdown */}
        <section className="space-y-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Your Swing Breakdown</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDetailedMetrics(true)}
            >
              View Pro Data
            </Button>
          </div>


          {/* BODY - Mechanics/Movement */}
          <SimplifiedSequenceBar
            legsTiming="good"
            coreTiming="good"
            armsTiming="good"
            batTiming="good"
            tempoRatio={analysis.tempoRatio || 3.0}
          />

          {/* BAT - Tool */}
          <SimplifiedBatSummary
            batSpeed={analysis.batMaxVelocity || 70}
            attackAngle={analysis.attackAngle || 15}
            timeInZone={analysis.timingScore || 85}
            level="High School"
            overallGrade={calculateGrade(analysis.whipScore || 75)}
          />

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
        <section className="space-y-4">
          <button
            onClick={() => setShowDrills(!showDrills)}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-lg font-bold">Training Recommendations</h2>
            {showDrills ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {showDrills && (
            <div className="space-y-4">
              {/* AI-Powered Recommendations */}
              <AIDrillRecommendations 
                analysisId={analysis.id}
                userId={currentUserId}
                playerId={undefined}
              />

              {/* Traditional Recommendations */}
              <div className="grid gap-4">
                <h3 className="text-md font-semibold text-muted-foreground">Additional Drills</h3>
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
                toast.error("Premium Feature", {
                  description: "Chat with Coach Rick is available with DIY and Elite memberships. Contact support for access."
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
