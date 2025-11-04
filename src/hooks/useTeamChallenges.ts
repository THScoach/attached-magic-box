import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TeamChallenge {
  id: string;
  coach_id: string;
  title: string;
  description: string | null;
  challenge_type: 'most_swings' | 'highest_score' | 'most_improved' | 'consistency' | 'specific_metric';
  metric_target: string | null;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  prizes: any[];
  rules: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  player_id: string | null;
  team_name: string | null;
  joined_at: string;
  current_score: number;
  current_rank: number | null;
  baseline_score: number | null;
  swings_completed: number;
  last_activity: string | null;
}

export interface LeaderboardEntry {
  challenge_id: string;
  user_id: string;
  player_id: string | null;
  team_name: string | null;
  current_score: number;
  swings_completed: number;
  baseline_score: number | null;
  improvement_percentage: number;
  first_name: string | null;
  last_name: string | null;
  user_first_name: string | null;
  user_last_name: string | null;
  rank: number;
}

export function useTeamChallenges() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: challenges, isLoading: isLoadingChallenges } = useQuery({
    queryKey: ['team-challenges'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('team_challenges')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data as TeamChallenge[];
    },
  });

  const { data: myParticipations, isLoading: isLoadingParticipations } = useQuery({
    queryKey: ['my-challenge-participations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          team_challenges (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
  });

  const createChallenge = useMutation({
    mutationFn: async (challenge: Omit<TeamChallenge, 'id' | 'coach_id' | 'created_at' | 'updated_at' | 'status'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('team_challenges')
        .insert([{ ...challenge, coach_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-challenges'] });
      toast({
        title: "Challenge created!",
        description: "Your team challenge has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create challenge",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateChallenge = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TeamChallenge> }) => {
      const { data, error } = await supabase
        .from('team_challenges')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-challenges'] });
      toast({
        title: "Challenge updated!",
        description: "Your challenge has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update challenge",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteChallenge = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('team_challenges')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-challenges'] });
      toast({
        title: "Challenge deleted",
        description: "The challenge has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete challenge",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addParticipant = useMutation({
    mutationFn: async (participant: Omit<ChallengeParticipant, 'id' | 'joined_at' | 'current_score' | 'current_rank' | 'swings_completed' | 'last_activity'>) => {
      const { data, error } = await supabase
        .from('challenge_participants')
        .insert([participant])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-participants'] });
      queryClient.invalidateQueries({ queryKey: ['my-challenge-participations'] });
      toast({
        title: "Participant added!",
        description: "The athlete has been added to the challenge.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add participant",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateParticipantScore = async (challengeId: string, userId: string, playerId?: string) => {
    const { error } = await supabase.rpc('update_challenge_participant_score', {
      _challenge_id: challengeId,
      _user_id: userId,
      _player_id: playerId || null,
    });

    if (error) throw error;
  };

  return {
    challenges: challenges || [],
    myParticipations: myParticipations || [],
    isLoadingChallenges,
    isLoadingParticipations,
    createChallenge: createChallenge.mutate,
    updateChallenge: updateChallenge.mutate,
    deleteChallenge: deleteChallenge.mutate,
    addParticipant: addParticipant.mutate,
    updateParticipantScore,
  };
}

export function useChallengeLeaderboard(challengeId: string) {
  return useQuery({
    queryKey: ['challenge-leaderboard', challengeId],
    enabled: !!challengeId,
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenge_leaderboard')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('rank', { ascending: true });

      if (error) throw error;
      return data as LeaderboardEntry[];
    },
  });
}
