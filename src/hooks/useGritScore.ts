import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GritScore {
  id: string;
  user_id: string;
  player_id: string | null;
  current_score: number;
  current_streak: number;
  longest_streak: number;
  total_tasks_assigned: number;
  total_tasks_completed: number;
  total_tasks_on_time: number;
  last_completion_date: string | null;
  updated_at: string;
}

export function useGritScore(userId?: string) {
  const [gritScore, setGritScore] = useState<GritScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGritScore();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('grit-scores-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'grit_scores'
        },
        () => {
          loadGritScore();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadGritScore = async () => {
    try {
      const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      
      if (!targetUserId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('grit_scores')
        .select('*')
        .eq('user_id', targetUserId)
        .is('player_id', null)
        .maybeSingle();

      if (error) {
        console.error('Error loading GRIT score:', error);
        toast.error('Failed to load GRIT score');
        return;
      }

      setGritScore(data);
    } catch (error) {
      console.error('Error in loadGritScore:', error);
      toast.error('Failed to load GRIT score');
    } finally {
      setLoading(false);
    }
  };

  const getStreakBadge = () => {
    if (!gritScore) return null;
    
    const streak = gritScore.current_streak;
    if (streak >= 30) return { level: 'platinum', days: 30, emoji: '💎' };
    if (streak >= 14) return { level: 'gold', days: 14, emoji: '🥇' };
    if (streak >= 7) return { level: 'silver', days: 7, emoji: '🥈' };
    return null;
  };

  return {
    gritScore,
    loading,
    reload: loadGritScore,
    streakBadge: getStreakBadge(),
    completionRate: gritScore 
      ? gritScore.total_tasks_assigned > 0
        ? Math.round((gritScore.total_tasks_completed / gritScore.total_tasks_assigned) * 100)
        : 0
      : 0,
    onTimeRate: gritScore
      ? gritScore.total_tasks_assigned > 0
        ? Math.round((gritScore.total_tasks_on_time / gritScore.total_tasks_assigned) * 100)
        : 0
      : 0,
  };
}
