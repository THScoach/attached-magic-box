import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { BottomNav } from "@/components/BottomNav";
import { PlayerSelector } from "@/components/PlayerSelector";
import { SyncRecording } from "@/components/SyncRecording";
import { VideoTagModal } from "@/components/VideoTagModal";
import { Upload, Camera, Loader2, X, Circle, Square, SwitchCamera, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { extractVideoFrames, detectPoseInFrames } from "@/lib/videoAnalysis";
import { CameraRecorder } from "@/lib/cameraRecording";
import { useWhopMembership } from "@/hooks/useWhopMembership";
import { useUserRole } from "@/hooks/useUserRole";
import { useWhopTierAccess } from "@/hooks/useWhopTierAccess";


export default function Analyze() {
  const navigate = useNavigate();
  const { membership, loading: membershipLoading } = useWhopMembership();
  const { isCoach, isAdmin } = useUserRole();
  const { canAnalyzeSwing, swingsRemaining, tier } = useWhopTierAccess();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [actualFps, setActualFps] = useState<number>(0);
  const [cameraRequested, setCameraRequested] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [dualCameraMode, setDualCameraMode] = useState(false);
  const [camera1Video, setCamera1Video] = useState<File | null>(null);
  const [camera2Video, setCamera2Video] = useState<File | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState<{ total: number; avg: number } | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(() => {
    // Initialize from sessionStorage to avoid null flash
    const stored = sessionStorage.getItem('selectedPlayerId');
    console.log('[Analyze] Initializing with stored player ID:', stored);
    return stored;
  });
  const [showSyncRecording, setShowSyncRecording] = useState(false);
  const [videoType, setVideoType] = useState<'analysis' | 'drill'>('analysis');
  const [recordedVideoFile, setRecordedVideoFile] = useState<File | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [selectedPlayerName, setSelectedPlayerName] = useState<string | null>(null);
  const [showTagModal, setShowTagModal] = useState(false);
  const [pendingVideoFile, setPendingVideoFile] = useState<File | null>(null);
  const [pendingVideoCamera, setPendingVideoCamera] = useState<1 | 2 | undefined>(undefined);
  
  // Update sessionStorage when player changes
  useEffect(() => {
    if (selectedPlayerId) {
      console.log('[Analyze] Updating sessionStorage with player ID:', selectedPlayerId);
      sessionStorage.setItem('selectedPlayerId', selectedPlayerId);
    }
  }, [selectedPlayerId]);

  // Fetch player name when selectedPlayerId changes
  useEffect(() => {
    const fetchPlayerName = async () => {
      if (!selectedPlayerId) {
        setSelectedPlayerName(null);
        return;
      }
      
      const { data } = await supabase
        .from('players')
        .select('first_name, last_name')
        .eq('id', selectedPlayerId)
        .single();
      
      if (data) {
        setSelectedPlayerName(`${data.first_name} ${data.last_name}`);
      }
    };
    
    fetchPlayerName();
  }, [selectedPlayerId]);
  
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<CameraRecorder>(new CameraRecorder());

  // Load or create session on mount
  useEffect(() => {
    const initSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check for active session in last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: recentSession } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('started_at', oneHourAgo)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (recentSession) {
        setCurrentSessionId(recentSession.id);
        setSessionStats({
          total: recentSession.total_swings || 0,
          avg: recentSession.session_avg || 0
        });
      } else {
        // Create new session
        const { data: newSession } = await supabase
          .from('practice_sessions')
          .insert({
            user_id: user.id,
            started_at: new Date().toISOString()
          })
          .select()
          .single();

        if (newSession) {
          setCurrentSessionId(newSession.id);
          setSessionStats({ total: 0, avg: 0 });
        }
      }
    };

    initSession();
  }, []);

  // Start camera when video element is mounted
  useEffect(() => {
    if (cameraRequested && showCamera && videoPreviewRef.current) {
      const initCamera = async () => {
        console.log('Initializing camera...');
        
        try {
          const result = await recorderRef.current.startPreview(videoPreviewRef.current!, 240, facingMode);
          
          if (result.success) {
            setActualFps(result.actualFps || 30);
            
            // Start buffer recording immediately after preview starts
            const bufferResult = await recorderRef.current.startBuffering();
            if (!bufferResult.success) {
              console.error('Failed to start buffer:', bufferResult.error);
            }
            
            toast.success(`Camera ready at ${result.actualFps}fps`, {
              description: result.actualFps && result.actualFps >= 240 
                ? "240fps high-speed capture enabled!" 
                : result.actualFps && result.actualFps >= 120
                ? "High frame rate enabled!"
                : "Device may not support high frame rates"
            });
          } else {
            console.error('Camera start failed:', result.error);
            toast.error("Camera Error", {
              description: result.error || "Failed to access camera"
            });
            setShowCamera(false);
          }
        } catch (error) {
          console.error('Unexpected camera error:', error);
          toast.error("Camera Error", {
            description: "Failed to start camera"
          });
          setShowCamera(false);
        }
        
        setCameraRequested(false);
      };
      
      initCamera();
    }
  }, [cameraRequested, showCamera]);

  const handleSwitchCamera = async () => {
    if (!videoPreviewRef.current) return;
    
    toast.info("Switching camera...");
    const result = await recorderRef.current.switchCamera(videoPreviewRef.current, 240);
    
    if (result.success) {
      const newFacingMode = recorderRef.current.getCurrentFacingMode();
      setFacingMode(newFacingMode);
      setActualFps(result.actualFps || 30);
      
      // Restart buffer recording after camera switch
      const bufferResult = await recorderRef.current.startBuffering();
      if (!bufferResult.success) {
        console.error('Failed to restart buffer:', bufferResult.error);
      }
      
      toast.success(`Switched to ${newFacingMode === 'user' ? 'front' : 'back'} camera`);
    } else {
      toast.error("Failed to switch camera", {
        description: result.error
      });
    }
  };

  const handleStartCamera = () => {
    console.log('Camera button clicked');
    
    // Check if browser supports camera
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Camera Not Supported", {
        description: "Your browser doesn't support camera access"
      });
      return;
    }

    toast.info("Preparing camera...");
    setShowCamera(true);
    setCameraRequested(true);
  };

  const handleStartRecording = async () => {
    const result = await recorderRef.current.captureAtContact(() => {
      // Auto-stop callback after 2 seconds post-contact
      handleStopRecording();
    });
    
    if (result.success) {
      setIsRecording(true);
      toast.success("Contact captured! Recording 2 more seconds...", {
        description: "Total: 2 sec before + 2 sec after contact"
      });
    } else {
      toast.error("Recording Error", {
        description: result.error || "Failed to capture at contact"
      });
    }
  };

  const handleStopRecording = async () => {
    console.log('Stopping recording...');
    const result = await recorderRef.current.stopRecording();
    
    if (!result.success || !result.blob) {
      toast.error("Failed to save recording");
      setIsRecording(false);
      return;
    }

    // Convert blob to file with contact timestamp metadata
    // Use the blob's type to determine the correct file extension
    const fileExtension = result.blob.type.includes('mp4') ? 'mp4' : 'webm';
    const videoFile = new File([result.blob], `recording-${Date.now()}.${fileExtension}`, {
      type: result.blob.type
    });
    
    // Store contact timestamp for later use in analysis
    if (result.contactTimestamp) {
      console.log('Contact timestamp stored:', result.contactTimestamp, 'ms');
      // This will be passed to analysis and used to align velocity graphs
      (videoFile as any).contactTimestamp = result.contactTimestamp;
    }

    // Create URL for preview
    const videoUrl = URL.createObjectURL(result.blob);

    toast.success("4-second clip captured! (2 sec before + 2 sec after contact)");
    setShowCamera(false);
    setCameraRequested(false);
    setRecordedVideoFile(videoFile);
    setRecordedVideoUrl(videoUrl);
    setIsRecording(false);
  };

  const handleCancelCamera = () => {
    recorderRef.current.stopPreview();
    setShowCamera(false);
    setCameraRequested(false);
    setIsRecording(false);
  };

  const handleDiscardRecording = async () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }
    setRecordedVideoFile(null);
    setRecordedVideoUrl(null);
    setShowCamera(true); // Go back to camera preview
    toast.info("Recording discarded - ready to record again");
    
    // Restart buffering so camera stays active
    if (recorderRef.current && videoPreviewRef.current) {
      await recorderRef.current.startBuffering();
    }
  };

  const handleAnalyzeRecording = async () => {
    if (!recordedVideoFile) {
      toast.error("No recording to analyze");
      return;
    }
    await processVideoFile(recordedVideoFile, undefined, videoType);
    // Clean up
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }
    setRecordedVideoFile(null);
    setRecordedVideoUrl(null);
  };

  const processVideoFile = async (
    file: File, 
    camera?: 1 | 2,
    videoType?: string,
    drillId?: string,
    drillName?: string
  ) => {
    // Check swing limit using tier access system - but not for coaches/admins
    if (!isCoach && !isAdmin && !canAnalyzeSwing) {
      toast.error("Swing limit reached", {
        description: tier === 'free'
          ? "You've used all 10 free swings. Contact support for more access."
          : tier === 'challenge'
          ? "Your 7-day challenge has expired. Contact support to continue."
          : "Please contact support for more access.",
      });
      return;
    }

    // If dual camera mode and this is setting up one of the cameras
    if (dualCameraMode && camera) {
      if (camera === 1) {
        setCamera1Video(file);
        toast.success("Camera 1 video uploaded (Open side)");
      } else {
        setCamera2Video(file);
        toast.success("Camera 2 video uploaded (Closed side)");
      }
      return;
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error("Please upload a video file");
      return;
    }

    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File size must be under 100MB");
      return;
    }

    // Auto-create default player if none exist
    let playerIdToUse = selectedPlayerId;
    if (!playerIdToUse) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to continue");
        return;
      }

      // Check if user has any players
      const { data: existingPlayers } = await supabase
        .from('players')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (!existingPlayers || existingPlayers.length === 0) {
        // Auto-create "Me" player
        const { data: newPlayer, error: playerError } = await supabase
          .from('players')
          .insert({
            user_id: user.id,
            first_name: 'Me',
            last_name: '',
            is_active: true
          })
          .select()
          .single();

        if (playerError || !newPlayer) {
          console.error('Failed to create default player:', playerError);
          toast.error("Failed to create player profile");
          return;
        }

        playerIdToUse = newPlayer.id;
        setSelectedPlayerId(newPlayer.id);
        toast.success("Player profile created!");
      } else {
        // Has players but none selected
        toast.error("Please select a player first");
        return;
      }
    }

    setIsAnalyzing(true);
    setUploadProgress(5);
    setAnalysisStep('Preparing video...');

    try {
      // Step 1: Upload video(s) to storage with retry logic
      setAnalysisStep('Uploading video to cloud storage...');
      setUploadProgress(10);
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      console.log('Uploading file:', fileName, 'Size:', file.size, 'Type:', file.type);
      toast.info("Uploading video...", { description: "This may take a moment for larger files" });
      
      // Retry logic for upload
      let uploadData, uploadError;
      const maxRetries = 3;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const result = await supabase.storage
            .from('swing-videos')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false,
              contentType: file.type || 'video/mp4'
            });
          
          uploadData = result.data;
          uploadError = result.error;
          
          if (!uploadError) {
            console.log('Upload successful:', uploadData);
            break;
          }
          
          // If error and not last attempt, retry
          if (attempt < maxRetries) {
            console.log(`Upload attempt ${attempt} failed, retrying...`);
            toast.info(`Retrying upload (${attempt}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
          }
        } catch (err: any) {
          console.error(`Upload attempt ${attempt} error:`, err);
          uploadError = err;
          
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          }
        }
      }

      if (uploadError) {
        console.error('Upload error after retries:', uploadError);
        const errorMsg = uploadError.message || uploadError.toString();
        toast.error("Upload failed", {
          description: errorMsg.includes("Load failed") 
            ? "Network connection lost. Please check your internet and try again."
            : errorMsg
        });
        setIsAnalyzing(false);
        return;
      }

      setUploadProgress(30);
      setAnalysisStep('Upload complete! Extracting video frames...');

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('swing-videos')
        .getPublicUrl(fileName);

      // Step 1.5: Extract video metadata to detect frame rate
      console.log('Extracting video metadata...');
      const { extractVideoMetadata } = await import('@/lib/videoAnalysis');
      let sourceFrameRate = 30; // Default
      let samplingFrameRate = 30; // We always sample at 30fps
      
      try {
        const metadata = await extractVideoMetadata(file);
        sourceFrameRate = metadata.frameRate;
        console.log(`Video metadata: ${metadata.width}x${metadata.height}, ${sourceFrameRate}fps, ${metadata.duration}s`);
        if (sourceFrameRate === 240) {
          console.log('⚠️ Detected iOS slow-motion video (240fps) - will adjust timing calculations');
        }
      } catch (metaError) {
        console.warn('Could not extract video metadata, using defaults:', metaError);
      }
      
      // Step 2: Extract key frames for AI analysis
      console.log('Starting frame extraction...');
      
      let frames: string[] = [];
      try {
        frames = await extractVideoFrames(file, 8);
        console.log(`Frame extraction complete: ${frames.length} frames extracted`);
        setUploadProgress(50);
        setAnalysisStep('Frames extracted! Detecting body positions...');
      } catch (frameError) {
        console.error('Frame extraction failed:', frameError);
        toast.error("Failed to process video frames", {
          description: frameError instanceof Error ? frameError.message : "Unknown error"
        });
        setIsAnalyzing(false);
        return;
      }

      // Step 3: Pose detection with MediaPipe (pass sourceFrameRate for timestamp correction)
      console.log('Starting pose detection...');
      
      let poseData: any[] = [];
      try {
        poseData = await detectPoseInFrames(file, (progress) => {
          setUploadProgress(50 + progress * 0.2); // 50-70%
        }, sourceFrameRate); // Pass frame rate for timestamp correction
        console.log(`Pose detection complete: ${poseData.length} frames with keypoints`);
        setUploadProgress(70);
        setAnalysisStep('Body positions detected! Analyzing biomechanics...');
      } catch (poseError) {
        console.error('Pose detection failed:', poseError);
        console.log('Continuing without pose data...');
        // Continue with empty pose data rather than failing completely
        poseData = [];
        setUploadProgress(70);
      }

      // Process pose data into comprehensive joint analysis
      import('@/lib/poseProcessor').then(({ processPoseData, summarizeJointData }) => {
        if (poseData && poseData.length > 0) {
          const frameJointData = processPoseData(poseData, file.size / 1000000); // Rough duration estimate
          const jointSummary = summarizeJointData(frameJointData);
          console.log('Joint data summary:', jointSummary);
          // Store frameJointData and jointSummary for later use
          sessionStorage.setItem('latestJointData', JSON.stringify({
            frames: frameJointData,
            summary: jointSummary
          }));
        }
      });

      // Step 4: Analyze with AI
      setUploadProgress(75);
      setAnalysisStep('Running AI biomechanics analysis...');
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'analyze-swing',
        {
          body: {
            frames: frames,
            keypoints: poseData,
            videoUrl: publicUrl,
            sessionId: currentSessionId,
            playerId: playerIdToUse,
            videoType: videoType || 'analysis',
            drillId: drillId,
            drillName: drillName,
            sourceFrameRate: sourceFrameRate,  // Detected from video metadata (e.g., 240fps for iOS slow-mo)
            samplingFrameRate: samplingFrameRate  // We sample at 30fps for pose detection
          }
        }
      );

      if (analysisError) {
        console.error('Analysis error:', analysisError);
        toast.error("Analysis failed: " + analysisError.message);
        setIsAnalyzing(false);
        return;
      }

      if (!analysisData.success) {
        toast.error(analysisData.error || "Analysis failed");
        setIsAnalyzing(false);
        return;
      }

      setUploadProgress(100);

      // Increment swing count for free tier
      if (membership?.tier === 'free') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.rpc('increment_swing_count', { _user_id: user.id });
        }
      }

      // Step 5: Store results
      const analysis = {
        id: Date.now().toString(),
        videoUrl: publicUrl,
        analyzedAt: new Date(),
        hitsScore: analysisData.analysis.hitsScore,
        anchorScore: analysisData.analysis.anchorScore,
        engineScore: analysisData.analysis.engineScore,
        whipScore: analysisData.analysis.whipScore,
        tempoRatio: analysisData.analysis.tempoRatio,
        pelvisTiming: analysisData.analysis.pelvisTiming,
        torsoTiming: analysisData.analysis.torsoTiming,
        handsTiming: analysisData.analysis.handsTiming,
        primaryOpportunity: analysisData.analysis.primaryOpportunity,
        impactStatement: analysisData.analysis.impactStatement,
        // Enhanced Reboot-style metrics
        pelvisMaxVelocity: analysisData.analysis.pelvisMaxVelocity,
        torsoMaxVelocity: analysisData.analysis.torsoMaxVelocity,
        armMaxVelocity: analysisData.analysis.armMaxVelocity,
        batMaxVelocity: analysisData.analysis.batMaxVelocity,
        xFactorStance: analysisData.analysis.xFactorStance,
        xFactor: analysisData.analysis.xFactor,
        pelvisRotation: analysisData.analysis.pelvisRotation,
        shoulderRotation: analysisData.analysis.shoulderRotation,
        comDistance: analysisData.analysis.comDistance,
        comMaxVelocity: analysisData.analysis.comMaxVelocity,
        // Bat Speed Quality metrics
        directionScore: analysisData.analysis.direction_score,
        timingScore: analysisData.analysis.timing_score,
        efficiencyScore: analysisData.analysis.efficiency_score,
        swingMechanicsQualityScore: analysisData.analysis.swing_mechanics_quality_score,
        attackAngle: analysisData.analysis.attackAngle,
        batPathPlane: analysisData.analysis.batPathPlane,
        connectionQuality: analysisData.analysis.connectionQuality,
        poseData: poseData
      };

      sessionStorage.setItem('latestAnalysis', JSON.stringify(analysis));
      sessionStorage.setItem('currentSessionId', currentSessionId || '');
      sessionStorage.setItem('latestAnalysisType', videoType);
      sessionStorage.setItem('selectedPlayerId', selectedPlayerId);
      
      // Update session stats
      if (sessionStats) {
        const newTotal = sessionStats.total + 1;
        const newAvg = ((sessionStats.avg * sessionStats.total) + analysis.hitsScore) / newTotal;
        setSessionStats({ total: newTotal, avg: newAvg });
      }
      
      toast.success("✅ Analysis Complete!", {
        description: "View your 4 B's scorecard and detailed breakdown",
        duration: 5000,
      });
      navigate('/result/latest');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred");
      setIsAnalyzing(false);
    }
  };

  const processDualCameraVideos = async () => {
    if (!camera1Video || !camera2Video) {
      toast.error("Please upload both camera angles");
      return;
    }

    if (!selectedPlayerId) {
      toast.error("Please select a player first");
      return;
    }

    setIsAnalyzing(true);
    setUploadProgress(10);

    try {
      // Upload both videos
      const fileName1 = `${Date.now()}-camera1-${camera1Video.name}`;
      const fileName2 = `${Date.now()}-camera2-${camera2Video.name}`;
      
      const [upload1, upload2] = await Promise.all([
        supabase.storage.from('swing-videos').upload(fileName1, camera1Video, { cacheControl: '3600' }),
        supabase.storage.from('swing-videos').upload(fileName2, camera2Video, { cacheControl: '3600' })
      ]);

      if (upload1.error || upload2.error) {
        toast.error("Failed to upload videos");
        setIsAnalyzing(false);
        return;
      }

      setUploadProgress(30);

      const { data: { publicUrl: url1 } } = supabase.storage.from('swing-videos').getPublicUrl(fileName1);

      // Extract frames from both angles
      toast.info("Extracting frames from both cameras...");
      const [frames1, frames2] = await Promise.all([
        extractVideoFrames(camera1Video, 8),
        extractVideoFrames(camera2Video, 8)
      ]);
      
      setUploadProgress(50);

      // Analyze with both camera views
      toast.info("Analyzing with dual-camera 3D reconstruction...");
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'analyze-swing',
        {
          body: {
            frames: frames1,
            frames2: frames2,
            dualCamera: true,
            keypoints: null,
            videoUrl: url1,
            sessionId: currentSessionId,
            playerId: selectedPlayerId,
            videoType: videoType,
            sourceFrameRate: 30,  // Browser recording is always 30fps
            samplingFrameRate: 30  // Same as source for in-app recording
          }
        }
      );

      if (analysisError) {
        console.error('Analysis error:', analysisError);
        toast.error("Analysis failed: " + analysisError.message);
        setIsAnalyzing(false);
        return;
      }

      if (!analysisData.success) {
        toast.error(analysisData.error || "Analysis failed");
        setIsAnalyzing(false);
        return;
      }

      setUploadProgress(95);
      setAnalysisStep('Analysis complete! Preparing results...');

      const analysis = {
        id: Date.now().toString(),
        videoUrl: url1,
        analyzedAt: new Date(),
        hitsScore: analysisData.analysis.hitsScore,
        anchorScore: analysisData.analysis.anchorScore,
        engineScore: analysisData.analysis.engineScore,
        whipScore: analysisData.analysis.whipScore,
        tempoRatio: analysisData.analysis.tempoRatio,
        pelvisTiming: analysisData.analysis.pelvisTiming,
        torsoTiming: analysisData.analysis.torsoTiming,
        handsTiming: analysisData.analysis.handsTiming,
        primaryOpportunity: analysisData.analysis.primaryOpportunity,
        impactStatement: analysisData.analysis.impactStatement,
        pelvisMaxVelocity: analysisData.analysis.pelvisMaxVelocity,
        torsoMaxVelocity: analysisData.analysis.torsoMaxVelocity,
        armMaxVelocity: analysisData.analysis.armMaxVelocity,
        batMaxVelocity: analysisData.analysis.batMaxVelocity,
        xFactorStance: analysisData.analysis.xFactorStance,
        xFactor: analysisData.analysis.xFactor,
        pelvisRotation: analysisData.analysis.pelvisRotation,
        shoulderRotation: analysisData.analysis.shoulderRotation,
        comDistance: analysisData.analysis.comDistance,
        comMaxVelocity: analysisData.analysis.comMaxVelocity,
        // Bat Speed Quality metrics
        directionScore: analysisData.analysis.direction_score,
        timingScore: analysisData.analysis.timing_score,
        efficiencyScore: analysisData.analysis.efficiency_score,
        swingMechanicsQualityScore: analysisData.analysis.swing_mechanics_quality_score,
        attackAngle: analysisData.analysis.attackAngle,
        batPathPlane: analysisData.analysis.batPathPlane,
        connectionQuality: analysisData.analysis.connectionQuality,
        poseData: null
      };

      sessionStorage.setItem('latestAnalysis', JSON.stringify(analysis));
      sessionStorage.setItem('currentSessionId', currentSessionId || '');
      sessionStorage.setItem('latestAnalysisType', videoType);
      sessionStorage.setItem('selectedPlayerId', selectedPlayerId);
      
      // Update session stats
      if (sessionStats) {
        const newTotal = sessionStats.total + 1;
        const newAvg = ((sessionStats.avg * sessionStats.total) + analysis.hitsScore) / newTotal;
        setSessionStats({ total: newTotal, avg: newAvg });
      }
      
      toast.success("3D Analysis complete!");
      navigate('/result/latest');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred");
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, camera?: 1 | 2) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // If dual camera mode, just process directly
    if (dualCameraMode && camera) {
      await processVideoFile(file, camera);
      return;
    }
    
    // Otherwise show tagging modal
    setPendingVideoFile(file);
    setPendingVideoCamera(camera);
    setShowTagModal(true);
  };

  const handleTagSubmit = (data: { videoType: string; drillId?: string; drillName?: string }) => {
    if (pendingVideoFile) {
      processVideoFile(
        pendingVideoFile, 
        pendingVideoCamera,
        data.videoType,
        data.drillId,
        data.drillName
      );
      setPendingVideoFile(null);
      setPendingVideoCamera(undefined);
    }
    setShowTagModal(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-engine/20 via-anchor/10 to-whip/10 px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold mb-2">Analyze Your Swing</h1>
        <p className="text-muted-foreground">
          Upload a video to get your H.I.T.S. Score
        </p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {!isAnalyzing && !showCamera && !recordedVideoFile ? (
          <>
            {/* Current Session Stats */}
            {sessionStats && sessionStats.total > 0 && (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Current Session</p>
                    <div className="flex gap-4 mt-1">
                      <span className="text-lg font-bold">{sessionStats.total} swings</span>
                      <span className="text-lg font-bold text-primary">
                        {sessionStats.avg.toFixed(1)} avg
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Player Selection - Required */}
            {!selectedPlayerId ? (
              <Card className="p-4 border-2 border-yellow-500/50 bg-yellow-500/5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
                      <span className="text-lg">👤</span>
                      <span className="text-sm font-semibold">Step 1: Select a player to continue</span>
                    </div>
                    {(isCoach || isAdmin) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/coach-roster')}
                        className="text-xs h-7"
                      >
                        View All Players →
                      </Button>
                    )}
                  </div>
                  <PlayerSelector 
                    selectedPlayerId={selectedPlayerId}
                    onSelectPlayer={setSelectedPlayerId}
                  />
                </div>
              </Card>
            ) : (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-lg">👤</span>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Recording for</Label>
                      <p className="font-semibold">{selectedPlayerName || 'Loading...'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(isCoach || isAdmin) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/coach-roster')}
                        className="text-xs h-8"
                      >
                        All Players
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPlayerId(null);
                        setSelectedPlayerName(null);
                      }}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Video Type Selection */}
            <Card className="p-4">
              <div className="space-y-3">
                <h3 className="font-semibold">What are you uploading?</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={videoType === 'analysis' ? "default" : "outline"}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => setVideoType('analysis')}
                  >
                    <span className="text-lg">📊</span>
                    <div className="text-center">
                      <div className="font-bold">Analysis</div>
                      <div className="text-xs opacity-80">Measure your swing</div>
                    </div>
                  </Button>
                  <Button
                    variant={videoType === 'drill' ? "default" : "outline"}
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => setVideoType('drill')}
                  >
                    <span className="text-lg">🎯</span>
                    <div className="text-center">
                      <div className="font-bold">Training Drill</div>
                      <div className="text-xs opacity-80">Track effectiveness</div>
                    </div>
                  </Button>
                </div>
                {videoType === 'drill' && (
                  <p className="text-sm text-muted-foreground">
                    After the drill analysis, Coach Rick will ask you how it felt to log notes.
                  </p>
                )}
              </div>
            </Card>

            {/* Show player selection prompt if no player selected */}
            {!selectedPlayerId && (
              <Card className="p-8 border-2 border-yellow-500/50 border-dashed">
                <div className="text-center space-y-4">
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500">
                      ⚠️ Please select a player above before uploading
                    </p>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-primary/10">
                      <Camera className="h-12 w-12 text-primary" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg mb-2">Ready to Analyze</h3>
                    <p className="text-sm text-muted-foreground">
                      Select a player above to start uploading and analyzing swing videos
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Dual Camera Mode Toggle */}
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Dual Camera Mode (3D Analysis)</h3>
                    <p className="text-sm text-muted-foreground">
                      Record or upload from two angles for enhanced accuracy
                    </p>
                  </div>
                  <Button
                    variant={dualCameraMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setDualCameraMode(!dualCameraMode);
                      setCamera1Video(null);
                      setCamera2Video(null);
                    }}
                  >
                    {dualCameraMode ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                {dualCameraMode && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowSyncRecording(true)}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Synchronized Live Recording (2 Devices)
                  </Button>
                )}
              </div>
            </Card>

            {dualCameraMode && (
              /* Dual Camera Upload UI */
              <div className="space-y-4">
                <Card className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold mb-2">Camera 1: Open Side (Catcher Side)</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        45° angle from open side, showing lead shoulder
                      </p>
                      {camera1Video ? (
                        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500 rounded-lg">
                          <span className="text-sm font-medium">✓ {camera1Video.name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setCamera1Video(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => document.getElementById('video-upload-1')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Camera 1 Video
                        </Button>
                      )}
                      <input
                        id="video-upload-1"
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileUpload(e, 1)}
                        className="hidden"
                      />
                    </div>

                    <div>
                      <h3 className="font-bold mb-2">Camera 2: Closed Side (Dugout Side)</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        45° angle from closed side, showing back shoulder
                      </p>
                      {camera2Video ? (
                        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500 rounded-lg">
                          <span className="text-sm font-medium">✓ {camera2Video.name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setCamera2Video(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => document.getElementById('video-upload-2')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Camera 2 Video
                        </Button>
                      )}
                      <input
                        id="video-upload-2"
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileUpload(e, 2)}
                        className="hidden"
                      />
                    </div>

                    <Button
                      size="lg"
                      className="w-full"
                      disabled={!camera1Video || !camera2Video}
                      onClick={processDualCameraVideos}
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Analyze with Dual Cameras
                    </Button>
                  </div>
                </Card>

                <Card className="p-6 bg-muted/50">
                  <h3 className="font-bold mb-3">3D Analysis Benefits</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• True 3D body position tracking</li>
                    <li>• More accurate spine tilt in all planes</li>
                    <li>• Better rotational velocity estimates</li>
                    <li>• Improved COM tracking</li>
                    <li>• Professional-level biomechanical data</li>
                  </ul>
                </Card>
              </div>
            )}

            {/* Single Camera Upload/Record - Only show when player selected and dual camera disabled */}
            {selectedPlayerId && !dualCameraMode && (
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="font-bold text-lg mb-2">Upload or Record Your Swing</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose a video file from your device or use your camera to record
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Upload Video Button */}
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-24 flex flex-col items-center gap-2"
                      onClick={() => document.getElementById('single-video-upload')?.click()}
                    >
                      <Upload className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-bold">Upload Video</div>
                        <div className="text-xs opacity-80">From device</div>
                      </div>
                    </Button>

                    {/* Use Camera Button */}
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-24 flex flex-col items-center gap-2"
                      onClick={handleStartCamera}
                    >
                      <Camera className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-bold">Use Camera</div>
                        <div className="text-xs opacity-80">Record now</div>
                      </div>
                    </Button>
                  </div>

                  <input
                    id="single-video-upload"
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e)}
                    className="hidden"
                  />

                  <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-lg">
                    <p className="font-semibold">💡 Tips for best results:</p>
                    <ul className="space-y-1 pl-4">
                      <li>• Record from the side (profile view)</li>
                      <li>• Keep full body in frame</li>
                      <li>• Use good lighting</li>
                      <li>• Video should be 4-8 seconds long</li>
                    </ul>
                  </div>
                </div>
              </Card>
            )}
          </>
        ) : recordedVideoFile && recordedVideoUrl ? (
          /* Recorded Video Review UI */
          <Card className="overflow-hidden">
            <div className="bg-black">
              <video
                src={recordedVideoUrl}
                className="w-full aspect-video object-contain"
                controls
                playsInline
                loop
              />
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-center">
                <h3 className="font-bold text-lg mb-2">Review Your Recording</h3>
                <p className="text-sm text-muted-foreground">
                  Play the video above to review your swing. When ready, click "Analyze This Video" below.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleDiscardRecording}
                  className="w-full"
                >
                  <X className="h-5 w-5 mr-2" />
                  Discard & Re-record
                </Button>
                
                <Button
                  size="lg"
                  onClick={handleAnalyzeRecording}
                  disabled={!selectedPlayerId}
                  className="w-full"
                >
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Analyze This Video
                </Button>
              </div>

              {!selectedPlayerId && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500 text-center">
                    ⚠️ Please select a player above before analyzing
                  </p>
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-lg">
                <p className="font-semibold">💡 Review Checklist:</p>
                <ul className="space-y-1 pl-4">
                  <li>✓ Full body visible throughout swing</li>
                  <li>✓ Camera angle captures side view clearly</li>
                  <li>✓ Lighting is adequate</li>
                  <li>✓ Swing motion is smooth and complete</li>
                </ul>
              </div>
            </div>
          </Card>
        ) : showCamera ? (
          <Card className="overflow-hidden">
            <div className="relative bg-black">
              <video
                ref={videoPreviewRef}
                className="w-full aspect-video object-contain"
                playsInline
                muted
              />
              
              {/* Calibration Box Guide */}
              {!isRecording && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-4/5 h-4/5 max-w-md">
                    {/* Frame corners */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400"></div>
                    
                    {/* Center guideline */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-green-400/50 -translate-x-1/2"></div>
                    
                    {/* Instructions */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 px-4 py-2 rounded-lg">
                      <p className="text-green-400 text-sm font-medium text-center whitespace-nowrap">
                        Position yourself inside the frame
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 bg-red-500 rounded-full">
                  <Circle className="h-3 w-3 fill-white animate-pulse" />
                  <span className="text-white text-sm font-medium">Recording</span>
                </div>
              )}

              {/* Frame rate indicator */}
              <div className="absolute top-4 right-4 px-3 py-2 bg-black/70 rounded-lg">
                <span className="text-white text-sm font-medium">{actualFps}fps</span>
              </div>

              {/* Camera controls */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleCancelCamera}
                  className="bg-black/50 border-white text-white hover:bg-black/70"
                >
                  <X className="h-5 w-5 mr-2" />
                  Cancel
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleSwitchCamera}
                  disabled={isRecording}
                  className="bg-black/50 border-white text-white hover:bg-black/70 disabled:opacity-50"
                >
                  <SwitchCamera className="h-5 w-5 mr-2" />
                  Switch
                </Button>

                {!isRecording ? (
                  <Button
                    size="lg"
                    onClick={handleStartRecording}
                    className="bg-red-500 hover:bg-red-600 text-white px-8"
                  >
                    <Circle className="h-6 w-6 mr-2 fill-white" />
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleStopRecording}
                    className="bg-white hover:bg-gray-200 text-black px-8"
                  >
                    <Square className="h-6 w-6 mr-2" />
                    Stop Recording
                  </Button>
                )}
              </div>
            </div>

            <div className="p-4 bg-muted space-y-3">
              <p className="text-sm text-center font-medium">
                {isRecording 
                  ? "Recording your swing... Press Stop when done" 
                  : "Position yourself in frame and press Start Recording"
                }
              </p>
              
              {!isRecording && (
                <div className="text-xs space-y-2 text-muted-foreground">
                  <p className="font-semibold text-foreground">📍 Camera Placement Tips:</p>
                  <ul className="space-y-1 pl-4">
                    <li>• <strong>Side view (Down-the-line):</strong> Camera at hip height, 6-8 feet away, facing your side</li>
                    <li>• <strong>Face-on view:</strong> Camera directly in front, capturing full body from feet to head</li>
                    <li>• <strong>Stability:</strong> Use a tripod or stable surface - avoid handheld</li>
                    <li>• <strong>Lighting:</strong> Good lighting behind the camera, avoid backlighting</li>
                    <li>• <strong>Frame:</strong> Capture full swing including club at top and follow-through</li>
                  </ul>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card className="p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
              </div>
              
              <div>
                <h3 className="font-bold text-xl mb-2">Analyzing Your Swing...</h3>
                <p className="text-muted-foreground">
                  This usually takes 30-60 seconds
                </p>
              </div>

              <div className="space-y-3">
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                  <p className="text-sm font-medium text-foreground">
                    {analysisStep || 'Starting analysis...'}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {uploadProgress}% complete
                </p>
              </div>

              {/* Educational Tips */}
              <Card className="p-4 bg-muted/50 text-left">
                <p className="text-sm font-medium mb-2">💡 Did you know?</p>
                <p className="text-sm text-muted-foreground">
                  The H.I.T.S. Score measures your swing's tempo and kinematic sequence—
                  the timing of how your pelvis, torso, and hands move. This is what separates 
                  good hitters from great ones.
                </p>
              </Card>
            </div>
          </Card>
        )}
      </div>

      <BottomNav />

      {/* Sync Recording Modal */}
      <SyncRecording
        isOpen={showSyncRecording}
        onClose={() => setShowSyncRecording(false)}
        onComplete={(masterVideo, clientVideo) => {
          setCamera1Video(masterVideo);
          setCamera2Video(clientVideo);
          setShowSyncRecording(false);
          toast.success("Both videos ready! Click 'Analyze with Dual Cameras' to proceed.");
        }}
      />

      <VideoTagModal 
        open={showTagModal}
        onOpenChange={setShowTagModal}
        onSubmit={handleTagSubmit}
        videoFileName={pendingVideoFile?.name}
      />


      <BottomNav />
    </div>
  );
}
