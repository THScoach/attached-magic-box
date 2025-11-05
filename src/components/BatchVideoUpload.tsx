import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, Loader2, CheckCircle2, XCircle, FileVideo, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { extractVideoMetadata } from "@/lib/videoAnalysis";
import { Pose } from "@mediapipe/pose";
import { VideoTagModal } from "@/components/VideoTagModal";

interface BatchVideoUploadProps {
  playerId: string;
  playerName?: string;
  onUploadComplete?: () => void;
}

interface VideoUploadStatus {
  file: File;
  status: 'pending' | 'tagging' | 'uploading' | 'analyzing' | 'completed' | 'error';
  progress: number;
  error?: string;
  analysisId?: string;
  frameRate?: number;
  width?: number;
  height?: number;
  duration?: number;
  isExtractingMetadata?: boolean;
  videoType?: string;
  drillId?: string;
  drillName?: string;
  currentStep?: string;
  estimatedTimeRemaining?: number;
  processingWarning?: string;
}

export function BatchVideoUpload({ playerId, playerName, onUploadComplete }: BatchVideoUploadProps) {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoUploadStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [currentTaggingIndex, setCurrentTaggingIndex] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cancelRef = useRef<boolean>(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      
      // Validate files
      const validFiles = files.filter(file => {
        if (!file.type.startsWith('video/')) {
          toast.error(`${file.name} is not a video file`);
          return false;
        }
        if (file.size > 100 * 1024 * 1024) {
          toast.error(`${file.name} is larger than 100MB`);
          return false;
        }
        return true;
      });

      // Add videos with tagging status
      const newVideos: VideoUploadStatus[] = validFiles.map(file => ({
        file,
        status: 'tagging',
        progress: 0,
        isExtractingMetadata: true
      }));

      setVideos(prev => [...prev, ...newVideos]);
      
      // Show tagging modal for first video
      if (validFiles.length > 0) {
        setCurrentTaggingIndex(videos.length);
        setShowTagModal(true);
      }
      
      // Extract metadata for each video
      const startIndex = videos.length;
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        try {
          const metadata = await extractVideoMetadata(file);
          
          // Generate warning for high frame rate videos
          let warning = undefined;
          if (metadata.frameRate > 240) {
            warning = "⚠️ Very high frame rate (>240fps). Processing may take 3-5 minutes. Consider recording at 120-240fps for faster processing.";
          } else if (metadata.frameRate > 120) {
            warning = "⚠️ High frame rate detected. Processing may take 2-3 minutes.";
          }
          
          setVideos(prev => prev.map((v, idx) => 
            idx === startIndex + i 
              ? { 
                  ...v, 
                  frameRate: metadata.frameRate,
                  width: metadata.width,
                  height: metadata.height,
                  duration: metadata.duration,
                  isExtractingMetadata: false,
                  processingWarning: warning
                }
              : v
          ));
        } catch (error) {
          console.error(`Error extracting metadata for ${file.name}:`, error);
          setVideos(prev => prev.map((v, idx) => 
            idx === startIndex + i 
              ? { ...v, isExtractingMetadata: false }
              : v
          ));
        }
      }

    }
  };

  const handleTagSubmit = (data: { videoType: string; drillId?: string; drillName?: string }) => {
    if (currentTaggingIndex === null) return;

    // Update the video with tag data
    setVideos(prev => prev.map((v, i) => 
      i === currentTaggingIndex 
        ? { 
            ...v, 
            status: 'pending',
            videoType: data.videoType,
            drillId: data.drillId,
            drillName: data.drillName
          }
        : v
    ));

    // Check if there are more videos to tag
    const nextIndex = currentTaggingIndex + 1;
    if (nextIndex < videos.length && videos[nextIndex].status === 'tagging') {
      setCurrentTaggingIndex(nextIndex);
    } else {
      setShowTagModal(false);
      setCurrentTaggingIndex(null);
      toast.success(`${videos.length} video${videos.length > 1 ? 's' : ''} tagged and ready to process`);
    }
  };

  const extractFramesAndPoseData = async (
    videoFile: File, 
    frameRate?: number,
    onProgressUpdate?: (progress: number, step: string) => void
  ): Promise<any[]> => {
    // Check for cancellation
    if (cancelRef.current) {
      throw new Error("Processing cancelled by user");
    }

    // For high-speed videos (>120fps), skip pose detection to save time
    if (frameRate && frameRate > 120) {
      console.log(`Skipping pose detection for ${frameRate}fps video - using fast mode`);
      onProgressUpdate?.(100, "Fast analysis mode (no pose detection)");
      return [];
    }

    return new Promise((resolve, reject) => {
      if (!videoRef.current || !canvasRef.current) {
        reject(new Error("Video or canvas ref not available"));
        return;
      }

      const videoElement = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      const poseFrames: any[] = [];
      let pose: Pose | null = null;
      let framesToProcess = 0;
      let framesProcessed = 0;

      // Create object URL for video
      const videoUrl = URL.createObjectURL(videoFile);
      videoElement.src = videoUrl;

      // Extended timeout for high FPS videos
      const timeoutDuration = frameRate && frameRate > 60 ? 180000 : 90000; // 3 min or 1.5 min
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(videoUrl);
        pose?.close();
        reject(new Error(`Processing timeout after ${timeoutDuration / 1000} seconds. Video may be too complex. Try recording at 60fps or less.`));
      }, timeoutDuration);

      videoElement.onloadedmetadata = async () => {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        const videoDuration = videoElement.duration;
        
        // Smart frame sampling based on video characteristics
        let maxFrames = 45;
        let samplingFps = 30;
        
        // Adjust based on frame rate
        if (frameRate && frameRate > 60) {
          maxFrames = 30; // Fewer frames for high FPS
          samplingFps = 20; // Lower sampling rate
        }
        
        const totalPossibleFrames = Math.ceil(videoDuration * (frameRate || 30));
        framesToProcess = Math.min(maxFrames, Math.ceil(videoDuration * samplingFps));
        
        onProgressUpdate?.(10, `Initializing pose detection (${framesToProcess} frames)...`);
        console.log(`Processing ${framesToProcess} frames (${frameRate || 30}fps video, ${videoDuration.toFixed(1)}s duration)`);

        // Initialize MediaPipe Pose
        pose = new Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        pose.setOptions({
          modelComplexity: 0, // Use fastest model
          smoothLandmarks: false,
          enableSegmentation: false,
          minDetectionConfidence: 0.3,
          minTrackingConfidence: 0.3
        });

        pose.onResults((results) => {
          if (results.poseLandmarks) {
            poseFrames.push({
              timestamp: videoElement.currentTime,
              landmarks: results.poseLandmarks
            });
          }
          framesProcessed++;
          
          // Update progress
          const progressPercent = Math.round((framesProcessed / framesToProcess) * 100);
          const estimatedTimePerFrame = 0.15; // seconds
          const remainingFrames = framesToProcess - framesProcessed;
          const estimatedTimeRemaining = Math.ceil(remainingFrames * estimatedTimePerFrame);
          
          onProgressUpdate?.(
            10 + (progressPercent * 0.6), // 10-70% of total progress
            `Analyzing frame ${framesProcessed}/${framesToProcess}... ${estimatedTimeRemaining}s remaining`
          );
        });

        await pose.initialize();
        onProgressUpdate?.(15, "Pose detector ready, starting frame analysis...");

        // Process frames with interval based on total frames
        const frameInterval = videoDuration / framesToProcess;
        let currentTime = 0;
        let frameIndex = 0;

        const processFrame = async () => {
          // Check for cancellation
          if (cancelRef.current) {
            clearTimeout(timeout);
            URL.revokeObjectURL(videoUrl);
            pose?.close();
            reject(new Error("Processing cancelled by user"));
            return;
          }

          if (frameIndex >= framesToProcess || currentTime >= videoElement.duration) {
            // Done processing
            clearTimeout(timeout);
            URL.revokeObjectURL(videoUrl);
            pose?.close();
            console.log(`Completed: ${poseFrames.length} frames processed`);
            resolve(poseFrames);
            return;
          }

          videoElement.currentTime = currentTime;
          await new Promise(r => {
            videoElement.onseeked = () => {
              ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
              pose?.send({ image: canvas }).then(r);
            };
          });

          currentTime += frameInterval;
          frameIndex++;
          setTimeout(processFrame, 5); // Reduced delay
        };

        processFrame();
      };

      videoElement.onerror = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(videoUrl);
        reject(new Error("Failed to load video"));
      };
    });
  };

  const processVideo = async (video: VideoUploadStatus, index: number): Promise<boolean> => {
    const startTime = Date.now();
    
    try {
      // Check for cancellation
      if (cancelRef.current) {
        throw new Error("Processing cancelled by user");
      }

      // Helper to update progress and step
      const updateProgress = (progress: number, step: string, estimatedTime?: number) => {
        setVideos(prev => prev.map((v, i) => 
          i === index ? { 
            ...v, 
            progress, 
            currentStep: step,
            estimatedTimeRemaining: estimatedTime
          } : v
        ));
      };

      // Update status to uploading
      updateProgress(5, "Preparing video...");
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Extract pose data from video
      updateProgress(10, "Starting pose detection...");
      setVideos(prev => prev.map((v, i) => 
        i === index ? { ...v, status: 'analyzing' } : v
      ));

      console.log(`Extracting pose data from ${video.file.name} (${video.frameRate}fps)...`);
      
      const poseData = await extractFramesAndPoseData(
        video.file, 
        video.frameRate,
        (progress, step) => updateProgress(progress, step)
      );
      
      console.log(`Extracted ${poseData.length} frames with pose data`);
      updateProgress(75, "Uploading video to storage...");

      // Update to uploading status
      setVideos(prev => prev.map((v, i) => 
        i === index ? { ...v, status: 'uploading' } : v
      ));

      // Upload video to storage
      const fileName = `${Date.now()}-${video.file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('swing-videos')
        .upload(fileName, video.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      updateProgress(85, "Video uploaded, analyzing swing mechanics...");

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('swing-videos')
        .getPublicUrl(fileName);

      // Send to analyze-swing edge function
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-swing', {
        body: {
          videoUrl: publicUrl,
          playerId: playerId,
          videoType: video.videoType || 'practice',
          drillId: video.drillId,
          drillName: video.drillName,
          keypoints: poseData,
          frames: poseData.length,
          sourceFrameRate: video.frameRate || 30,
          samplingFrameRate: 30
        }
      });

      if (analysisError) throw analysisError;

      updateProgress(95, "Finalizing analysis...");
      
      const totalTime = Math.round((Date.now() - startTime) / 1000);
      console.log(`Video processed in ${totalTime} seconds`);

      // Mark as completed
      toast.success(`${video.file.name} processed in ${totalTime}s`);
      
      setVideos(prev => prev.map((v, i) => 
        i === index ? { 
          ...v, 
          status: 'completed', 
          progress: 100,
          currentStep: `Complete (${totalTime}s)`,
          analysisId: analysisData.analysisId 
        } : v
      ));

      return true;

    } catch (error: any) {
      // Check if it was a user cancellation
      if (error.message === "Processing cancelled by user" || cancelRef.current) {
        console.log(`Processing cancelled for ${video.file.name}`);
        setVideos(prev => prev.map((v, i) => 
          i === index ? { 
            ...v, 
            status: 'pending',
            progress: 0,
            currentStep: undefined,
            error: 'Cancelled'
          } : v
        ));
        return false;
      }

      console.error(`Error processing ${video.file.name}:`, error);
      
      // Show helpful error message
      let errorMessage = error.message || 'Failed to process video';
      if (errorMessage.includes('timeout')) {
        errorMessage += ' Try recording at 60fps or less for faster processing.';
      }
      
      toast.error(`Failed: ${video.file.name} - ${errorMessage}`);
      
      setVideos(prev => prev.map((v, i) => 
        i === index ? { 
          ...v, 
          status: 'error', 
          currentStep: undefined,
          error: errorMessage
        } : v
      ));
      return false;
    }
  };

  const handleCancelProcessing = () => {
    setIsCancelling(true);
    cancelRef.current = true;
    toast.info("Cancelling upload...");
  };

  const handleStartProcessing = async () => {
    if (videos.length === 0) {
      toast.error("Please add videos first");
      return;
    }

    if (!playerId) {
      toast.error("Player ID is required");
      return;
    }

    setIsProcessing(true);
    setIsCancelling(false);
    cancelRef.current = false;
    toast.info(`Starting batch processing of ${videos.length} video${videos.length > 1 ? 's' : ''}...`);

    // Process videos one at a time
    let completed = 0;
    let cancelled = false;
    
    for (let i = 0; i < videos.length; i++) {
      if (videos[i].status === 'pending') {
        const success = await processVideo(videos[i], i);
        
        if (!success && cancelRef.current) {
          cancelled = true;
          break;
        }
        
        if (success) {
          completed++;
        }
      }
    }

    setIsProcessing(false);
    setIsCancelling(false);
    cancelRef.current = false;
    
    if (cancelled) {
      toast.warning(`Processing cancelled. ${completed} video${completed !== 1 ? 's' : ''} completed before cancellation.`);
    } else {
      const errors = videos.filter(v => v.status === 'error').length;
      
      if (errors === 0) {
        toast.success(`All ${completed} video${completed > 1 ? 's' : ''} processed successfully!`);
      } else {
        toast.warning(`Processed ${completed} video${completed > 1 ? 's' : ''} with ${errors} error${errors > 1 ? 's' : ''}`);
      }
    }

    onUploadComplete?.();
  };

  const handleRemoveVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setVideos([]);
  };

  const handleViewAnalysis = (analysisId: string) => {
    navigate(`/result/${analysisId}`);
  };

  const getStatusIcon = (status: VideoUploadStatus['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'uploading':
      case 'analyzing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <FileVideo className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: VideoUploadStatus['status']) => {
    switch (status) {
      case 'tagging':
        return 'Needs tagging';
      case 'pending':
        return 'Ready to process';
      case 'uploading':
        return 'Uploading...';
      case 'analyzing':
        return 'Analyzing...';
      case 'completed':
        return 'Complete';
      case 'error':
        return 'Failed';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Video Upload</CardTitle>
        <CardDescription>
          Upload and process multiple swing videos at once{playerName && ` for ${playerName}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File input */}
        <div className="space-y-2">
          <input
            id="batch-video-upload"
            type="file"
            accept="video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={isProcessing}
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => document.getElementById('batch-video-upload')?.click()}
            disabled={isProcessing}
          >
            <Upload className="h-4 w-4 mr-2" />
            Select Videos (Max 100MB each)
          </Button>
        </div>

        {/* Video list */}
        {videos.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {videos.length} video{videos.length > 1 ? 's' : ''} selected
              </p>
              {!isProcessing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                >
                  Clear All
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {videos.map((video, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getStatusIcon(video.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {video.file.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{(video.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                          {video.isExtractingMetadata ? (
                            <>
                              <span>•</span>
                              <Loader2 className="h-3 w-3 animate-spin inline" />
                              <span>Detecting fps...</span>
                            </>
                          ) : video.frameRate ? (
                            <>
                              <span>•</span>
                              <span className={
                                video.frameRate >= 120 
                                  ? "text-green-600 font-semibold" 
                                  : video.frameRate >= 60 
                                  ? "text-yellow-600 font-semibold" 
                                  : "text-red-600 font-semibold"
                              }>
                                {video.frameRate}fps
                              </span>
                              {video.width && video.height && (
                                <>
                                  <span>•</span>
                                  <span>{video.width}x{video.height}</span>
                                </>
                              )}
                            </>
                          ) : null}
                          <span>•</span>
                          <span>{getStatusText(video.status)}</span>
                        </div>
                        
                        {/* Current processing step */}
                        {video.currentStep && (
                          <p className="text-xs text-primary font-medium mt-1">
                            {video.currentStep}
                          </p>
                        )}
                        
                        {/* Processing warning */}
                        {video.processingWarning && video.status === 'pending' && (
                          <p className="text-xs text-yellow-600 font-medium mt-1">
                            {video.processingWarning}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {video.status === 'completed' && video.analysisId && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewAnalysis(video.analysisId!)}
                        >
                          View
                        </Button>
                      )}
                      {video.status === 'pending' && !isProcessing && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveVideo(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>

                  {(video.status === 'uploading' || video.status === 'analyzing') && (
                    <Progress value={video.progress} className="h-1" />
                  )}

                  {video.error && (
                    <p className="text-xs text-red-500">
                      {video.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Process/Cancel buttons */}
        {videos.length > 0 && (
          <div className="flex gap-2">
            {!isProcessing && (
              <Button
                onClick={handleStartProcessing}
                disabled={videos.every(v => v.status !== 'pending') || videos.some(v => v.status === 'tagging')}
                className="flex-1"
              >
                {videos.some(v => v.status === 'tagging') ? (
                  <>Complete tagging before processing</>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Process {videos.filter(v => v.status === 'pending').length} Video{videos.filter(v => v.status === 'pending').length > 1 ? 's' : ''}
                  </>
                )}
              </Button>
            )}
            
            {isProcessing && (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleCancelProcessing}
                disabled={isCancelling}
              >
                <XCircle className="h-4 w-4 mr-2" />
                {isCancelling ? 'Cancelling...' : 'Cancel Processing'}
              </Button>
            )}
          </div>
        )}

        {/* Info text */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Tag each video before processing</p>
          <p>• Videos will be processed one at a time</p>
          <p>• Each video must be under 100MB</p>
          <p>• Processing time: 30-60s (30-60fps) or 2-3min (120-240fps)</p>
          <p className="text-yellow-600 font-medium">• For fastest results: Record at 60fps or less</p>
        </div>

        <video ref={videoRef} style={{ display: 'none' }} />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </CardContent>

      <VideoTagModal 
        open={showTagModal}
        onOpenChange={setShowTagModal}
        onSubmit={handleTagSubmit}
        videoFileName={currentTaggingIndex !== null ? videos[currentTaggingIndex]?.file.name : undefined}
      />
    </Card>
  );
}
