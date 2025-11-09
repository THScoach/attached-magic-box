import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, UserCheck, AlertCircle, Clock, TrendingUp, Upload, Eye, UserCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface Athlete {
  id: string;
  name: string;
  status: "active" | "trial" | "needs_attention";
  lastActivity: string;
  sequenceScore: number;
  anchorScore: number;
  engineScore: number;
  whipScore: number;
  userId: string;
}

const getStatusBadge = (status: Athlete["status"]) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Active</Badge>;
    case "trial":
      return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">Trial</Badge>;
    case "needs_attention":
      return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Needs Attention</Badge>;
  }
};

export function AthleteListManager() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | Athlete["status"]>("all");
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAthletes();
  }, []);

  const loadAthletes = async () => {
    try {
      setLoading(true);
      
      // Get all players with their profiles
      const { data: players, error: playersError } = await supabase
        .from("players")
        .select(`
          id,
          user_id,
          first_name,
          last_name,
          is_active
        `)
        .eq("is_active", true);

      if (playersError) throw playersError;

      // Get user memberships to determine status
      const { data: memberships, error: membershipsError } = await supabase
        .from("user_memberships")
        .select("user_id, tier, status");

      if (membershipsError) throw membershipsError;

      // Get latest activity
      const { data: activities, error: activitiesError } = await supabase
        .from("user_activity_tracking")
        .select("user_id, last_swing_upload, last_task_completion");

      if (activitiesError) throw activitiesError;

      // Get latest analyses with scores
      const { data: analyses, error: analysesError } = await supabase
        .from("swing_analyses")
        .select("user_id, anchor_score, engine_score, whip_score, overall_score, created_at")
        .order("created_at", { ascending: false });

      if (analysesError) throw analysesError;

      // Process and combine data
      const athletesData: Athlete[] = players?.map(player => {
        const membership = memberships?.find(m => m.user_id === player.user_id);
        const activity = activities?.find(a => a.user_id === player.user_id);
        const userAnalyses = analyses?.filter(a => a.user_id === player.user_id) || [];
        const latestAnalysis = userAnalyses[0];

        // Calculate average scores from recent analyses
        const recentAnalyses = userAnalyses.slice(0, 5);
        const avgAnchor = recentAnalyses.length > 0 
          ? Math.round(recentAnalyses.reduce((sum, a) => sum + Number(a.anchor_score), 0) / recentAnalyses.length)
          : 0;
        const avgEngine = recentAnalyses.length > 0 
          ? Math.round(recentAnalyses.reduce((sum, a) => sum + Number(a.engine_score), 0) / recentAnalyses.length)
          : 0;
        const avgWhip = recentAnalyses.length > 0 
          ? Math.round(recentAnalyses.reduce((sum, a) => sum + Number(a.whip_score), 0) / recentAnalyses.length)
          : 0;
        const avgSequence = recentAnalyses.length > 0 
          ? Math.round(recentAnalyses.reduce((sum, a) => sum + Number(a.overall_score), 0) / recentAnalyses.length)
          : 0;

        // Determine status
        let status: Athlete["status"] = "active";
        if (membership?.tier === "free") {
          status = "trial";
        } else {
          // Check if needs attention (no activity in 7+ days)
          const lastActivity = activity?.last_swing_upload || activity?.last_task_completion;
          if (lastActivity) {
            const daysSinceActivity = Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceActivity > 7) {
              status = "needs_attention";
            }
          }
        }

        // Format last activity
        let lastActivityStr = "No activity";
        const lastActivity = activity?.last_swing_upload || activity?.last_task_completion;
        if (lastActivity) {
          lastActivityStr = formatDistanceToNow(new Date(lastActivity), { addSuffix: true });
        }

        return {
          id: player.id,
          userId: player.user_id,
          name: `${player.first_name} ${player.last_name}`,
          status,
          lastActivity: lastActivityStr,
          sequenceScore: avgSequence,
          anchorScore: avgAnchor,
          engineScore: avgEngine,
          whipScore: avgWhip,
        };
      }) || [];

      setAthletes(athletesData);
    } catch (error) {
      console.error("Error loading athletes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAthletes = athletes.filter(athlete => {
    const matchesSearch = athlete.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "all" || athlete.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Athlete Roster</h3>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Athletes</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="needs-attention">Needs Attention</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading athletes...</div>
          ) : filteredAthletes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No athletes found</div>
          ) : (
            filteredAthletes.map((athlete) => (
            <div
              key={athlete.id}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  <UserCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        console.log('[AthleteListManager] Navigating to player profile:', athlete.id);
                        navigate(`/player/${athlete.id}`);
                      }}
                      className="font-medium hover:text-primary transition-colors cursor-pointer text-left"
                    >
                      {athlete.name}
                    </button>
                    {getStatusBadge(athlete.status)}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded-full bg-anchor"></span>
                      <span className="font-medium">{athlete.anchorScore}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded-full bg-engine"></span>
                      <span className="font-medium">{athlete.engineScore}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded-full bg-whip"></span>
                      <span className="font-medium">{athlete.whipScore}</span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">Sequence: {athlete.sequenceScore}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right mr-4">
                  <p className="text-sm font-medium">Last Activity</p>
                  <p className="text-xs text-muted-foreground">{athlete.lastActivity}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    navigate(`/player/${athlete.id}`);
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Analyze
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    console.log('[AthleteListManager] Navigating to player profile:', athlete.id);
                    navigate(`/player/${athlete.id}`);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
          )}
        </div>
      </div>
    </Card>
  );
}
