import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Calendar, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface TeamGroup {
  id: string;
  teamName: string;
  coachName: string;
  athleteCount: number;
  activeAthletes: number;
  createdAt: string;
  athletes: Array<{
    id: string;
    name: string;
    lastActive: string;
  }>;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Roster {
  id: string;
  coach_id: string;
  athlete_id: string;
  team_name: string | null;
  assigned_at: string | null;
}

interface Activity {
  user_id: string;
  last_swing_upload: string | null;
  last_task_completion: string | null;
}

export function TeamsManager() {
  const [teams, setTeams] = useState<TeamGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);

      // Get all team rosters
      const { data: rosters, error: rostersError } = await supabase
        .from("team_rosters")
        .select("id, coach_id, athlete_id, team_name, assigned_at")
        .eq("is_active", true);

      if (rostersError) throw rostersError;

      if (!rosters || rosters.length === 0) {
        setTeams([]);
        setLoading(false);
        return;
      }

      // Get unique coach and athlete IDs
      const coachIds = [...new Set(rosters.map(r => r.coach_id))];
      const athleteIds = [...new Set(rosters.map(r => r.athlete_id))];

      // Get profiles for coaches - using any to bypass Supabase type issues
      const coachProfilesResponse = await (supabase as any)
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", coachIds);
      
      const coachProfiles = coachProfilesResponse.data as Profile[] | null;

      // Get profiles for athletes - using any to bypass Supabase type issues
      const athleteProfilesResponse = await (supabase as any)
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", athleteIds);
      
      const athleteProfiles = athleteProfilesResponse.data as Profile[] | null;

      // Get activity data
      const { data: activitiesData } = await supabase
        .from("user_activity_tracking")
        .select("user_id, last_swing_upload, last_task_completion")
        .in("user_id", athleteIds);
      
      const activities = activitiesData as unknown as Activity[] | null;

      // Group by team and coach
      const teamGroups = new Map<string, TeamGroup>();

      rosters.forEach((roster: Roster) => {
        const coach = coachProfiles?.find(c => c.id === roster.coach_id);
        const athlete = athleteProfiles?.find(a => a.id === roster.athlete_id);
        const activity = activities?.find(a => a.user_id === roster.athlete_id);

        if (!coach || !athlete) return;

        const teamKey = `${roster.coach_id}-${roster.team_name || 'default'}`;
        const coachName = `${coach.first_name} ${coach.last_name}`;
        const athleteName = `${athlete.first_name} ${athlete.last_name}`;

        const lastActivity = activity?.last_swing_upload || activity?.last_task_completion;
        const isActive = lastActivity 
          ? Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)) <= 7
          : false;

        if (!teamGroups.has(teamKey)) {
          teamGroups.set(teamKey, {
            id: teamKey,
            teamName: roster.team_name || `${coachName}'s Team`,
            coachName,
            athleteCount: 0,
            activeAthletes: 0,
            createdAt: roster.assigned_at || new Date().toISOString(),
            athletes: []
          });
        }

        const team = teamGroups.get(teamKey)!;
        team.athleteCount++;
        if (isActive) team.activeAthletes++;
        team.athletes.push({
          id: roster.athlete_id,
          name: athleteName,
          lastActive: lastActivity 
            ? formatDistanceToNow(new Date(lastActivity), { addSuffix: true })
            : "No activity"
        });
      });

      setTeams(Array.from(teamGroups.values()));
    } catch (error) {
      console.error("Error loading teams:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading teams...
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Teams Yet</h3>
        <p className="text-muted-foreground mb-4">
          Teams will appear here as coaches add athletes to their roster
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {teams.map((team) => (
          <Card key={team.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">{team.teamName}</h3>
                <p className="text-sm text-muted-foreground">
                  Coach: {team.coachName}
                </p>
              </div>
              <Badge variant="secondary" className="flex items-center gap-2">
                <Users className="h-3 w-3" />
                {team.athleteCount} {team.athleteCount === 1 ? 'athlete' : 'athletes'}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">{team.activeAthletes} Active</p>
                  <p className="text-xs text-muted-foreground">This week</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">
                    {Math.round((team.activeAthletes / team.athleteCount) * 100)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Engagement</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {formatDistanceToNow(new Date(team.createdAt), { addSuffix: true })}
                  </p>
                  <p className="text-xs text-muted-foreground">Created</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Athletes:</p>
              <div className="space-y-2">
                {team.athletes.map((athlete) => (
                  <div
                    key={athlete.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <span className="text-sm">{athlete.name}</span>
                    <span className="text-xs text-muted-foreground">{athlete.lastActive}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
