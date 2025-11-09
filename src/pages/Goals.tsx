import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, TrendingUp, ArrowLeft } from "lucide-react";
import { GoalSetting } from "@/components/GoalSetting";
import { GoalTracker } from "@/components/GoalTracker";
import { PlayerProfileHeader } from "@/components/PlayerProfileHeader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";

export default function Goals() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>('');
  const [currentMetrics, setCurrentMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to view goals');
        navigate('/auth');
        return;
      }

      setUserId(user.id);

      // Load latest analysis for current metrics
      const { data: analysis, error } = await supabase
        .from('swing_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (analysis) {
        const metrics = (analysis.metrics as any) || {};
        setCurrentMetrics({
          overall_score: analysis.overall_score,
          anchor_score: analysis.anchor_score,
          engine_score: analysis.engine_score,
          whip_score: analysis.whip_score,
          bat_score: analysis.bat_score,
          ball_score: analysis.ball_score,
          body_score: analysis.body_score,
          brain_score: analysis.brain_score,
          bat_speed: metrics.batMaxVelocity,
          exit_velocity: metrics.exitVelocity,
          tempo_ratio: metrics.tempoRatio,
          attack_angle: metrics.attackAngle
        });
      } else {
        // No analyses yet - use default values
        setCurrentMetrics({
          overall_score: 0,
          anchor_score: 0,
          engine_score: 0,
          whip_score: 0,
          bat_score: 0,
          ball_score: 0,
          body_score: 0,
          brain_score: 0
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !currentMetrics) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PlayerProfileHeader />
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background px-6 pt-8 pb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Goal Setting & Tracking</h1>
            <p className="text-muted-foreground">
              Set SMART goals and track your progress toward elite performance
            </p>
          </div>
          <Target className="h-12 w-12 text-primary opacity-50" />
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        <Tabs defaultValue="tracker" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tracker">
              <TrendingUp className="h-4 w-4 mr-2" />
              My Goals
            </TabsTrigger>
            <TabsTrigger value="create">
              <Target className="h-4 w-4 mr-2" />
              Create Goals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tracker" className="mt-6">
            <GoalTracker userId={userId} />
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <GoalSetting 
              userId={userId}
              currentMetrics={currentMetrics}
            />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
