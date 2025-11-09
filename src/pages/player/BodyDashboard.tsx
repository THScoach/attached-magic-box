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
