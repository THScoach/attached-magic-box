import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TempoHero } from "@/components/tempo/TempoHero";
import { MomentumMetrics } from "@/components/MomentumMetrics";

export default function BodyDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<any>(null);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    const { data: playerData } = await supabase
      .from("players")
      .select("*")
      .eq("id", id)
      .single();

    const { data: analysesData } = await supabase
      .from("swing_analyses")
      .select("*")
      .eq("player_id", id)
      .order("created_at", { ascending: false })
      .limit(5);

    setPlayer(playerData);
    setAnalyses(analysesData || []);
    setLoading(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-background p-4"><Skeleton className="h-48" /></div>;
  }

  const latest = analyses[0];
  const metrics = latest?.metrics as any;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 px-4 md:px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/players/${id}`)} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold">💪 BODY Dashboard</h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {player?.first_name} {player?.last_name} - Mechanics & Movement
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-4 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-5 w-5" />
              What is BODY?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">Body executes the swing after Brain makes the decision:</p>
            <ul className="space-y-2 text-sm">
              <li><strong>Tempo:</strong> Load/fire timing ratio</li>
              <li><strong>Kinematic Sequence:</strong> Pelvis → Torso → Arm → Bat</li>
              <li><strong>Rotational Velocities:</strong> Speed of body segments</li>
            </ul>
          </CardContent>
        </Card>

        {latest && metrics?.tempo && (
          <TempoHero
            loadMs={metrics.tempo.load_time}
            fireMs={metrics.tempo.fire_time}
            ratio={metrics.tempo.load_time / metrics.tempo.fire_time}
          />
        )}

        {latest && (
          <MomentumMetrics analysis={latest} />
        )}

        {latest && metrics?.momentum && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Kinematic Sequence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                The body generates power through sequential rotation:
              </p>
              
              <div className="flex items-center justify-center gap-2 md:gap-4 mb-4">
                <div className="flex-1 text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-500 mx-auto flex items-center justify-center text-2xl mb-2">
                    🔄
                  </div>
                  <p className="font-semibold text-sm">Pelvis</p>
                  <p className="text-xs text-muted-foreground mb-1">First to rotate</p>
                  <p className="text-sm font-bold">
                    {metrics.momentum.pelvis_peak_velocity || "—"} deg/s
                  </p>
                </div>
                
                <span className="text-2xl text-muted-foreground">→</span>
                
                <div className="flex-1 text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-green-500 mx-auto flex items-center justify-center text-2xl mb-2">
                    💪
                  </div>
                  <p className="font-semibold text-sm">Upper Torso</p>
                  <p className="text-xs text-muted-foreground mb-1">Second to rotate</p>
                  <p className="text-sm font-bold">
                    {metrics.momentum.upper_torso_peak_velocity || "—"} deg/s
                  </p>
                </div>
                
                <span className="text-2xl text-muted-foreground">→</span>
                
                <div className="flex-1 text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-yellow-500 mx-auto flex items-center justify-center text-2xl mb-2">
                    💪
                  </div>
                  <p className="font-semibold text-sm">Arm</p>
                  <p className="text-xs text-muted-foreground mb-1">Third to rotate</p>
                  <p className="text-sm font-bold">
                    {metrics.momentum.arm_peak_velocity || "—"} deg/s
                  </p>
                </div>
                
                <span className="text-2xl text-muted-foreground">→</span>
                
                <div className="flex-1 text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-red-500 mx-auto flex items-center justify-center text-2xl mb-2">
                    🏏
                  </div>
                  <p className="font-semibold text-sm">Bat</p>
                  <p className="text-xs text-muted-foreground mb-1">Last to accelerate</p>
                  <p className="text-sm font-bold">
                    {metrics.momentum.bat_peak_velocity || "—"} mph
                  </p>
                </div>
              </div>
              
              <div className="bg-primary/10 border-l-4 border-primary p-3 rounded italic text-sm">
                "Elite hitters generate power from the ground up. The pelvis leads, torso follows, then arms, and finally the bat whips through the zone."
              </div>
            </CardContent>
          </Card>
        )}

        {!latest && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">No body analysis yet. Upload a video to analyze mechanics.</p>
              <Button onClick={() => navigate('/reboot-analysis')}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Video
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
