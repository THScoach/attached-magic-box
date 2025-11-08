import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, Upload, TrendingUp, BookOpen } from "lucide-react";
import { BrainMetricsView } from "@/components/BrainMetricsView";
import { BrainDataUpload } from "@/components/BrainDataUpload";
import { BrainTempoCorrelation } from "@/components/BrainTempoCorrelation";
import { MetricSourceBadge } from "@/components/MetricSourceBadge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { calculateGrade } from "@/lib/gradingSystem";

export default function BrainDashboard() {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"dynamic" | "educational">("educational");

  // Fetch brain metrics
  const { data: brainData, isLoading, refetch } = useQuery({
    queryKey: ["brain-metrics", playerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brain_metrics")
        .select("*")
        .eq("player_id", playerId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!playerId
  });

  // Fetch body metrics for correlation
  const { data: bodyData } = useQuery({
    queryKey: ["body-metrics-correlation", playerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("body_metrics")
        .select("tempo_ratio, created_at")
        .eq("player_id", playerId)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
    enabled: !!playerId && mode === "dynamic"
  });

  // Calculate correlation data
  const correlationData = brainData && bodyData ? 
    brainData.slice(0, bodyData.length).map((brain, idx) => ({
      date: brain.created_at,
      brainReactionTime: brain.reaction_time,
      bodyTempoRatio: bodyData[idx]?.tempo_ratio || 0,
      swingSuccess: brain.swing_decision_grade || 0
    })) : [];

  const hasData = brainData && brainData.length > 0;
  const latestMetrics = hasData ? brainData[0] : null;

  // Auto-switch to dynamic mode if data exists
  if (hasData && mode === "educational") {
    setMode("dynamic");
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="h-8 w-8" />
              Brain Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Cognitive performance & mental game metrics
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {hasData && (
              <MetricSourceBadge source="sensor" />
            )}
            <Badge variant={hasData ? "default" : "secondary"}>
              {hasData ? `${brainData.length} Test Sessions` : "No Data"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex gap-2">
          <Button
            variant={mode === "dynamic" ? "default" : "outline"}
            onClick={() => setMode("dynamic")}
            disabled={!hasData}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Dynamic View
          </Button>
          <Button
            variant={mode === "educational" ? "default" : "outline"}
            onClick={() => setMode("educational")}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Educational View
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto space-y-6">
        {mode === "educational" && !hasData && (
          <Alert>
            <BookOpen className="h-4 w-4" />
            <AlertDescription>
              <strong>Educational Mode:</strong> No brain/cognition data has been uploaded yet. 
              Below you'll see metric definitions and what they measure. Upload S2 Cognition or 
              Endres test data to see your actual results.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="metrics">Brain Metrics</TabsTrigger>
            <TabsTrigger value="correlation" disabled={!hasData}>
              Brain-Body Link
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            {mode === "educational" && !hasData ? (
              <Card>
                <CardHeader>
                  <CardTitle>📚 Understanding Brain Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">⏱️ Reaction Time</h4>
                      <p className="text-sm text-muted-foreground">
                        Measures how quickly you process visual information and initiate movement. 
                        Elite hitters: &lt;220ms. Impacts pitch recognition and decision-making speed.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">🎯 Swing Decision (Plate Discipline)</h4>
                      <p className="text-sm text-muted-foreground">
                        Tracks your ability to identify good pitches to swing at vs. bad pitches to take. 
                        Includes chase rate, swing success %, and take success %.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">🧘 Focus & Concentration</h4>
                      <p className="text-sm text-muted-foreground">
                        Measures sustained attention and mental endurance during at-bats. 
                        Critical for maintaining quality ABs throughout a game.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">👁️ Visual Recognition</h4>
                      <p className="text-sm text-muted-foreground">
                        Ability to identify pitch type, location, and spin early. 
                        Tested via S2 Cognition or similar visual training systems.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <h4 className="font-semibold mb-2">🚀 Why Brain Metrics Matter</h4>
                    <p className="text-sm">
                      Hitting is 90% mental. While bat speed and mechanics matter, your cognitive 
                      abilities determine pitch recognition, timing, and plate discipline. 
                      <strong> Upload test data to track your mental game improvement!</strong>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : latestMetrics ? (
              <BrainMetricsView
                reactionTime={latestMetrics.reaction_time}
                reactionTimeGrade={calculateGrade(latestMetrics.reaction_time_grade || 0)}
                averageReactionTime={
                  brainData.reduce((sum, m) => sum + m.reaction_time, 0) / brainData.length
                }
                goodSwingsPercentage={latestMetrics.good_swings_percentage || 0}
                goodTakesPercentage={latestMetrics.good_takes_percentage || 0}
                chaseRate={latestMetrics.chase_rate || 0}
                swingDecisionGrade={calculateGrade(latestMetrics.swing_decision_grade || 0)}
                totalPitches={latestMetrics.total_pitches || 0}
                focusScore={latestMetrics.focus_score || 0}
                focusGrade={calculateGrade(latestMetrics.focus_grade || 0)}
                consistencyRating={latestMetrics.consistency_rating || 0}
                dataSource="sensor"
              />
            ) : (
              <Alert>
                <AlertDescription>
                  No brain metrics available. Upload S2 Cognition or Endres test data to get started.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="correlation" className="space-y-4">
            {correlationData.length > 0 ? (
              <BrainTempoCorrelation data={correlationData} />
            ) : (
              <Alert>
                <AlertDescription>
                  Need both brain metrics and body tempo data to show correlation. 
                  Complete more swing analyses and brain tests.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <BrainDataUpload 
              playerId={playerId!} 
              onDataUploaded={() => {
                refetch();
                setMode("dynamic");
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
