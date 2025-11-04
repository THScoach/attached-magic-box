import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, Filter, Grid3x3, List, Play, Trash2, GitCompare, Calendar, VideoIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { PlayerSelector } from "@/components/PlayerSelector";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type ViewMode = "grid" | "list";
type SortBy = "date_desc" | "date_asc" | "score_desc" | "score_asc";

export default function VideoLibrary() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date_desc");
  const [minScore, setMinScore] = useState<number>(0);
  const [maxScore, setMaxScore] = useState<number>(100);

  const { data: videos, isLoading, refetch } = useQuery({
    queryKey: ['video-library', selectedPlayer, sortBy, minScore, maxScore],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('swing_analyses')
        .select(`
          id,
          video_url,
          created_at,
          overall_score,
          bat_score,
          body_score,
          ball_score,
          brain_score,
          drill_name,
          video_type,
          players (
            id,
            first_name,
            last_name
          )
        `)
        .eq('user_id', user.id)
        .not('video_url', 'is', null)
        .gte('overall_score', minScore)
        .lte('overall_score', maxScore);

      if (selectedPlayer && selectedPlayer !== 'all') {
        query = query.eq('player_id', selectedPlayer);
      }

      const [field, direction] = sortBy.split('_');
      if (field === 'date') {
        query = query.order('created_at', { ascending: direction === 'asc' });
      } else if (field === 'score') {
        query = query.order('overall_score', { ascending: direction === 'asc' });
      }

      const { data, error } = await query;
      if (error) throw error;

      return data;
    },
  });

  const { data: players } = useQuery({
    queryKey: ['players-for-filter'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('players')
        .select('id, first_name, last_name')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('last_name')
        .order('first_name');

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from('swing_analyses')
        .delete()
        .eq('id', videoId);

      if (error) throw error;

      toast.success('Video deleted successfully');
      refetch();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to delete video');
    }
  };

  const filteredVideos = videos?.filter(video => {
    if (!searchQuery) return true;
    
    const playerName = video.players 
      ? `${video.players.first_name} ${video.players.last_name}`.toLowerCase()
      : '';
    const drillName = video.drill_name?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();

    return playerName.includes(query) || drillName.includes(query);
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-bat/5 to-body/5 px-6 pt-8 pb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold mb-2">Video Library</h1>
        <p className="text-muted-foreground">
          Browse, search, and organize your swing videos
        </p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by player name or drill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {players && players.length > 0 && (
                <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Players" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Players</SelectItem>
                    {players.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.first_name} {player.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortBy)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_desc">Newest First</SelectItem>
                  <SelectItem value="date_asc">Oldest First</SelectItem>
                  <SelectItem value="score_desc">Highest Score</SelectItem>
                  <SelectItem value="score_asc">Lowest Score</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min Score"
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  min={0}
                  max={100}
                />
                <Input
                  type="number"
                  placeholder="Max Score"
                  value={maxScore}
                  onChange={(e) => setMaxScore(Number(e.target.value))}
                  min={0}
                  max={100}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {filteredVideos?.length || 0} video{filteredVideos?.length !== 1 ? 's' : ''} found
              </span>
              {(searchQuery || selectedPlayer !== 'all' || minScore > 0 || maxScore < 100) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedPlayer("all");
                    setMinScore(0);
                    setMaxScore(100);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Videos Grid/List */}
        {isLoading ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="aspect-video w-full mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredVideos && filteredVideos.length > 0 ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
            {filteredVideos.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video bg-black group">
                    <video
                      src={video.video_url}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => navigate(`/analysis/${video.id}`)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/comparison?swing=${video.id}`)}
                      >
                        <GitCompare className="h-4 w-4 mr-1" />
                        Compare
                      </Button>
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {video.players && (
                          <p className="font-semibold truncate">
                            {video.players.first_name} {video.players.last_name}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(video.created_at), 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>
                      <div className={`text-2xl font-bold ${getScoreColor(video.overall_score)}`}>
                        {video.overall_score}
                      </div>
                    </div>

                    {/* 4B Scores */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">BAT</div>
                        <div className="text-sm font-semibold">{video.bat_score}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">BODY</div>
                        <div className="text-sm font-semibold">{video.body_score}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">BALL</div>
                        <div className="text-sm font-semibold">{video.ball_score}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">BRAIN</div>
                        <div className="text-sm font-semibold">{video.brain_score}</div>
                      </div>
                    </div>

                    {video.drill_name && (
                      <Badge variant="secondary" className="text-xs">
                        {video.drill_name}
                      </Badge>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Video</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this video? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(video.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">No videos found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
