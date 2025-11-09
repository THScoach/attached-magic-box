import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { BarChart3, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FourBScorecard {
  id: string;
  created_at: string;
  overall_score: number;
  brain_score: number;
  body_score: number;
  bat_score: number;
  ball_score: number;
}

interface Player4BScorecardsProps {
  playerId: string;
}

export function Player4BScorecards({ playerId }: Player4BScorecardsProps) {
  const [scorecards, setScorecards] = useState<FourBScorecard[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadScorecards();
  }, [playerId]);

  const loadScorecards = async () => {
    try {
      // TODO: Add four_b_scorecards table to database
      // For now, show empty state
      setScorecards([]);
    } catch (error) {
      console.error('Error loading 4B scorecards:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading scorecards...</p>
        </CardContent>
      </Card>
    );
  }

  if (scorecards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>4 B's Scorecards</CardTitle>
          <CardDescription>No 4 B's assessments completed yet</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/4bs')} className="w-full">
            <BarChart3 className="mr-2 h-4 w-4" />
            Complete 4 B's Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  const avgScore = scorecards.reduce((sum, s) => sum + s.overall_score, 0) / scorecards.length;

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{scorecards.length}</div>
            <p className="text-xs text-muted-foreground">Assessments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{avgScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground">Trend</p>
          </CardContent>
        </Card>
      </div>

      {/* Scorecards List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">4 B's History</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/4bs')}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            New Assessment
          </Button>
        </div>
        {scorecards.map((scorecard) => (
          <Card key={scorecard.id} className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => navigate(`/4bs/scorecard/${scorecard.id}`)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">
                        {format(new Date(scorecard.created_at), 'MMM dd, yyyy')}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        4 B's
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(scorecard.created_at), 'h:mm a')}
                    </p>
                    <div className="flex gap-3 mt-2">
                      <div className="text-xs">
                        <span className="text-muted-foreground">Brain: </span>
                        <span className="font-semibold">{scorecard.brain_score.toFixed(0)}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Body: </span>
                        <span className="font-semibold">{scorecard.body_score.toFixed(0)}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Bat: </span>
                        <span className="font-semibold">{scorecard.bat_score.toFixed(0)}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Ball: </span>
                        <span className="font-semibold">{scorecard.ball_score.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {scorecard.overall_score.toFixed(0)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
