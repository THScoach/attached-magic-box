import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePlayerAnalyses } from "@/hooks/usePlayerAnalyses";
import { format } from "date-fns";
import { Play, TrendingUp, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlayerAnalysisHistoryProps {
  playerId: string;
}

export function PlayerAnalysisHistory({ playerId }: PlayerAnalysisHistoryProps) {
  const { analyses, stats, loading } = usePlayerAnalyses(playerId);
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading analyses...</p>
        </CardContent>
      </Card>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Swing History</CardTitle>
          <CardDescription>No swing analyses recorded yet</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/analyze')} className="w-full">
            <Video className="mr-2 h-4 w-4" />
            Record First Swing
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalSwings}</div>
            <p className="text-xs text-muted-foreground">Total Swings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.avgScore.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Avg H.I.T.S.</p>
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

      {/* Analysis List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Analyses</h3>
          <Badge variant="secondary" className="text-xs">Last 5</Badge>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">
          View older analyses in the Schedule tab calendar
        </p>
        {analyses.slice(0, 5).map((analysis) => (
          <Card key={analysis.id} className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => navigate(`/player/${playerId}/analysis/${analysis.id}`)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                    <Play className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">
                        {format(new Date(analysis.created_at), 'MMM dd, yyyy')}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {analysis.video_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(analysis.created_at), 'h:mm a')}
                    </p>
                    <div className="flex gap-3 mt-2">
                      <div className="text-xs">
                        <span className="text-muted-foreground">H.I.T.S.: </span>
                        <span className="font-semibold">{analysis.overall_score.toFixed(0)}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">A: </span>
                        <span className="font-semibold">{analysis.anchor_score.toFixed(0)}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">E: </span>
                        <span className="font-semibold">{analysis.engine_score.toFixed(0)}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">W: </span>
                        <span className="font-semibold">{analysis.whip_score.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {analysis.overall_score.toFixed(0)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
