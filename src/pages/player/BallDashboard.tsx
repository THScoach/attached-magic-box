import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
}

interface BallData {
  id: string;
  created_at: string;
  exit_velocity: number;
  hard_hit_percentage: number | null;
  launch_angle_grade: number | null;
}

export default function BallDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [ballData, setBallData] = useState<BallData | null>(null);
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

    // Load latest ball metrics
    const { data: ballMetrics } = await supabase
      .from("ball_metrics")
      .select("*")
      .eq("player_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setBallData(ballMetrics);
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
              ⚾ BALL Dashboard
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {player.first_name} {player.last_name} - Output & Results
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-4 space-y-4">
        {/* What is Ball? */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5" />
              What is BALL?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              The Ball is the final result - what happens after contact. Key metrics:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <div>
                  <strong>Exit Velocity:</strong> How fast the ball leaves the bat
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <div>
                  <strong>Launch Angle:</strong> Vertical angle of ball flight
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <div>
                  <strong>Distance:</strong> How far the ball travels
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <div>
                  <strong>Spray Chart:</strong> Where balls are hit on the field
                </div>
              </li>
            </ul>
            
            <div className="bg-primary/10 border-l-4 border-primary p-3 rounded italic text-sm">
              "Exit velocity is the great equalizer. It doesn't lie." — MLB Scout
            </div>
          </CardContent>
        </Card>

        {/* Ball Metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span>Latest Ball Metrics</span>
              {ballData && (
                <span className="text-xs text-muted-foreground">
                  {new Date(ballData.created_at).toLocaleDateString()}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ballData ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Exit Velocity</p>
                    <p className="text-lg font-bold">{ballData.exit_velocity} mph</p>
                    {ballData.exit_velocity >= 95 && (
                      <p className="text-xs text-green-500 mt-1">✓ Elite MLB Range</p>
                    )}
                  </div>
                  {ballData.hard_hit_percentage !== null && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Hard Hit %</p>
                      <p className="text-lg font-bold">{ballData.hard_hit_percentage}%</p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Ball metrics are calculated from external sensors. Connect HitTrax, Rapsodo, or similar for full tracking.
                </p>
              </>
            ) : (
              <div className="space-y-3">
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <Target className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground mb-3">
                    No ball tracking data yet. Connect exit velocity sensors to track ball metrics.
                  </p>
                  <div className="space-y-2 text-xs text-left bg-background rounded-lg p-3">
                    <p className="font-semibold">Supported Ball Tracking Systems:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• <strong>HitTrax:</strong> Exit velo, launch angle, distance, spray chart</li>
                      <li>• <strong>Rapsodo:</strong> Exit velo, launch angle, spin rate</li>
                      <li>• <strong>Pocket Radar:</strong> Exit velocity</li>
                      <li>• <strong>Stalker:</strong> Exit velocity</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ball Flight Trajectory */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ball Flight Trajectory</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              From contact to landing, tracking the ball's path:
            </p>
            <div className="flex items-center justify-center gap-2 md:gap-4 mb-4">
              <div className="flex-1 text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary mx-auto flex items-center justify-center text-2xl mb-2">
                  🚀
                </div>
                <p className="font-semibold text-sm mb-1">Launch</p>
                <p className="text-xs text-muted-foreground mb-2">Contact point</p>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Exit Velo</p>
                  <p className="text-sm font-bold">
                    {ballData?.exit_velocity || "—"} mph
                  </p>
                </div>
              </div>
              
              <span className="text-2xl text-muted-foreground">→</span>
              
              <div className="flex-1 text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/60 mx-auto flex items-center justify-center text-2xl mb-2">
                  ⚾
                </div>
                <p className="font-semibold text-sm mb-1">Flight</p>
                <p className="text-xs text-muted-foreground mb-2">In the air</p>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Launch Angle</p>
                  <p className="text-sm font-bold">
                    {ballData?.launch_angle_grade ? `${ballData.launch_angle_grade}°` : "—"}
                  </p>
                </div>
              </div>
              
              <span className="text-2xl text-muted-foreground">→</span>
              
              <div className="flex-1 text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/80 mx-auto flex items-center justify-center text-2xl mb-2">
                  🎯
                </div>
                <p className="font-semibold text-sm mb-1">Impact</p>
                <p className="text-xs text-muted-foreground mb-2">Landing point</p>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Result</p>
                  <p className="text-sm font-bold">Hit</p>
                </div>
              </div>
            </div>
            
            <div className="bg-primary/10 border-l-4 border-primary p-3 rounded italic text-sm">
              "Optimal launch conditions: 90+ mph exit velo, 15-30° launch angle for line drives and fly balls."
            </div>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5" />
              Ball Flight Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1">Exit Velocity</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Increase exit velocity to elite levels
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Target: 95+ mph</span>
                  <span className="font-medium">{ballData ? `${ballData.exit_velocity} mph` : "Not Measured"}</span>
                </div>
              </div>

              <div className="border rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1">Launch Angle</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Optimize launch angle for line drives
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Target: 10-25°</span>
                  <span className="font-medium">Not Measured</span>
                </div>
              </div>

              <div className="border rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1">Hard Hit %</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Increase percentage of hard-hit balls
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Target: 50%+</span>
                  <span className="font-medium">{ballData?.hard_hit_percentage ? `${ballData.hard_hit_percentage}%` : "Not Measured"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
