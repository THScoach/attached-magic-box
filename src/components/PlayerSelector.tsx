import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Plus, User, ChevronRight, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  handedness: string | null;
  position: string | null;
  team_name: string | null;
  organization: string | null;
  jersey_number: string | null;
}

interface PlayerSelectorProps {
  selectedPlayerId: string | null;
  onSelectPlayer: (playerId: string | null) => void;
  limit?: number;
}

export function PlayerSelector({ selectedPlayerId, onSelectPlayer, limit }: PlayerSelectorProps) {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const { role, isCoach, isAthlete } = useUserRole();
  const [newPlayer, setNewPlayer] = useState({
    first_name: "",
    last_name: "",
    birth_date: "",
    handedness: "R",
    position: "",
    team_name: "",
    organization: "",
    jersey_number: "",
    height: "",
    weight: "",
    is_model: false
  });

  console.log('[PlayerSelector] Received selectedPlayerId:', selectedPlayerId);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('[PlayerSelector] No user found');
        setLoading(false);
        return;
      }

      console.log('[PlayerSelector] Loading players for user:', user.id);

      // Check if user is admin/coach - they can see all players
      const { data: userRoleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (roleError) {
        console.error('[PlayerSelector] Error checking role:', roleError);
      }

      const isAdminOrCoach = userRoleData?.role === 'admin' || userRoleData?.role === 'coach';
      console.log('[PlayerSelector] User role:', userRoleData?.role, 'isAdminOrCoach:', isAdminOrCoach);

      // Build query - admins/coaches see all players, others see only their own
      let query = supabase
        .from('players')
        .select('*')
        .eq('is_active', true);
      
      // If not admin/coach, filter by user_id
      if (!isAdminOrCoach) {
        console.log('[PlayerSelector] Filtering by user_id');
        query = query.eq('user_id', user.id);
      } else {
        console.log('[PlayerSelector] Admin/Coach - loading all players');
      }
      
      const { data, error } = await query
        .order('last_name')
        .order('first_name');

      if (error) {
        console.error('[PlayerSelector] Error loading players:', error);
        toast.error('Failed to load players: ' + error.message);
        setLoading(false);
        return;
      }

      console.log('[PlayerSelector] Successfully loaded players:', data?.length, data);
      setPlayers(data || []);
      setLoading(false);
      
      // Check if the selectedPlayerId exists in the loaded players
      if (selectedPlayerId && data) {
        const playerExists = data.some(p => p.id === selectedPlayerId);
        console.log('[PlayerSelector] Selected player exists in list:', playerExists);
        if (!playerExists) {
          console.warn('[PlayerSelector] Selected player ID not found in players list!');
        }
      }
      
      // Auto-select if only one player and no player pre-selected
      if (data && data.length === 1 && !selectedPlayerId) {
        console.log('[PlayerSelector] Auto-selecting single player:', data[0].id);
        onSelectPlayer(data[0].id);
      }
    } catch (err) {
      console.error('[PlayerSelector] Unexpected error:', err);
      toast.error('An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleCreatePlayer = async () => {
    if (!newPlayer.first_name.trim() || !newPlayer.last_name.trim()) {
      toast.error("Please enter first and last name");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please log in to create a player");
      return;
    }

    const { data, error } = await supabase
      .from('players')
      .insert({
        user_id: user.id,
        first_name: newPlayer.first_name.trim(),
        last_name: newPlayer.last_name.trim(),
        birth_date: newPlayer.birth_date || null,
        handedness: newPlayer.handedness || null,
        position: newPlayer.position.trim() || null,
        team_name: newPlayer.team_name.trim() || null,
        organization: newPlayer.organization.trim() || null,
        jersey_number: newPlayer.jersey_number.trim() || null,
        height: newPlayer.height ? parseFloat(newPlayer.height) : null,
        weight: newPlayer.weight ? parseFloat(newPlayer.weight) : null,
        is_model: isCoach ? newPlayer.is_model : false,
        height_weight_updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating player:', error);
      toast.error("Failed to create player");
      return;
    }

    toast.success(`Player "${newPlayer.first_name} ${newPlayer.last_name}" created!`);
    setShowDialog(false);
    setNewPlayer({
      first_name: "",
      last_name: "",
      birth_date: "",
      handedness: "R",
      position: "",
      team_name: "",
      organization: "",
      jersey_number: "",
      height: "",
      weight: "",
      is_model: false
    });
    
    loadPlayers();
    onSelectPlayer(data.id);
  };

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);
  console.log('[PlayerSelector] Rendering - selectedPlayer found:', selectedPlayer ? `${selectedPlayer.first_name} ${selectedPlayer.last_name}` : 'none', 'selectedPlayerId:', selectedPlayerId);

  // Filter players based on search query
  const filteredPlayers = players.filter(player => {
    const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  // Apply limit only when not searching
  const displayedPlayers = searchQuery.trim() 
    ? filteredPlayers 
    : limit 
      ? filteredPlayers.slice(0, limit) 
      : filteredPlayers;

  if (loading) {
    return (
      <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">Loading players...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">
            Select Player {players.length > 0 && `(${searchQuery ? filteredPlayers.length : displayedPlayers.length} of ${players.length})`}
          </Label>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Player
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Player</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>First Name *</Label>
                    <Input
                      placeholder="First name"
                      value={newPlayer.first_name}
                      onChange={(e) => setNewPlayer({ ...newPlayer, first_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input
                      placeholder="Last name"
                      value={newPlayer.last_name}
                      onChange={(e) => setNewPlayer({ ...newPlayer, last_name: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Birthdate</Label>
                    <Input
                      type="date"
                      value={newPlayer.birth_date}
                      onChange={(e) => setNewPlayer({ ...newPlayer, birth_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Handedness</Label>
                    <Select 
                      value={newPlayer.handedness} 
                      onValueChange={(value) => setNewPlayer({ ...newPlayer, handedness: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="R">Right (R)</SelectItem>
                        <SelectItem value="L">Left (L)</SelectItem>
                        <SelectItem value="S">Switch (S)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Position</Label>
                  <Input
                    placeholder="e.g., SS, CF, P"
                    value={newPlayer.position}
                    onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Team Name</Label>
                  <Input
                    placeholder="e.g., Varsity, JV, 12U"
                    value={newPlayer.team_name}
                    onChange={(e) => setNewPlayer({ ...newPlayer, team_name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Organization</Label>
                  <Input
                    placeholder="e.g., School, Travel Team"
                    value={newPlayer.organization}
                    onChange={(e) => setNewPlayer({ ...newPlayer, organization: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Jersey #</Label>
                  <Input
                    placeholder="Jersey number"
                    value={newPlayer.jersey_number}
                    onChange={(e) => setNewPlayer({ ...newPlayer, jersey_number: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Height (inches)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 72"
                      value={newPlayer.height}
                      onChange={(e) => setNewPlayer({ ...newPlayer, height: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Weight (lbs)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 180"
                      value={newPlayer.weight}
                      onChange={(e) => setNewPlayer({ ...newPlayer, weight: e.target.value })}
                    />
                  </div>
                </div>

                {isCoach && (
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <Label>Model Player</Label>
                      <p className="text-xs text-muted-foreground">
                        Mark as demo/reference player
                      </p>
                    </div>
                    <Switch
                      checked={newPlayer.is_model}
                      onCheckedChange={(checked) => 
                        setNewPlayer({ ...newPlayer, is_model: checked })
                      }
                    />
                  </div>
                )}

                <Button onClick={handleCreatePlayer} className="w-full">
                  Create Player
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Input - Always visible when players exist */}
        {players.length > 0 && (
          <div className="relative">
            <Input
              placeholder="🔍 Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-base"
            />
          </div>
        )}

        {players.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No players yet</p>
            <p className="text-xs">Add a player to start tracking swings</p>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No players match "{searchQuery}"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayedPlayers.map((player) => (
              <div
                key={player.id}
                className={`w-full p-3 rounded-lg border transition-all ${
                  selectedPlayerId === player.id
                    ? 'bg-primary/20 border-primary'
                    : 'bg-background/50 border-border hover:bg-background'
                }`}
              >
                <button
                  onClick={() => {
                    console.log('Selecting player:', player.first_name, player.last_name, player.id);
                    onSelectPlayer(player.id);
                  }}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div>
                    <div className="font-semibold">{player.last_name}, {player.first_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {[
                        player.birth_date && `${new Date().getFullYear() - new Date(player.birth_date).getFullYear()}yo`,
                        player.handedness && `${player.handedness}HH`,
                        player.position,
                        player.jersey_number && `#${player.jersey_number}`
                      ].filter(Boolean).join(' • ')}
                    </div>
                    {player.team_name && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {player.team_name}
                        {player.organization && ` - ${player.organization}`}
                      </div>
                    )}
                  </div>
                  {selectedPlayerId === player.id && (
                    <ChevronRight className="h-5 w-5 text-primary" />
                  )}
                </button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full mt-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/player/${player.id}`);
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Profile
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
