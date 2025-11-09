import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Brain, BookOpen, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
}

interface BrainData {
  id: string;
  created_at: string;
  reaction_time: number;
  good_swings_percentage: number | null;
  good_takes_percentage: number | null;
  chase_rate: number | null;
  focus_score: number | null;
}

export default function BrainDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [brainData, setBrainData] = useState<BrainData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    
    const { data: playerData } = await supabase
      .from("players")
      .select("id, first_name, last_name")
      .eq("id", id)
      .single();

    setPlayer(playerData);

    // Load latest brain metrics
    const { data: brainMetrics } = await supabase
      .from("brain_metrics")
      .select("*")
      .eq("player_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setBrainData(brainMetrics);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <Skeleton className="h-12 w-64 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <Alert>
          <AlertDescription>Player not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 px-4 md:px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/admin/players/${id}`)}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold">
              🧠 BRAIN Dashboard
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {player.first_name} {player.last_name} - Mental & Decision Making
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-4 space-y-4">
        {/* What is Brain? */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5" />
              What is BRAIN?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              The Brain is the first step in the hitting process. It's responsible for:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <div>
                  <strong>Pitch Recognition:</strong> Identifying pitch type and location
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <div>
                  <strong>Decision Making:</strong> Swing or no swing?
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <div>
                  <strong>Timing:</strong> When to start the swing
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <div>
                  <strong>Approach:</strong> Game plan and situational hitting
                </div>
              </li>
            </ul>
            
            <div className="bg-primary/10 border-l-4 border-primary p-3 rounded italic text-sm">
              "Hitting is 90% mental. The other half is physical." — Yogi Berra
            </div>
          </CardContent>
        </Card>

        {/* Brain Metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Cognitive & Decision Skills
              </span>
              {brainData && (
                <span className="text-xs text-muted-foreground">
                  Latest: {new Date(brainData.created_at).toLocaleDateString()}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {brainData ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Reaction Time</p>
                    <p className="text-lg font-bold">{brainData.reaction_time}ms</p>
                  </div>
                  {brainData.good_swings_percentage !== null && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Good Swings</p>
                      <p className="text-lg font-bold">{brainData.good_swings_percentage}%</p>
                    </div>
                  )}
                  {brainData.good_takes_percentage !== null && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Good Takes</p>
                      <p className="text-lg font-bold">{brainData.good_takes_percentage}%</p>
                    </div>
                  )}
                  {brainData.chase_rate !== null && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Chase Rate</p>
                      <p className="text-lg font-bold">{brainData.chase_rate}%</p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Brain metrics help measure pitch recognition, decision-making speed, and swing selection quality.
                </p>
              </>
            ) : (
              <div className="space-y-3">
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <Brain className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground mb-3">
                    No cognitive data yet. Brain metrics track mental aspects like reaction time, pitch recognition, and decision making.
                  </p>
                  <div className="space-y-2 text-xs text-left bg-background rounded-lg p-3">
                    <p className="font-semibold">Coming Soon:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• S2 Cognition Test integration</li>
                      <li>• Pitch recognition drills</li>
                      <li>• Swing decision tracking</li>
                      <li>• Game situation analysis</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5" />
              Brain Training Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1">Pitch Recognition</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Identify pitch type within 150ms
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Target: 90% accuracy</span>
                  <span className="font-medium">{brainData ? "In Progress" : "Not Measured"}</span>
                </div>
              </div>

              <div className="border rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1">Decision Speed</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Make swing/no-swing decision quickly
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Target: &lt; 200ms</span>
                  <span className="font-medium">{brainData ? `${brainData.reaction_time}ms` : "Not Measured"}</span>
                </div>
              </div>

              <div className="border rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1">Situational Awareness</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Execute game plan consistently
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Target: 80% success</span>
                  <span className="font-medium">Track in games</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Drills */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Brain Training Drills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border-l-4 border-primary bg-muted/30 rounded-r-lg p-3">
                <h4 className="font-semibold text-sm mb-1">Pitch Recognition Drills</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Watch video of pitches, call type before release point
                </p>
                <p className="text-xs text-primary font-medium">
                  Daily, 10 minutes
                </p>
              </div>

              <div className="border-l-4 border-primary bg-muted/30 rounded-r-lg p-3">
                <h4 className="font-semibold text-sm mb-1">Timing Drills</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Practice load timing with metronome or video
                </p>
                <p className="text-xs text-primary font-medium">
                  3x per week
                </p>
              </div>

              <div className="border-l-4 border-primary bg-muted/30 rounded-r-lg p-3">
                <h4 className="font-semibold text-sm mb-1">Situational Hitting</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Mental reps for different game situations
                </p>
                <p className="text-xs text-primary font-medium">
                  Before games
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
