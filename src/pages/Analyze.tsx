import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { Upload, Camera, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { extractVideoFrames, detectPoseInFrames } from "@/lib/videoAnalysis";

export default function Analyze() {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

      // Step 3: Detect poses in video (optional, takes time)
      toast.info("Detecting body movements...");
      let poseData = null;
      try {
        poseData = await detectPoseInFrames(file, (progress) => {
          setUploadProgress(50 + (progress * 0.3)); // 50-80%
        });
      } catch (poseError) {
        console.warn('Pose detection failed, continuing without it:', poseError);
      }
      
      setUploadProgress(80);

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
        poseData: poseData // Store pose data for skeleton overlay
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
        {!isAnalyzing ? (
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
                    Support for MP4, MOV files up to 100MB
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
                    onClick={() => {
                      toast.info("Camera recording coming soon!");
                    }}
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Record Now
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
              </ul>
            </Card>
          </>
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
