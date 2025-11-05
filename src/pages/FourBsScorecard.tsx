import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/BottomNav";
import { FourBsScorecard as FourBsScorecardComponent } from "@/components/FourBsScorecard";
import { useUserMembership } from "@/hooks/useUserMembership";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, TrendingUp, Camera, Award } from "lucide-react";

export default function FourBsScorecard() {
  const navigate = useNavigate();
  const { membership, loading: tierLoading } = useUserMembership();
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Get user tier from membership
  const tier = membership?.tier || 'free';

  useEffect(() => {
    loadLatestAnalysis();
  }, []);

  const loadLatestAnalysis = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to view your scorecard');
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('swing_analyses')
        .select('*, players(first_name, last_name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      setLatestAnalysis(data);
    } catch (error) {
      console.error('Error loading analysis:', error);
      // Don't show error toast if just no analysis found
    } finally {
      setLoading(false);
    }
  };

  if (loading || tierLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your scorecard...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!latestAnalysis) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-gradient-to-br from-ball/20 via-bat/10 to-body/10 px-6 pt-8 pb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Award className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">4 B's Scorecard</h1>
          </div>
          <p className="text-muted-foreground">
            Your complete swing analysis breakdown
          </p>
        </div>

        <div className="px-6 py-12">
          <Card className="p-8 text-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full inline-block">
              <Camera className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">No Analysis Yet</h3>
              <p className="text-muted-foreground mb-6">
                Upload your first swing video to see your 4 B's Scorecard
              </p>
            </div>
            <Button 
              size="lg"
              onClick={() => navigate('/analyze')}
            >
              <Camera className="h-5 w-5 mr-2" />
              Analyze Your Swing
            </Button>
          </Card>
        </div>

        <BottomNav />
      </div>
    );
  }

  const metrics = latestAnalysis.metrics || {};
  const playerName = latestAnalysis.players 
    ? `${latestAnalysis.players.first_name} ${latestAnalysis.players.last_name}`.trim()
    : 'Unknown Player';

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-brain/20 via-body/10 to-bat/10 px-6 pt-8 pb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <Award className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">4 B's Scorecard</h1>
        </div>
        <p className="text-muted-foreground mb-2">
          Complete breakdown for {playerName}
        </p>
        <Badge variant="secondary" className="text-xs">
          {new Date(latestAnalysis.created_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })}
        </Badge>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Overall H.I.T.S. Score Card */}
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Overall H.I.T.S. Score</span>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">
                {Math.round(latestAnalysis.overall_score)}
              </div>
              <p className="text-sm text-muted-foreground">
                Out of 100 points
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 4 B's Breakdown */}
        <FourBsScorecardComponent
          userTier={tier}
          metrics={metrics}
          analysisId={latestAnalysis.id}
        />

        {/* Legacy Scores for Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Legacy H.I.T.S. Pillars</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Anchor (Timing)</span>
              <Badge variant="secondary">{Math.round(latestAnalysis.anchor_score)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Engine (Power)</span>
              <Badge variant="secondary">{Math.round(latestAnalysis.engine_score)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Whip (Bat Speed)</span>
              <Badge variant="secondary">{Math.round(latestAnalysis.whip_score)}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* View Full Analysis Button */}
        <div className="flex gap-3">
          <Button 
            className="flex-1"
            variant="outline"
            onClick={() => navigate('/analyze')}
          >
            <Camera className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
          <Button 
            className="flex-1"
            onClick={() => navigate(`/result/${latestAnalysis.id}`)}
          >
            View Full Report
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
