import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Plus, User, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface Player {
  id: string;
  name: string;
  age: number | null;
  handedness: string | null;
  position: string | null;
  team_name: string | null;
  organization: string | null;
  jersey_number: string | null;
}

interface PlayerSelectorProps {
  selectedPlayerId: string | null;
  onSelectPlayer: (playerId: string | null) => void;
}

export function PlayerSelector({ selectedPlayerId, onSelectPlayer }: PlayerSelectorProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    age: "",
    handedness: "R",
    position: "",
    team_name: "",
    organization: "",
    jersey_number: ""
  });

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error loading players:', error);
      return;
    }

    setPlayers(data || []);
    
    // Auto-select if only one player
    if (data && data.length === 1 && !selectedPlayerId) {
      onSelectPlayer(data[0].id);
    }
  };

  const handleCreatePlayer = async () => {
    if (!newPlayer.name.trim()) {
      toast.error("Please enter a player name");
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
        name: newPlayer.name.trim(),
        age: newPlayer.age ? parseInt(newPlayer.age) : null,
        handedness: newPlayer.handedness || null,
        position: newPlayer.position.trim() || null,
        team_name: newPlayer.team_name.trim() || null,
        organization: newPlayer.organization.trim() || null,
        jersey_number: newPlayer.jersey_number.trim() || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating player:', error);
      toast.error("Failed to create player");
      return;
    }

    toast.success(`Player "${newPlayer.name}" created!`);
    setShowDialog(false);
    setNewPlayer({
      name: "",
      age: "",
      handedness: "R",
      position: "",
      team_name: "",
      organization: "",
      jersey_number: ""
    });
    
    loadPlayers();
    onSelectPlayer(data.id);
  };

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);

  return (
    <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Select Player</Label>
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
                <div>
                  <Label>Name *</Label>
                  <Input
                    placeholder="Player name"
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Age</Label>
                    <Input
                      type="number"
                      placeholder="Age"
                      value={newPlayer.age}
                      onChange={(e) => setNewPlayer({ ...newPlayer, age: e.target.value })}
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

                <Button onClick={handleCreatePlayer} className="w-full">
                  Create Player
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {players.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No players yet</p>
            <p className="text-xs">Add a player to start tracking swings</p>
          </div>
        ) : (
          <div className="space-y-2">
            {players.map((player) => (
              <button
                key={player.id}
                onClick={() => onSelectPlayer(player.id)}
                className={`w-full p-3 rounded-lg border transition-all flex items-center justify-between ${
                  selectedPlayerId === player.id
                    ? 'bg-primary/20 border-primary'
                    : 'bg-background/50 border-border hover:bg-background'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold">{player.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {[
                      player.age && `${player.age}yo`,
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
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
