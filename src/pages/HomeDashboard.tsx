import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Video, TrendingUp, GitCompare, ArrowRight } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

export default function HomeDashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('id', user.id)
          .single();
        
        if (profile?.first_name) {
          setUserName(profile.first_name);
        }
      }
    };
    fetchProfile();
  }, []);

  // Fetch latest analysis
  const { data: latestAnalysis, isLoading } = useQuery({
    queryKey: ['latest-analysis'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('swing_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const getTempoZone = (ratio: number) => {
    if (ratio >= 2.5) return { zone: "Zone 1: Power", color: "bg-blue-500" };
    if (ratio >= 1.8) return { zone: "Zone 2: Balance", color: "bg-green-500" };
    if (ratio >= 1.2) return { zone: "Zone 3: Reaction", color: "bg-yellow-500" };
    return { zone: "Zone 4: Elite Speed", color: "bg-red-500" };
  };

  // Parse metrics from JSON
  const metrics = latestAnalysis?.metrics as any;
  const tempoData = metrics?.tempo;
  const momentumData = metrics?.momentum;
  const tempoRatio = tempoData?.load_time && tempoData?.fire_time 
    ? tempoData.load_time / tempoData.fire_time 
    : null;
  const tempoZone = tempoRatio ? getTempoZone(tempoRatio) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border p-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-foreground">⚾ The Hitting Skool</h1>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate('/profile')}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {userName.charAt(0) || 'U'}
            </div>
          </Button>
        </div>
        <p className="text-muted-foreground">
          Keep crushing it, {userName || 'Player'}!
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Tempo Metrics */}
        {tempoData && (
          <Card>
            <CardHeader>
              <CardTitle>Your Swing Tempo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Load Time</p>
                  <p className="text-2xl font-bold text-foreground">{tempoData.load_time}ms</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Fire Time</p>
                  <p className="text-2xl font-bold text-foreground">{tempoData.fire_time}ms</p>
                </div>
              </div>
              
              {tempoRatio && tempoZone && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-2">Tempo Ratio</p>
                  <p className="text-3xl font-bold text-foreground mb-2">{tempoRatio.toFixed(1)}:1</p>
                  <Badge className={`${tempoZone.color} text-white`}>
                    {tempoZone.zone} ⚡
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Momentum Analysis */}
        {momentumData && (
          <Card>
            <CardHeader>
              <CardTitle>Momentum Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Pelvis</p>
                  <p className="text-xl font-bold text-foreground">{momentumData.pelvis_speed} deg/s</p>
                  <p className="text-xs text-green-500 mt-1">Elite ✅</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Upper Torso</p>
                  <p className="text-xl font-bold text-foreground">{momentumData.torso_speed} deg/s</p>
                  <p className="text-xs text-green-500 mt-1">Elite ✅</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Arm</p>
                  <p className="text-xl font-bold text-foreground">{momentumData.arm_speed} deg/s</p>
                  <p className="text-xs text-green-500 mt-1">Elite ✅</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">4B Score</p>
                  <p className="text-xl font-bold text-foreground">{latestAnalysis?.overall_score || 'N/A'}</p>
                  <p className="text-xs text-green-500 mt-1">Excellent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/reboot-analysis')}
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Upload className="h-6 w-6 text-primary" />
                <span className="text-xs text-center text-foreground">Upload PDF</span>
              </button>
              <button
                onClick={() => navigate('/reboot-analysis')}
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Video className="h-6 w-6 text-primary" />
                <span className="text-xs text-center text-foreground">Record Video</span>
              </button>
              <button
                onClick={() => navigate('/progress')}
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <TrendingUp className="h-6 w-6 text-primary" />
                <span className="text-xs text-center text-foreground">Progress Track</span>
              </button>
              <button
                onClick={() => navigate('/comparison')}
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <GitCompare className="h-6 w-6 text-primary" />
                <span className="text-xs text-center text-foreground">Compare Swings</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Latest Analysis */}
        {latestAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle>Latest Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">📊 Motion Analysis</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(latestAnalysis.created_at).toLocaleDateString()} | {latestAnalysis.video_type || 'Practice'}
                    {tempoRatio && ` | Tempo: ${tempoRatio.toFixed(1)}:1`}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/analysis/${latestAnalysis.id}`)}
              >
                View Full Report <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Training Recommendation */}
        {tempoRatio && (
          <Card>
            <CardHeader>
              <CardTitle>Training Recommendation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-foreground">
                Your tempo ratio ({tempoRatio.toFixed(1)}:1) shows {tempoRatio < 1.5 ? 'excellent reaction speed' : 'good power generation'}! 
                Keep training in Zone {tempoRatio >= 2.5 ? '1' : tempoRatio >= 1.8 ? '2' : '3'} to maintain this.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/training')}
              >
                View Training Plan <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tempo Trainer CTA */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl">🎵</div>
              <div>
                <h3 className="font-semibold text-foreground">Tempo Trainer</h3>
                <p className="text-sm text-muted-foreground">Practice tempo with audio cues</p>
              </div>
            </div>
            <Button 
              className="w-full"
              onClick={() => navigate('/training')}
            >
              Start Training <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* No Data State */}
        {!latestAnalysis && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">No swing data yet. Get started by uploading your first analysis!</p>
              <Button onClick={() => navigate('/reboot-analysis')}>
                Upload First Swing
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
