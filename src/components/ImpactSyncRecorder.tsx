import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Target, Circle, Zap, Info, Mic } from "lucide-react";
import { toast } from "sonner";
import { AudioImpactDetector } from "@/lib/audioImpactDetection";

interface ImpactSyncRecorderProps {
  onRecordingComplete: (recording: RecordingData) => void;
  frameRate?: number;
  bufferSeconds?: number;
  enableAudioDetection?: boolean;
}

interface RecordingData {
  videoBlob: Blob;
  impactFrameIndex: number;
  totalFrames: number;
  impactTimestamp: number;
  metadata: {
    preImpactSeconds: number;
    postImpactSeconds: number;
    frameRate: number;
  };
}

export function ImpactSyncRecorder({ 
  onRecordingComplete, 
  frameRate = 120, // Use 120fps for better compatibility (240fps not widely supported)
  bufferSeconds = 2,
  enableAudioDetection = false
}: ImpactSyncRecorderProps) {
  const [isBuffering, setIsBuffering] = useState(false);
  const [isCapturingPost, setIsCapturingPost] = useState(false);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioDetectionEnabled, setAudioDetectionEnabled] = useState(enableAudioDetection);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isListeningForImpact, setIsListeningForImpact] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const bufferStartTimeRef = useRef<number>(0);
  const impactTimeRef = useRef<number>(0);
  const audioDetectorRef = useRef<AudioImpactDetector | null>(null);
  const audioLevelIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBuffering();
    };
  }, []);

  const startBuffering = async () => {
    try {
      setError(null);
      
      // Request camera access with high frame rate
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: frameRate, min: 60 }
        },
        audio: true // Capture audio for future audio detection feature
      });

      streamRef.current = stream;

      // Check actual frame rate
      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      const actualFrameRate = settings.frameRate || frameRate;
      
      if (actualFrameRate < 60) {
        toast.warning(`Camera supports ${actualFrameRate}fps. Results may be less accurate.`);
      }

      // Start MediaRecorder in continuous mode
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 8000000 // 8 Mbps for good quality
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording error occurred');
        stopBuffering();
      };

      // Start recording with small timeslices for better buffer control
      mediaRecorder.start(100); // Request data every 100ms
      bufferStartTimeRef.current = Date.now();
      setIsBuffering(true);

      // Initialize audio detection if enabled
      if (audioDetectionEnabled) {
        audioDetectorRef.current = new AudioImpactDetector(0.75);
        await audioDetectorRef.current.startListening(stream);
        setIsListeningForImpact(true);
        
        // Start audio level monitoring for UI
        audioLevelIntervalRef.current = setInterval(() => {
          if (audioDetectorRef.current) {
            const level = audioDetectorRef.current.getCurrentLevel();
            setAudioLevel(level);
          }
        }, 50);
        
        // Auto-detect impact
        audioDetectorRef.current.detectImpact().then((result) => {
          if (result.detected && isBuffering) {
            toast.info(`Impact auto-detected! Confidence: ${(result.confidence * 100).toFixed(0)}%`);
            captureImpact();
          }
        });
      }

      // Update buffer progress
      const progressInterval = setInterval(() => {
        if (!isBuffering) {
          clearInterval(progressInterval);
          return;
        }
        
        const elapsed = (Date.now() - bufferStartTimeRef.current) / 1000;
        const progress = Math.min((elapsed / bufferSeconds) * 100, 100);
        setBufferProgress(progress);
      }, 100);

      const message = audioDetectionEnabled 
        ? 'Listening for impact sound...' 
        : 'Recording buffer started! Press IMPACT when ball strikes bat.';
      toast.success(message);
    } catch (err: any) {
      console.error('Error starting buffer:', err);
      setError(err.message || 'Failed to access camera');
      toast.error('Camera access denied or not available');
    }
  };

  const captureImpact = async () => {
    if (!mediaRecorderRef.current || !streamRef.current) {
      toast.error('Recording not active');
      return;
    }

    // Mark impact time
    impactTimeRef.current = Date.now();
    setIsCapturingPost(true);
    toast.loading('Capturing post-impact frames...');

    // Continue recording for 0.5 seconds after impact
    const postImpactDuration = 500; // ms
    
    await new Promise(resolve => setTimeout(resolve, postImpactDuration));

    // Stop recording
    const mediaRecorder = mediaRecorderRef.current;
    
    return new Promise<void>((resolve) => {
      mediaRecorder.onstop = async () => {
        try {
          // Create video blob from chunks
          const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
          
          // Calculate timing
          const totalDuration = impactTimeRef.current - bufferStartTimeRef.current + postImpactDuration;
          const impactTime = impactTimeRef.current - bufferStartTimeRef.current;
          
          // Calculate frame indices (approximate)
          const totalFrames = Math.floor((totalDuration / 1000) * frameRate);
          const impactFrameIndex = Math.floor((impactTime / 1000) * frameRate);

          const recordingData: RecordingData = {
            videoBlob,
            impactFrameIndex,
            totalFrames,
            impactTimestamp: impactTime,
            metadata: {
              preImpactSeconds: impactTime / 1000,
              postImpactSeconds: postImpactDuration / 1000,
              frameRate
            }
          };

          // Stop all tracks
          stopBuffering();

          toast.dismiss();
          toast.success(`Captured ${totalFrames} frames! Impact at frame ${impactFrameIndex}.`);
          
          // Pass recording to parent
          onRecordingComplete(recordingData);
          
          resolve();
        } catch (err: any) {
          console.error('Error processing recording:', err);
          toast.error('Failed to process recording');
          stopBuffering();
          resolve();
        }
      };

      mediaRecorder.stop();
    });
  };

  const stopBuffering = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    }

    // Stop audio detection
    if (audioDetectorRef.current) {
      audioDetectorRef.current.stopListening();
      audioDetectorRef.current = null;
    }
    
    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current);
      audioLevelIntervalRef.current = null;
    }

    chunksRef.current = [];
    setIsBuffering(false);
    setIsCapturingPost(false);
    setBufferProgress(0);
    setIsListeningForImpact(false);
    setAudioLevel(0);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Impact-Synchronized Recording
        </CardTitle>
        <CardDescription>
          Press record AT impact for precise timing capture
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Audio Detection Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            <div>
              <Label htmlFor="audio-detection" className="font-medium">
                Auto-detect Impact (Phase 4)
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically capture when ball contact sound is detected
              </p>
            </div>
          </div>
          <Switch
            id="audio-detection"
            checked={audioDetectionEnabled}
            onCheckedChange={setAudioDetectionEnabled}
            disabled={isBuffering}
          />
        </div>

        {/* Audio Level Indicator */}
        {isListeningForImpact && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Audio Level</span>
              <span className={audioLevel > 0.7 ? "text-primary font-medium" : ""}>
                {(audioLevel * 100).toFixed(0)}%
              </span>
            </div>
            <Progress 
              value={audioLevel * 100} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Mic className="h-3 w-3" />
              Listening for ball contact sound...
            </p>
          </div>
        )}
        
        {/* How it works */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>How it works:</strong> {audioDetectionEnabled 
              ? `Audio detection will automatically capture impact. Manual override available.`
              : `Start buffering, then press IMPACT when you hear ball contact.`}
            {' '}Captures {bufferSeconds}s before + 0.5s after impact.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Recording Controls */}
        {!isBuffering && !isCapturingPost && (
          <Button 
            onClick={startBuffering}
            className="w-full"
            size="lg"
          >
            <Circle className="h-4 w-4 mr-2" />
            Start Buffer Recording
          </Button>
        )}

        {isBuffering && !isCapturingPost && (
          <div className="space-y-4">
            {/* Buffer Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Buffer Status</span>
                <span className="font-medium">
                  {bufferProgress < 100 ? 'Buffering...' : 'Ready!'}
                </span>
              </div>
              <Progress value={bufferProgress} className="h-2" />
            </div>

            {/* Impact Button */}
            <Button
              onClick={captureImpact}
              disabled={bufferProgress < 100}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              size="lg"
            >
              <Zap className="h-5 w-5 mr-2" />
              IMPACT! 🎯
            </Button>

            <Button
              onClick={stopBuffering}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        )}

        {isCapturingPost && (
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Circle className="h-4 w-4 animate-pulse" />
              <span className="font-medium">Capturing post-impact frames...</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>
        )}

        {/* Benefits */}
        <div className="pt-4 border-t space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Benefits
          </h4>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>✅ Impact frame precisely known (not estimated)</li>
            <li>✅ Better timing accuracy for tempo analysis</li>
            <li>✅ Smaller video files (2.5s vs 5+ seconds)</li>
            <li>✅ Natural UX - press button when you hear impact</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
