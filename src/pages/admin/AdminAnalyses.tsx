import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Search, Eye, TrendingUp, Calendar, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminAnalyses() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: analyses, isLoading } = useQuery({
    queryKey: ['admin-all-analyses'],
    queryFn: async () => {
      // Get all analyses
      const { data: analysesData, error: analysesError } = await supabase
        .from('swing_analyses')
        .select('id, created_at, overall_score, bat_score, ball_score, body_score, brain_score, player_id, user_id, video_type')
        .order('created_at', { ascending: false })
        .limit(100);

      if (analysesError) throw analysesError;

      // Get unique player IDs
      const playerIds = [...new Set(analysesData?.map(a => a.player_id).filter(Boolean))];
      
      // Fetch player names
      const { data: playersData } = await supabase
        .from('players')
        .select('id, first_name, last_name')
        .in('id', playerIds);

      // Map player names to analyses
      const playerMap = new Map(playersData?.map(p => [p.id, `${p.first_name} ${p.last_name}`]));

      return analysesData?.map(a => ({
        ...a,
        playerName: a.player_id ? playerMap.get(a.player_id) || 'Unknown Player' : 'No Player'
      }));
    }
  });

  const filteredAnalyses = analyses?.filter(a => 
    a.playerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-background">
      <div>
        <h1 className="text-3xl font-bold text-foreground">All Analyses</h1>
        <p className="text-muted-foreground">View and manage all swing analyses across all players</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyses?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {analyses?.length ? (analyses.reduce((sum, a) => sum + a.overall_score, 0) / analyses.length).toFixed(0) : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unique Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(analyses?.map(a => a.player_id).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyses?.filter(a => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(a.created_at) > weekAgo;
              }).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by player name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Analyses List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Analyses ({filteredAnalyses?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredAnalyses?.map(analysis => (
              <div
                key={analysis.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                onClick={() => navigate(`/result/${analysis.id}`)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex flex-col items-center">
                    <TrendingUp className="h-8 w-8 text-primary mb-1" />
                    <span className={`text-2xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                      {analysis.overall_score.toFixed(0)}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{analysis.playerName}</span>
                      {analysis.video_type && (
                        <Badge variant="outline">{analysis.video_type}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Bat</div>
                      <Badge variant={getScoreBadgeVariant(analysis.bat_score)}>
                        {analysis.bat_score.toFixed(0)}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Ball</div>
                      <Badge variant={getScoreBadgeVariant(analysis.ball_score)}>
                        {analysis.ball_score.toFixed(0)}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Body</div>
                      <Badge variant={getScoreBadgeVariant(analysis.body_score)}>
                        {analysis.body_score.toFixed(0)}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Brain</div>
                      <Badge variant={getScoreBadgeVariant(analysis.brain_score)}>
                        {analysis.brain_score.toFixed(0)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button size="sm" variant="outline" className="ml-4">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </div>
            ))}

            {(!filteredAnalyses || filteredAnalyses.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No analyses found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
