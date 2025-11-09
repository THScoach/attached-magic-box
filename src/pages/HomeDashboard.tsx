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
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 px-4 py-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold">⚾ The Hitting Skool</h1>
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors flex items-center justify-center text-primary font-semibold"
          >
            {userName.charAt(0) || 'U'}
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Keep crushing it, {userName || 'Player'}!
        </p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Tempo Metrics */}
        {tempoData && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">YOUR SWING TEMPO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Load Time</p>
                  <p className="text-xl font-bold">{tempoData.load_time}ms</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Fire Time</p>
                  <p className="text-xl font-bold">{tempoData.fire_time}ms</p>
                </div>
              </div>
              
              {tempoRatio && tempoZone && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Tempo Ratio</p>
                  <p className="text-2xl font-bold mb-2">{tempoRatio.toFixed(1)}:1</p>
                  <Badge className={`${tempoZone.color} text-white text-xs`}>
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
            <CardHeader className="pb-3">
              <CardTitle className="text-base">MOMENTUM ANALYSIS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Pelvis</p>
                  <p className="text-lg font-bold">{momentumData.pelvis_speed} deg/s</p>
                  <p className="text-xs text-green-500 mt-1">Elite ✅</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Upper Torso</p>
                  <p className="text-lg font-bold">{momentumData.torso_speed} deg/s</p>
                  <p className="text-xs text-green-500 mt-1">Elite ✅</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Arm</p>
                  <p className="text-lg font-bold">{momentumData.arm_speed} deg/s</p>
                  <p className="text-xs text-green-500 mt-1">Elite ✅</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">4B Score</p>
                  <p className="text-lg font-bold">{latestAnalysis?.overall_score?.toFixed(0) || 'N/A'}</p>
                  <p className="text-xs text-green-500 mt-1">Excellent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">QUICK ACTIONS</h3>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => navigate('/reboot-analysis')}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-card hover:bg-accent transition-colors border border-border"
            >
              <Upload className="h-5 w-5 text-primary" />
              <span className="text-xs text-center">Upload PDF</span>
            </button>
            <button
              onClick={() => navigate('/reboot-analysis')}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-card hover:bg-accent transition-colors border border-border"
            >
              <Video className="h-5 w-5 text-primary" />
              <span className="text-xs text-center">Record Video</span>
            </button>
            <button
              onClick={() => navigate('/progress')}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-card hover:bg-accent transition-colors border border-border"
            >
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-xs text-center">Progress</span>
            </button>
            <button
              onClick={() => navigate('/comparison')}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-card hover:bg-accent transition-colors border border-border"
            >
              <GitCompare className="h-5 w-5 text-primary" />
              <span className="text-xs text-center">Compare</span>
            </button>
          </div>
        </div>

        {/* Latest Analysis */}
        {latestAnalysis && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">LATEST ANALYSIS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold">📊 Reboot Motion Analysis</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(latestAnalysis.created_at).toLocaleDateString()} | {latestAnalysis.video_type || 'Practice'}
                  {tempoRatio && ` | Tempo: ${tempoRatio.toFixed(1)}:1`}
                </p>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(`/result/${latestAnalysis.id}`)}
              >
                View Full Report <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Training Recommendation */}
        {tempoRatio && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">TRAINING RECOMMENDATION</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">
                Your game tempo ({tempoRatio.toFixed(1)}:1) shows {tempoRatio < 1.5 ? 'excellent transfer' : 'good power generation'}! 
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
          <CardContent className="py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl">🎵</div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Tempo Trainer</h3>
                <p className="text-xs text-muted-foreground">Practice 2:1 tempo with audio cues</p>
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
