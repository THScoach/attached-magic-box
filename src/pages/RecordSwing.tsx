import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Video } from "lucide-react";
import { ImpactSyncRecorder } from "@/components/ImpactSyncRecorder";
import { ImpactSyncAnalysis } from "@/components/ImpactSyncAnalysis";
import { BottomNav } from "@/components/BottomNav";
import { useUserRole } from "@/hooks/useUserRole";

export default function RecordSwing() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const { isAdmin, isCoach } = useUserRole();
  const [recording, setRecording] = useState<any | null>(null);
  const [enableBatTracking, setEnableBatTracking] = useState(false);

  // Redirect admins/coaches away - they shouldn't record
  if (isAdmin || isCoach) {
    navigate(`/player/${playerId}`);
    return null;
  }

  const handleRecordingComplete = (recordingData: any) => {
    setRecording(recordingData);
  };

  const handleAnalysisComplete = (analysisId: string) => {
    navigate(`/result/${analysisId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-6 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/player/${playerId}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Player
        </Button>

        {!recording ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Record Your Swing</CardTitle>
                <CardDescription>
                  Use impact-synchronized recording for best results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImpactSyncRecorder 
                  onRecordingComplete={handleRecordingComplete}
                  enableAudioDetection={true}
                />
              </CardContent>
            </Card>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            <Button 
              onClick={() => navigate(`/upload/video/${playerId}`)}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Video className="mr-2 h-4 w-4" />
              Upload Existing Video
            </Button>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Analyzing Recording...</CardTitle>
            </CardHeader>
            <CardContent>
              <ImpactSyncAnalysis
                recording={recording}
                enableBatTracking={enableBatTracking}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
