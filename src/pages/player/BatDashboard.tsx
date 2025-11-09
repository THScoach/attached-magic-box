import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, BookOpen, Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
}

interface BatData {
  id: string;
  created_at: string;
  bat_speed: number;
  time_in_zone: number;
  attack_angle: number;
}

export default function BatDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [batData, setBatData] = useState<BatData | null>(null);
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

    // Load latest bat metrics
    const { data: batMetrics } = await supabase
      .from("bat_metrics")
      .select("*")
      .eq("player_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    setBatData(batMetrics);
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
              🏏 BAT Dashboard
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {player.first_name} {player.last_name} - Tool & Delivery
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-4 space-y-4">
        {/* What is Bat? */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5" />
              What is BAT?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              The Bat is the tool that delivers energy to the ball. Key metrics:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <div>
                  <strong>Bat Speed:</strong> How fast the bat moves through the zone
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <div>
                  <strong>Time in Zone:</strong> How long bat stays on ball's plane
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <div>
                  <strong>Attack Angle:</strong> Bat path through the zone
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <div>
                  <strong>On-Plane Efficiency:</strong> How consistently barrel meets ball
                </div>
              </li>
            </ul>
            
            <div className="bg-primary/10 border-l-4 border-primary p-3 rounded italic text-sm">
              "Bat speed is king. Everything else is a detail." — MLB Hitting Coach
            </div>
          </CardContent>
        </Card>

        {/* Bat Metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span>Latest Bat Metrics</span>
              {batData && (
                <span className="text-xs text-muted-foreground">
                  {new Date(batData.created_at).toLocaleDateString()}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {batData ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Bat Speed</p>
                    <p className="text-lg font-bold">{batData.bat_speed} mph</p>
                    {batData.bat_speed >= 70 && (
                      <p className="text-xs text-green-500 mt-1">✓ Elite MLB Range</p>
                    )}
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Time in Zone</p>
                    <p className="text-lg font-bold">{batData.time_in_zone} ms</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Attack Angle</p>
                    <p className="text-lg font-bold">{batData.attack_angle}°</p>
                    {batData.attack_angle >= 10 && batData.attack_angle <= 25 && (
                      <p className="text-xs text-green-500 mt-1">✓ Optimal</p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Bat metrics are calculated from video analysis. Connect a bat sensor for more precise measurements.
                </p>
              </>
            ) : (
              <div className="space-y-3">
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <Target className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground mb-3">
                    No bat sensor data yet. Bat metrics are estimated from video analysis or tracked with external sensors.
                  </p>
                  <div className="space-y-2 text-xs text-left bg-background rounded-lg p-3">
                    <p className="font-semibold">Supported Bat Sensors:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• <strong>Blast Motion:</strong> Bat speed, attack angle, time to contact</li>
                      <li>• <strong>Diamond Kinetics:</strong> Bat speed, swing plane, power</li>
                      <li>• <strong>Zepp:</strong> Bat speed, hand speed, attack angle</li>
                      <li>• <strong>HitTrax:</strong> Integrated bat + ball metrics</li>
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
              Bat Delivery Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1">Bat Speed</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Increase bat speed to elite levels
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Target: 70+ mph</span>
                  <span className="font-medium">{batData ? `${batData.bat_speed} mph` : "Not Measured"}</span>
                </div>
              </div>

              <div className="border rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1">Attack Angle</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Match pitch plane for optimal contact
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Target: 10-25°</span>
                  <span className="font-medium">{batData ? `${batData.attack_angle}°` : "Not Measured"}</span>
                </div>
              </div>

              <div className="border rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1">Time in Zone</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Stay on ball's plane longer
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Target: Maximize</span>
                  <span className="font-medium">{batData ? `${batData.time_in_zone}ms` : "Not Measured"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Drills */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Bat Speed Training</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border-l-4 border-primary bg-muted/30 rounded-r-lg p-3">
                <h4 className="font-semibold text-sm mb-1">Overload/Underload Training</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Swing heavy (32oz) and light (28oz) bats alternately
                </p>
                <p className="text-xs text-primary font-medium">
                  3x per week, 20 swings each
                </p>
              </div>

              <div className="border-l-4 border-primary bg-muted/30 rounded-r-lg p-3">
                <h4 className="font-semibold text-sm mb-1">Constraint Drills</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  One-hand swings, pause drills, connection drills
                </p>
                <p className="text-xs text-primary font-medium">
                  Daily warm-up
                </p>
              </div>

              <div className="border-l-4 border-primary bg-muted/30 rounded-r-lg p-3">
                <h4 className="font-semibold text-sm mb-1">Intent Swings</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Max effort swings off tee to build bat speed
                </p>
                <p className="text-xs text-primary font-medium">
                  2x per week, 10 swings
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
