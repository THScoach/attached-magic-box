/**
 * Impact-Synchronized Analysis Component
 * Analyzes video captured with ImpactSyncRecorder using pose estimation and optional bat tracking
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Brain, Target, CheckCircle2, XCircle } from "lucide-react";
import { analyzeImpactSyncVideo, ImpactSyncAnalysisResult } from "@/lib/impactSyncPoseAnalysis";
import { extractFramesFromVideo } from "@/lib/videoFrameExtraction";
import { trackBatAcrossFrames, getMaxBatVelocity, calculateBatAngularVelocity } from "@/lib/batTracking";
import { supabase } from "@/integrations/supabase/client";

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

interface ImpactSyncAnalysisProps {
  recording: RecordingData;
  enableBatTracking?: boolean;
  onAnalysisComplete?: (analysisResult: any) => void;
}

export function ImpactSyncAnalysis({
  recording,
  enableBatTracking = false,
  onAnalysisComplete
}: ImpactSyncAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [batTrackingResult, setBatTrackingResult] = useState<any | null>(null);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      // Stage 1: Upload video to Supabase
      setAnalysisStage("Uploading video...");
      setAnalysisProgress(10);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const fileName = `${user.id}/impact-sync-${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('swing-videos')
        .upload(fileName, recording.videoBlob, {
          contentType: 'video/webm',
          upsert: false
        });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('swing-videos')
        .getPublicUrl(fileName);
      
      // Stage 2: Pose Estimation
      setAnalysisStage("Running pose estimation...");
      setAnalysisProgress(30);
      
      const poseResult = await analyzeImpactSyncVideo(
        recording.videoBlob,
        recording.impactFrameIndex,
        recording.metadata.frameRate
      );
      
      setAnalysisProgress(60);
      
      // Stage 3: Bat Tracking (if enabled)
      let batVelocity = null;
      let batTrackingSuccess = false;
      
      if (enableBatTracking) {
        setAnalysisStage("Tracking bat...");
        setAnalysisProgress(70);
        
        try {
          const frames = await extractFramesFromVideo(
            recording.videoBlob,
            recording.metadata.frameRate
          );
          
          const frameImages = frames.map(f => f.imageData);
          const batPositions = trackBatAcrossFrames(frameImages);
          const batVelocities = calculateBatAngularVelocity(batPositions);
          batVelocity = getMaxBatVelocity(batVelocities, 0.6);
          
          if (batVelocity !== null) {
            batTrackingSuccess = true;
            setBatTrackingResult({
              maxVelocity: batVelocity,
              positions: batPositions.filter(p => p.detected)
            });
          }
        } catch (batError) {
          console.warn("Bat tracking failed:", batError);
          // Gracefully degrade - continue without bat tracking
        }
      }
      
      setAnalysisProgress(80);
      
      // Stage 4: Apply correction factors
      setAnalysisStage("Applying MLB corrections...");
      
      const REBOOT_CORRECTION_FACTORS = {
        pelvis: 2.0,
        upperTorso: 1.4,
        arm: 2.2,
        bat: 1.3 // Correction for bat velocity
      };
      
      const correctedResult = {
        ...poseResult,
        pelvisMaxVelocity: Math.round(poseResult.pelvisMaxVelocity * REBOOT_CORRECTION_FACTORS.pelvis),
        torsoMaxVelocity: Math.round(poseResult.torsoMaxVelocity * REBOOT_CORRECTION_FACTORS.upperTorso),
        armMaxVelocity: Math.round(poseResult.armMaxVelocity * REBOOT_CORRECTION_FACTORS.arm),
        batMaxVelocity: batVelocity ? Math.round(batVelocity * REBOOT_CORRECTION_FACTORS.bat) : null
      };
      
      setAnalysisProgress(90);
      
      // Stage 5: Save to database
      setAnalysisStage("Saving results...");
      
      const { error: insertError } = await supabase
        .from('reboot_reports')
        .insert({
          user_id: user.id,
          video_url: publicUrl,
          pelvis_max_velocity: correctedResult.pelvisMaxVelocity,
          torso_max_velocity: correctedResult.torsoMaxVelocity,
          arm_max_velocity: correctedResult.armMaxVelocity,
          bat_max_velocity: correctedResult.batMaxVelocity,
          tempo_ratio: correctedResult.tempoRatio,
          load_duration: correctedResult.loadDuration,
          fire_duration: correctedResult.fireDuration,
          impact_frame: correctedResult.impactFrame,
          total_frames: correctedResult.totalFrames,
          frame_rate: correctedResult.frameRate,
          analysis_type: 'impact_sync',
          bat_tracking_enabled: enableBatTracking,
          bat_tracking_success: batTrackingSuccess
        });
      
      if (insertError) throw insertError;
      
      setAnalysisProgress(100);
      setAnalysisStage("Analysis complete!");
      setAnalysisResult(correctedResult);
      
      toast.success("Analysis complete!", {
        description: `Tempo: ${correctedResult.tempoRatio.toFixed(2)} | Pelvis: ${correctedResult.pelvisMaxVelocity} deg/s`
      });
      
      if (onAnalysisComplete) {
        onAnalysisComplete(correctedResult);
      }
      
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error(`Analysis failed: ${error.message}`);
      setAnalysisStage("Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Phase 2: Pose Analysis {enableBatTracking && "+ Phase 3: Bat Tracking"}
        </CardTitle>
        <CardDescription>
          Analyze captured video with AI pose estimation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recording Info */}
        <Alert>
          <Target className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Recording captured:</strong> {recording.totalFrames} frames 
            ({recording.metadata.preImpactSeconds.toFixed(1)}s pre + {recording.metadata.postImpactSeconds}s post)
            <br />
            <strong>Impact frame:</strong> {recording.impactFrameIndex} at {recording.impactTimestamp}ms
          </AlertDescription>
        </Alert>

        {/* Analysis Button */}
        {!isAnalyzing && !analysisResult && (
          <Button 
            onClick={startAnalysis}
            className="w-full"
            size="lg"
          >
            <Brain className="h-4 w-4 mr-2" />
            Analyze Video with AI
          </Button>
        )}

        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{analysisStage}</span>
              <span className="font-medium">{analysisProgress}%</span>
            </div>
            <Progress value={analysisProgress} className="h-2" />
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold flex items-center gap-2 text-success">
              <CheckCircle2 className="h-4 w-4" />
              Analysis Complete
            </h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Tempo Ratio</div>
                <div className="text-xl font-bold">{analysisResult.tempoRatio.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Load → Fire</div>
                <div className="text-sm font-medium">
                  {analysisResult.loadDuration.toFixed(0)}ms → {analysisResult.fireDuration.toFixed(0)}ms
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Pelvis</div>
                <div className="text-lg font-bold">{analysisResult.pelvisMaxVelocity} deg/s</div>
              </div>
              <div>
                <div className="text-muted-foreground">Upper Torso</div>
                <div className="text-lg font-bold">{analysisResult.torsoMaxVelocity} deg/s</div>
              </div>
              <div>
                <div className="text-muted-foreground">Arm</div>
                <div className="text-lg font-bold">{analysisResult.armMaxVelocity} deg/s</div>
              </div>
              {analysisResult.batMaxVelocity && (
                <div>
                  <div className="text-muted-foreground flex items-center gap-1">
                    Bat <CheckCircle2 className="h-3 w-3 text-success" />
                  </div>
                  <div className="text-lg font-bold">{analysisResult.batMaxVelocity} deg/s</div>
                </div>
              )}
              {enableBatTracking && !analysisResult.batMaxVelocity && (
                <div>
                  <div className="text-muted-foreground flex items-center gap-1">
                    Bat <XCircle className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="text-xs text-muted-foreground">Not detected</div>
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground italic">
              ✨ Values corrected to match MLB Hawkeye standards
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
