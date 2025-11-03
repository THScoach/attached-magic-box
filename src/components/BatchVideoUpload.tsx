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
}

export function BatchVideoUpload({ playerId, playerName, onUploadComplete }: BatchVideoUploadProps) {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoUploadStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [currentTaggingIndex, setCurrentTaggingIndex] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
          setVideos(prev => prev.map((v, idx) => 
            idx === startIndex + i 
              ? { 
                  ...v, 
                  frameRate: metadata.frameRate,
                  width: metadata.width,
                  height: metadata.height,
                  duration: metadata.duration,
                  isExtractingMetadata: false
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

  const extractFramesAndPoseData = async (videoFile: File): Promise<any[]> => {
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

      // Create object URL for video
      const videoUrl = URL.createObjectURL(videoFile);
      videoElement.src = videoUrl;

      videoElement.onloadedmetadata = async () => {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        // Initialize MediaPipe Pose
        pose = new Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        pose.onResults((results) => {
          if (results.poseLandmarks) {
            poseFrames.push({
              timestamp: videoElement.currentTime,
              landmarks: results.poseLandmarks
            });
          }
        });

        await pose.initialize();

        // Extract frames at 30fps intervals
        const fps = 30;
        const frameInterval = 1 / fps;
        let currentTime = 0;

        const processFrame = async () => {
          if (currentTime >= videoElement.duration) {
            // Done processing
            URL.revokeObjectURL(videoUrl);
            pose?.close();
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
          setTimeout(processFrame, 10);
        };

        processFrame();
      };

      videoElement.onerror = () => {
        URL.revokeObjectURL(videoUrl);
        reject(new Error("Failed to load video"));
      };
    });
  };

  const processVideo = async (video: VideoUploadStatus, index: number): Promise<void> => {
    try {
      // Update status to uploading
      setVideos(prev => prev.map((v, i) => 
        i === index ? { ...v, status: 'uploading', progress: 10 } : v
      ));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Extract pose data from video
      setVideos(prev => prev.map((v, i) => 
        i === index ? { ...v, status: 'analyzing', progress: 20 } : v
      ));

      console.log(`Extracting pose data from ${video.file.name}...`);
      const poseData = await extractFramesAndPoseData(video.file);
      console.log(`Extracted ${poseData.length} frames with pose data`);

      setVideos(prev => prev.map((v, i) => 
        i === index ? { ...v, progress: 50 } : v
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

      setVideos(prev => prev.map((v, i) => 
        i === index ? { ...v, progress: 60 } : v
      ));

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('swing-videos')
        .getPublicUrl(fileName);

      // Send to analyze-swing edge function with pose data and tag metadata
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-swing', {
        body: {
          videoUrl: publicUrl,
          playerId: playerId,
          videoType: video.videoType || 'practice',
          drillId: video.drillId,
          drillName: video.drillName,
          keypoints: poseData,
          frames: poseData.length
        }
      });

      if (analysisError) throw analysisError;

      setVideos(prev => prev.map((v, i) => 
        i === index ? { ...v, progress: 90 } : v
      ));

      // Mark as completed with the analysis ID
      toast.success(`${video.file.name} uploaded successfully`);
      
      setVideos(prev => prev.map((v, i) => 
        i === index ? { 
          ...v, 
          status: 'completed', 
          progress: 100,
          analysisId: analysisData.analysisId 
        } : v
      ));

    } catch (error: any) {
      console.error(`Error processing ${video.file.name}:`, error);
      setVideos(prev => prev.map((v, i) => 
        i === index ? { 
          ...v, 
          status: 'error', 
          error: error.message || 'Failed to process video'
        } : v
      ));
    }
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
    toast.info(`Starting batch processing of ${videos.length} video${videos.length > 1 ? 's' : ''}...`);

    // Process videos one at a time
    for (let i = 0; i < videos.length; i++) {
      if (videos[i].status === 'pending') {
        await processVideo(videos[i], i);
      }
    }

    setIsProcessing(false);
    
    const completed = videos.filter(v => v.status === 'completed').length;
    const errors = videos.filter(v => v.status === 'error').length;
    
    if (errors === 0) {
      toast.success(`All ${completed} video${completed > 1 ? 's' : ''} processed successfully!`);
    } else {
      toast.warning(`Processed ${completed} video${completed > 1 ? 's' : ''} with ${errors} error${errors > 1 ? 's' : ''}`);
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

        {/* Process button */}
        {videos.length > 0 && (
          <Button
            onClick={handleStartProcessing}
            disabled={isProcessing || videos.every(v => v.status !== 'pending') || videos.some(v => v.status === 'tagging')}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : videos.some(v => v.status === 'tagging') ? (
              <>
                Complete tagging before processing
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Process {videos.filter(v => v.status === 'pending').length} Video{videos.filter(v => v.status === 'pending').length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        )}

        {/* Info text */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Tag each video before processing</p>
          <p>• Videos will be processed one at a time</p>
          <p>• Each video must be under 100MB</p>
          <p>• Processing may take 1-2 minutes per video</p>
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
