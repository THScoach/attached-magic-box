import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Trash2, User, Mail, Calendar, Search, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AdminRoster() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<string>("");
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [teamName, setTeamName] = useState("");
  const [bulkAssignMode, setBulkAssignMode] = useState(false);
  const [bulkSelectedAthletes, setBulkSelectedAthletes] = useState<string[]>([]);

  // Fetch all roster relationships
  const { data: rosters, isLoading: rostersLoading } = useQuery({
    queryKey: ['admin-rosters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_rosters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get coach and athlete details
      const coachIds = [...new Set(data?.map(r => r.coach_id))];
      const athleteIds = [...new Set(data?.map(r => r.athlete_id))];

      const { data: coaches } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .in('id', coachIds);

      const { data: athletes } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .in('id', athleteIds);

      const coachMap = new Map(coaches?.map(c => [c.id, c]));
      const athleteMap = new Map(athletes?.map(a => [a.id, a]));

      return data?.map(r => ({
        ...r,
        coachName: coachMap.get(r.coach_id)?.first_name && coachMap.get(r.coach_id)?.last_name
          ? `${coachMap.get(r.coach_id)?.first_name} ${coachMap.get(r.coach_id)?.last_name}`
          : coachMap.get(r.coach_id)?.email || 'Unknown Coach',
        athleteName: athleteMap.get(r.athlete_id)?.first_name && athleteMap.get(r.athlete_id)?.last_name
          ? `${athleteMap.get(r.athlete_id)?.first_name} ${athleteMap.get(r.athlete_id)?.last_name}`
          : athleteMap.get(r.athlete_id)?.email || 'Unknown Athlete',
        coachEmail: coachMap.get(r.coach_id)?.email,
        athleteEmail: athleteMap.get(r.athlete_id)?.email
      }));
    }
  });

  // Fetch all coaches
  const { data: coaches } = useQuery({
    queryKey: ['all-coaches'],
    queryFn: async () => {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['coach', 'admin']);

      const coachIds = roleData?.map(r => r.user_id) || [];

      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .in('id', coachIds);

      if (error) throw error;
      return data;
    }
  });

  // Fetch all athletes (users without coach role)
  const { data: athletes } = useQuery({
    queryKey: ['all-athletes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name');

      if (error) throw error;
      return data;
    }
  });

  // Add roster relationships
  const addMutation = useMutation({
    mutationFn: async (relationships: Array<{ coach_id: string; athlete_id: string; team_name?: string }>) => {
      const { data, error } = await supabase
        .from('team_rosters')
        .insert(relationships)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rosters'] });
      setAddDialogOpen(false);
      setSelectedCoach("");
      setSelectedAthletes([]);
      setTeamName("");
      toast({
        title: "Athletes added",
        description: "Athletes have been successfully assigned to the coach"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error adding athletes",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Remove roster relationship
  const removeMutation = useMutation({
    mutationFn: async (rosterId: string) => {
      const { error } = await supabase
        .from('team_rosters')
        .delete()
        .eq('id', rosterId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rosters'] });
      toast({
        title: "Relationship removed",
        description: "Coach-athlete relationship has been removed"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error removing relationship",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Bulk assign coach
  const bulkAssignMutation = useMutation({
    mutationFn: async ({ coachId, athleteIds, teamName }: { coachId: string; athleteIds: string[]; teamName?: string }) => {
      const relationships = athleteIds.map(athleteId => ({
        coach_id: coachId,
        athlete_id: athleteId,
        team_name: teamName || null
      }));

      const { data, error } = await supabase
        .from('team_rosters')
        .insert(relationships)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rosters'] });
      setBulkAssignMode(false);
      setBulkSelectedAthletes([]);
      toast({
        title: "Bulk assignment complete",
        description: `Successfully assigned ${bulkSelectedAthletes.length} athletes to coach`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error with bulk assignment",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleAddRelationships = () => {
    if (!selectedCoach || selectedAthletes.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select a coach and at least one athlete",
        variant: "destructive"
      });
      return;
    }

    const relationships = selectedAthletes.map(athleteId => ({
      coach_id: selectedCoach,
      athlete_id: athleteId,
      team_name: teamName || null
    }));

    addMutation.mutate(relationships);
  };

  const filteredRosters = rosters?.filter(r =>
    r.athleteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.coachName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.team_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedByCoach = filteredRosters?.reduce((acc, roster) => {
    const key = roster.coach_id;
    if (!acc[key]) {
      acc[key] = {
        coachName: roster.coachName,
        coachEmail: roster.coachEmail,
        athletes: []
      };
    }
    acc[key].athletes.push(roster);
    return acc;
  }, {} as Record<string, { coachName: string; coachEmail: string; athletes: typeof rosters }>);

  if (rostersLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Roster</h1>
          <p className="text-muted-foreground">Manage coach-athlete relationships and team assignments</p>
        </div>
        <div className="flex gap-2">
          {bulkAssignMode ? (
            <>
              <Button variant="outline" onClick={() => {
                setBulkAssignMode(false);
                setBulkSelectedAthletes([]);
              }}>
                Cancel
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button disabled={bulkSelectedAthletes.length === 0}>
                    Assign Selected ({bulkSelectedAthletes.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Assign Coach</DialogTitle>
                    <DialogDescription>
                      Assign {bulkSelectedAthletes.length} athletes to a coach
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Coach</Label>
                      <Select value={selectedCoach} onValueChange={setSelectedCoach}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a coach..." />
                        </SelectTrigger>
                        <SelectContent>
                          {coaches?.map(coach => (
                            <SelectItem key={coach.id} value={coach.id}>
                              {coach.first_name && coach.last_name
                                ? `${coach.first_name} ${coach.last_name}`
                                : coach.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Team Name (Optional)</Label>
                      <Input
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="e.g., Varsity Team"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        if (selectedCoach) {
                          bulkAssignMutation.mutate({
                            coachId: selectedCoach,
                            athleteIds: bulkSelectedAthletes,
                            teamName
                          });
                        }
                      }}
                      disabled={!selectedCoach || bulkAssignMutation.isPending}
                    >
                      {bulkAssignMutation.isPending ? 'Assigning...' : 'Assign'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setBulkAssignMode(true)}>
                Bulk Assign
              </Button>
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Athletes
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Athletes to Coach</DialogTitle>
                    <DialogDescription>
                      Select a coach and one or more athletes to create relationships
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Coach *</Label>
                      <Select value={selectedCoach} onValueChange={setSelectedCoach}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a coach..." />
                        </SelectTrigger>
                        <SelectContent>
                          {coaches?.map(coach => (
                            <SelectItem key={coach.id} value={coach.id}>
                              {coach.first_name && coach.last_name
                                ? `${coach.first_name} ${coach.last_name}`
                                : coach.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Team Name (Optional)</Label>
                      <Input
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="e.g., Varsity Team, Junior Squad"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Select Athletes *</Label>
                      <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                        {athletes?.map(athlete => (
                          <div key={athlete.id} className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedAthletes.includes(athlete.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedAthletes([...selectedAthletes, athlete.id]);
                                } else {
                                  setSelectedAthletes(selectedAthletes.filter(id => id !== athlete.id));
                                }
                              }}
                            />
                            <label className="flex-1 cursor-pointer">
                              {athlete.first_name && athlete.last_name
                                ? `${athlete.first_name} ${athlete.last_name}`
                                : athlete.email}
                            </label>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedAthletes.length} athlete(s) selected
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleAddRelationships}
                      disabled={addMutation.isPending}
                    >
                      {addMutation.isPending ? 'Adding...' : 'Add Athletes'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Relationships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rosters?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Coaches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(groupedByCoach || {}).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Athletes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(rosters?.map(r => r.athlete_id)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(rosters?.map(r => r.team_name).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by coach, athlete, or team..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Roster by Coach */}
      <div className="space-y-4">
        {Object.entries(groupedByCoach || {}).map(([coachId, coachData]) => (
          <Card key={coachId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {coachData.coachName}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Mail className="h-3 w-3" />
                    {coachData.coachEmail}
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {coachData.athletes.length} Athlete{coachData.athletes.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {coachData.athletes.map(roster => (
                  <div
                    key={roster.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {bulkAssignMode && (
                        <Checkbox
                          checked={bulkSelectedAthletes.includes(roster.athlete_id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setBulkSelectedAthletes([...bulkSelectedAthletes, roster.athlete_id]);
                            } else {
                              setBulkSelectedAthletes(bulkSelectedAthletes.filter(id => id !== roster.athlete_id));
                            }
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{roster.athleteName}</span>
                          {roster.team_name && (
                            <Badge variant="outline">{roster.team_name}</Badge>
                          )}
                          {!roster.is_active && (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span>{roster.athleteEmail}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Added {formatDistanceToNow(new Date(roster.assigned_at), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {!bulkAssignMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Remove ${roster.athleteName} from ${roster.coachName}'s roster?`)) {
                            removeMutation.mutate(roster.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {(!groupedByCoach || Object.keys(groupedByCoach).length === 0) && (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No roster relationships found</p>
              <p className="text-sm mt-2">Click "Add Athletes" to create coach-athlete relationships</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
