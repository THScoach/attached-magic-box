import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdvancedVideoComparison } from "@/components/AdvancedVideoComparison";
import { ArrowLeft, Video } from "lucide-react";
import { toast } from "sonner";

interface Analysis {
  id: string;
  video_url: string;
  created_at: string;
  overall_score: number;
  bat_metrics?: any;
  ball_metrics?: any;
}

export default function VideoComparison() {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedA, setSelectedA] = useState<string>("");
  const [selectedB, setSelectedB] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("swing_analyses")
        .select(`
          id,
          video_url,
          created_at,
          overall_score,
          bat_metrics (bat_speed),
          ball_metrics (exit_velocity, launch_angle_grade)
        `)
        .eq("user_id", user.id)
        .not("video_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      setAnalyses(data || []);
      
      // Auto-select first two if available
      if (data && data.length >= 2) {
        setSelectedA(data[0].id);
        setSelectedB(data[1].id);
      } else if (data && data.length === 1) {
        setSelectedA(data[0].id);
      }
    } catch (error) {
      console.error("Error loading analyses:", error);
      toast.error("Failed to load swing analyses");
    } finally {
      setLoading(false);
    }
  };

  const getAnalysisById = (id: string) => {
    return analyses.find((a) => a.id === id);
  };

  const selectedAnalysisA = getAnalysisById(selectedA);
  const selectedAnalysisB = getAnalysisById(selectedB);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (analyses.length < 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-engine/20 via-anchor/10 to-whip/10 p-6">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Video Comparison</CardTitle>
              <CardDescription>
                Compare two swing analyses side-by-side
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">
                You need at least 2 swing analyses with videos to use comparison
              </p>
              <Button onClick={() => navigate("/analyze")}>
                Analyze a Swing
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-engine/20 via-anchor/10 to-whip/10 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Video Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Videos to Compare</CardTitle>
            <CardDescription>
              Choose two swing analyses to compare side-by-side
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Video A (Left/Blue)</label>
              <Select value={selectedA} onValueChange={setSelectedA}>
                <SelectTrigger>
                  <SelectValue placeholder="Select first video" />
                </SelectTrigger>
                <SelectContent>
                  {analyses.map((analysis) => (
                    <SelectItem 
                      key={analysis.id} 
                      value={analysis.id}
                      disabled={analysis.id === selectedB}
                    >
                      {new Date(analysis.created_at).toLocaleDateString()} - Score: {Math.round(analysis.overall_score)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Video B (Right/Green)</label>
              <Select value={selectedB} onValueChange={setSelectedB}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second video" />
                </SelectTrigger>
                <SelectContent>
                  {analyses.map((analysis) => (
                    <SelectItem 
                      key={analysis.id} 
                      value={analysis.id}
                      disabled={analysis.id === selectedA}
                    >
                      {new Date(analysis.created_at).toLocaleDateString()} - Score: {Math.round(analysis.overall_score)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Video Comparison */}
        {selectedAnalysisA && selectedAnalysisB && (
          <AdvancedVideoComparison
            videoA={{
              id: selectedAnalysisA.id,
              url: selectedAnalysisA.video_url,
              title: "Video A",
              date: new Date(selectedAnalysisA.created_at).toLocaleDateString(),
              score: Math.round(selectedAnalysisA.overall_score),
              metrics: {
                bat_speed: selectedAnalysisA.bat_metrics?.[0]?.bat_speed,
                exit_velocity: selectedAnalysisA.ball_metrics?.[0]?.exit_velocity,
              }
            }}
            videoB={{
              id: selectedAnalysisB.id,
              url: selectedAnalysisB.video_url,
              title: "Video B",
              date: new Date(selectedAnalysisB.created_at).toLocaleDateString(),
              score: Math.round(selectedAnalysisB.overall_score),
              metrics: {
                bat_speed: selectedAnalysisB.bat_metrics?.[0]?.bat_speed,
                exit_velocity: selectedAnalysisB.ball_metrics?.[0]?.exit_velocity,
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
