import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UserGoal {
  id: string;
  user_id: string;
  player_id: string | null;
  metric_name: string;
  metric_category: 'bat' | 'body' | 'ball' | 'brain';
  current_value: number;
  target_value: number;
  unit: string;
  deadline: string | null;
  status: 'active' | 'completed' | 'abandoned';
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useUserGoals(playerId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['user-goals', playerId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (playerId) {
        query = query.eq('player_id', playerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as UserGoal[];
    },
  });

  const createGoal = useMutation({
    mutationFn: async (goal: Omit<UserGoal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed_at' | 'status'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_goals')
        .insert([{ ...goal, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-goals'] });
      toast({
        title: "Goal created!",
        description: "Your new goal has been set. Let's crush it!",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create goal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateGoal = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<UserGoal> }) => {
      const { data, error } = await supabase
        .from('user_goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-goals'] });
      toast({
        title: "Goal updated!",
        description: "Your goal has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update goal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-goals'] });
      toast({
        title: "Goal deleted",
        description: "Your goal has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete goal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    goals: goals || [],
    isLoading,
    createGoal: createGoal.mutate,
    updateGoal: updateGoal.mutate,
    deleteGoal: deleteGoal.mutate,
  };
}
