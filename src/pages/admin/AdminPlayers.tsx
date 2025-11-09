import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Upload, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AddAthleteModal } from "@/components/AddAthleteModal";

interface Player {
  id: string;
  userId: string;
  name: string;
  email: string;
  tier: string;
  grade: string;
  lastActive: string;
  status: "active" | "inactive" | "needs_attention";
}

export default function AdminPlayers() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      // Load all active players for admins
      const { data: playersData, error } = await supabase
        .from("players")
        .select(`
          id,
          user_id,
          first_name,
          last_name
        `)
        .eq('is_active', true)
        .order('last_name')
        .order('first_name');

      if (error) {
        console.error('Error loading players:', error);
        throw error;
      }

      // Get profiles separately to get emails
      const userIds = playersData?.map(p => p.user_id) || [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email")
        .in('id', userIds);

      // Get memberships
      const { data: memberships } = await supabase
        .from("user_memberships")
        .select("user_id, tier");

      // Get activity
      const { data: activity } = await supabase
        .from("user_activity_tracking")
        .select("user_id, last_swing_upload");

      // Get latest analysis for grade
      const { data: analyses } = await supabase
        .from("swing_analyses")
        .select("user_id, overall_score, created_at")
        .order("created_at", { ascending: false });

      const processedPlayers: Player[] = (playersData || []).map((player: any) => {
        const profile = profiles?.find(p => p.id === player.user_id);
        const membership = memberships?.find(m => m.user_id === player.user_id);
        const playerActivity = activity?.find(a => a.user_id === player.user_id);
        const latestAnalysis = analyses?.find(a => a.user_id === player.user_id);

        const daysSinceActive = playerActivity?.last_swing_upload
          ? Math.floor((Date.now() - new Date(playerActivity.last_swing_upload).getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        const status: Player["status"] = daysSinceActive > 7 ? "needs_attention" : "active";

        return {
          id: player.id,
          userId: player.user_id,
          name: `${player.first_name} ${player.last_name}`,
          email: profile?.email || "",
          tier: membership?.tier || "free",
          grade: latestAnalysis ? getLetterGrade(latestAnalysis.overall_score) : "-",
          lastActive: playerActivity?.last_swing_upload
            ? formatDistanceToNow(new Date(playerActivity.last_swing_upload), { addSuffix: true })
            : "Never",
          status
        };
      });

      setPlayers(processedPlayers);
    } catch (error) {
      console.error("Error loading players:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLetterGrade = (score: number): string => {
    if (score >= 90) return "A";
    if (score >= 80) return "B+";
    if (score >= 70) return "B";
    if (score >= 60) return "C+";
    return "C";
  };

  const getStatusBadge = (status: Player["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500">Active</Badge>;
      case "needs_attention":
        return <Badge className="bg-red-500/10 text-red-500">Needs Attention</Badge>;
      default:
        return <Badge variant="secondary">Inactive</Badge>;
    }
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      free: "bg-gray-500/10 text-gray-500",
      challenge: "bg-blue-500/10 text-blue-500",
      diy: "bg-purple-500/10 text-purple-500",
      elite: "bg-yellow-500/10 text-yellow-500"
    };
    return <Badge className={colors[tier] || ""}>{tier.toUpperCase()}</Badge>;
  };

  const filteredPlayers = players
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = tierFilter === "all" || p.tier === tierFilter;
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesTier && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "grade") return b.grade.localeCompare(a.grade);
      return 0;
    });

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Loading players...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 px-4 md:px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Players</h1>
            <p className="text-xs md:text-sm text-muted-foreground">Manage your team</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} size="sm">
            <UserPlus className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Add Player</span>
          </Button>
        </div>
      </div>

      <div className="px-4 md:px-6 py-4 space-y-4">
        {/* Search and Filters */}
        <Card className="p-3">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="challenge">Challenge</SelectItem>
                  <SelectItem value="diy">DIY</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="grade">Grade</SelectItem>
                  <SelectItem value="active">Last Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Players List */}
        {filteredPlayers.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            No players found
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredPlayers.map((player) => (
              <Card 
                key={player.id} 
                className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => navigate(`/admin/players/${player.id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-sm md:text-base truncate">{player.name}</h3>
                      {getTierBadge(player.tier)}
                      {getStatusBadge(player.status)}
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-xs text-muted-foreground">
                      <span className="font-bold text-primary">Grade: {player.grade}</span>
                      <span className="truncate">{player.lastActive}</span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/players/${player.id}`);
                    }}
                    className="shrink-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddAthleteModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={loadPlayers}
        availableSeats={999}
      />
    </div>
  );
}
