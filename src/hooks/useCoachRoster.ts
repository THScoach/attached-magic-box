import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RosterAthlete {
  id: string;
  athlete_id: string;
  athlete_email: string;
  assigned_at: string;
  grit_score: number;
  current_streak: number;
  last_active: string | null;
  total_tasks_assigned: number;
  total_tasks_completed: number;
}

export function useCoachRoster() {
  const [athletes, setAthletes] = useState<RosterAthlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSeats: 0,
    usedSeats: 0,
    availableSeats: 0,
  });

  useEffect(() => {
    loadRoster();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('roster-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_rosters'
        },
        () => {
          loadRoster();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'grit_scores'
        },
        () => {
          loadRoster();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadRoster = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get roster entries
      const { data: rosterData, error: rosterError } = await supabase
        .from('team_rosters')
        .select('id, athlete_id, assigned_at, seats_purchased, is_active')
        .eq('coach_id', user.id)
        .eq('is_active', true);

      if (rosterError) {
        console.error('Error loading roster:', rosterError);
        toast.error('Failed to load roster');
        return;
      }

      // Calculate stats
      const totalSeats = rosterData?.reduce((sum, r) => sum + (r.seats_purchased || 0), 0) || 0;
      const usedSeats = rosterData?.length || 0;
      
      setStats({
        totalSeats,
        usedSeats,
        availableSeats: totalSeats - usedSeats,
      });

      if (!rosterData || rosterData.length === 0) {
        setAthletes([]);
        setLoading(false);
        return;
      }

      // Get athlete details and GRIT scores
      const athleteIds = rosterData.map(r => r.athlete_id);
      
      const [usersResponse, gritResponse, tasksResponse] = await Promise.all([
        supabase.auth.admin.listUsers(),
        supabase
          .from('grit_scores')
          .select('user_id, current_score, current_streak, updated_at')
          .in('user_id', athleteIds)
          .is('player_id', null),
        supabase
          .from('task_completions')
          .select('user_id, status, completed_at')
          .in('user_id', athleteIds)
      ]);

      if (!usersResponse.data || gritResponse.error || tasksResponse.error) {
        console.error('Error loading athlete data');
        setAthletes([]);
        setLoading(false);
        return;
      }

      const gritMap = new Map(
        gritResponse.data?.map(g => [
          g.user_id,
          {
            score: Math.round(Number(g.current_score)),
            streak: g.current_streak,
            lastActive: g.updated_at,
          }
        ])
      );

      const lastActiveMap = new Map<string, string>();
      tasksResponse.data?.forEach(task => {
        if (task.completed_at && task.user_id) {
          const existing = lastActiveMap.get(task.user_id);
          if (!existing || new Date(task.completed_at) > new Date(existing)) {
            lastActiveMap.set(task.user_id, task.completed_at);
          }
        }
      });

      const tasksAssignedMap = new Map<string, number>();
      const tasksCompletedMap = new Map<string, number>();
      tasksResponse.data?.forEach(task => {
        const userId = task.user_id;
        if (userId) {
          tasksAssignedMap.set(userId, (tasksAssignedMap.get(userId) || 0) + 1);
          if (task.status === 'completed' || task.status === 'late') {
            tasksCompletedMap.set(userId, (tasksCompletedMap.get(userId) || 0) + 1);
          }
        }
      });

      const athletesList: RosterAthlete[] = (rosterData || []).map((roster: any) => {
        const user = usersResponse.data.users.find((u: any) => u.id === roster.athlete_id);
        const grit = gritMap.get(roster.athlete_id);
        const lastActive = lastActiveMap.get(roster.athlete_id) || grit?.lastActive;
        
        return {
          id: roster.id,
          athlete_id: roster.athlete_id,
          athlete_email: user?.email || 'Unknown',
          assigned_at: roster.assigned_at || new Date().toISOString(),
          grit_score: grit?.score || 0,
          current_streak: grit?.streak || 0,
          last_active: lastActive || null,
          total_tasks_assigned: tasksAssignedMap.get(roster.athlete_id) || 0,
          total_tasks_completed: tasksCompletedMap.get(roster.athlete_id) || 0,
        };
      });

      // Sort by last active (most recent first)
      athletesList.sort((a, b) => {
        if (!a.last_active) return 1;
        if (!b.last_active) return -1;
        return new Date(b.last_active).getTime() - new Date(a.last_active).getTime();
      });

      setAthletes(athletesList);
    } catch (error) {
      console.error('Error in loadRoster:', error);
      toast.error('Failed to load roster');
    } finally {
      setLoading(false);
    }
  };

  return {
    athletes,
    loading,
    stats,
    reload: loadRoster,
  };
}
