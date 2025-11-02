import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Upload, Loader2, CheckCircle2, XCircle, FileVideo } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BatchVideoUploadProps {
  playerId: string;
  playerName?: string;
  onUploadComplete?: () => void;
}

interface VideoUploadStatus {
  file: File;
  status: 'pending' | 'uploading' | 'analyzing' | 'completed' | 'error';
  progress: number;
  error?: string;
  analysisId?: string;
}

export function BatchVideoUpload({ playerId, playerName, onUploadComplete }: BatchVideoUploadProps) {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoUploadStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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

      const newVideos: VideoUploadStatus[] = validFiles.map(file => ({
        file,
        status: 'pending',
        progress: 0
      }));

      setVideos(prev => [...prev, ...newVideos]);
      toast.success(`${validFiles.length} video${validFiles.length > 1 ? 's' : ''} added`);
    }
  };

  const processVideo = async (video: VideoUploadStatus, index: number): Promise<void> => {
    try {
      // Update status to uploading
      setVideos(prev => prev.map((v, i) => 
        i === index ? { ...v, status: 'uploading', progress: 10 } : v
      ));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

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
        i === index ? { ...v, progress: 40 } : v
      ));

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('swing-videos')
        .getPublicUrl(fileName);

      // Update status to analyzing
      setVideos(prev => prev.map((v, i) => 
        i === index ? { ...v, status: 'analyzing', progress: 50 } : v
      ));

      // Call analysis function
      const { data: analysisData, error: analysisError } = await supabase.functions
        .invoke('analyze-swing', {
          body: {
            videoUrl: publicUrl,
            playerId: playerId,
            userId: user.id,
            videoType: 'practice'
          }
        });

      if (analysisError) throw analysisError;

      setVideos(prev => prev.map((v, i) => 
        i === index ? { ...v, progress: 90 } : v
      ));

      // Save analysis to database
      const { data: savedAnalysis, error: dbError } = await supabase
        .from('swing_analyses')
        .insert({
          user_id: user.id,
          player_id: playerId,
          video_url: publicUrl,
          video_type: 'practice',
          overall_score: analysisData.overallScore || 0,
          anchor_score: analysisData.anchorScore || 0,
          engine_score: analysisData.engineScore || 0,
          whip_score: analysisData.whipScore || 0,
          metrics: analysisData
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Mark as completed
      setVideos(prev => prev.map((v, i) => 
        i === index ? { 
          ...v, 
          status: 'completed', 
          progress: 100,
          analysisId: savedAnalysis.id 
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
      case 'pending':
        return 'Pending';
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
                        <p className="text-xs text-muted-foreground">
                          {(video.file.size / (1024 * 1024)).toFixed(2)} MB • {getStatusText(video.status)}
                        </p>
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
            disabled={isProcessing || videos.every(v => v.status !== 'pending')}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
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
          <p>• Videos will be processed one at a time</p>
          <p>• Each video must be under 100MB</p>
          <p>• Processing may take 1-2 minutes per video</p>
        </div>
      </CardContent>
    </Card>
  );
}
