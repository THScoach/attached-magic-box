import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { Upload, Camera, Loader2, X, Circle, Square } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { extractVideoFrames, detectPoseInFrames } from "@/lib/videoAnalysis";
import { CameraRecorder } from "@/lib/cameraRecording";

export default function Analyze() {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [actualFps, setActualFps] = useState<number>(0);
  const [cameraRequested, setCameraRequested] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<CameraRecorder>(new CameraRecorder());

  // Start camera when video element is mounted
  useEffect(() => {
    if (cameraRequested && showCamera && videoPreviewRef.current) {
      const initCamera = async () => {
        console.log('Initializing camera...');
        
        try {
          const result = await recorderRef.current.startPreview(videoPreviewRef.current!, 120);
          
          if (result.success) {
            setActualFps(result.actualFps || 30);
            toast.success(`Camera ready at ${result.actualFps}fps`, {
              description: result.actualFps && result.actualFps >= 120 
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
    const result = await recorderRef.current.startRecording();
    
    if (result.success) {
      setIsRecording(true);
      toast.success("Recording started");
    } else {
      toast.error("Recording Error", {
        description: result.error || "Failed to start recording"
      });
    }
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    const result = await recorderRef.current.stopRecording();
    
    if (result.success && result.blob) {
      recorderRef.current.stopPreview();
      setShowCamera(false);
      
      // Convert blob to file and process
      const file = new File([result.blob], `swing-${Date.now()}.webm`, { type: 'video/webm' });
      await processVideoFile(file);
    } else {
      toast.error("Failed to save recording");
    }
  };

  const handleCancelCamera = () => {
    recorderRef.current.stopPreview();
    setShowCamera(false);
    setIsRecording(false);
  };

  const processVideoFile = async (file: File) => {

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

    setIsAnalyzing(true);
    setUploadProgress(10);

    try {
      // Step 1: Upload video to storage
      const fileName = `${Date.now()}-${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('swing-videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error("Failed to upload video");
        setIsAnalyzing(false);
        return;
      }

      setUploadProgress(30);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('swing-videos')
        .getPublicUrl(fileName);

      // Step 2: Extract key frames for AI analysis
      toast.info("Extracting frames from video...");
      const frames = await extractVideoFrames(file, 8);
      setUploadProgress(50);

      // Step 3: Pose detection (temporarily disabled, focusing on AI analysis)
      const poseData = null;
      setUploadProgress(70);

      // Step 4: Analyze with AI
      toast.info("Analyzing swing biomechanics...");
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'analyze-swing',
        {
          body: {
            frames: frames,
            keypoints: poseData
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
        poseData: poseData
      };

      sessionStorage.setItem('latestAnalysis', JSON.stringify(analysis));
      
      toast.success("Analysis complete!");
      navigate('/result/latest');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred");
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processVideoFile(file);
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
        {!isAnalyzing && !showCamera ? (
          <>
            <Card className="p-8 border-2 border-dashed">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Camera className="h-12 w-12 text-primary" />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg mb-2">Upload Your Swing</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Support for MP4, MOV files up to 100MB. Any frame rate supported (30-480fps).
                  </p>
                </div>

                <div className="space-y-3">
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={() => document.getElementById('video-upload')?.click()}
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Choose Video File
                  </Button>
                  
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="w-full"
                    onClick={handleStartCamera}
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Record Now (120fps)
                  </Button>
                </div>
              </div>
            </Card>

            {/* Tips */}
            <Card className="p-6 bg-muted/50">
              <h3 className="font-bold mb-3">Tips for Best Results</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Film from the side (perpendicular to the swing path)</li>
                <li>• Ensure your full body is visible in the frame</li>
                <li>• Use good lighting for clear visibility</li>
                <li>• Capture at least 2-3 seconds before and after contact</li>
                <li>• Keep the camera stable (use a tripod if possible)</li>
                <li>• For best results: 120fps or higher (300-480fps supported)</li>
              </ul>
            </Card>
          </>
        ) : showCamera ? (
          <Card className="overflow-hidden">
            <div className="relative bg-black">
              <video
                ref={videoPreviewRef}
                className="w-full aspect-video object-contain"
                playsInline
                muted
              />
              
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

            <div className="p-4 bg-muted">
              <p className="text-sm text-center">
                {isRecording 
                  ? "Recording your swing... Press Stop when done" 
                  : "Position yourself in frame and press Start Recording"
                }
              </p>
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

              <div className="space-y-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {uploadProgress < 100 ? 'Uploading video...' : 'Processing analysis...'}
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
    </div>
  );
}
