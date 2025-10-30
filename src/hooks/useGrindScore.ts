import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GrindScore {
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

export function useGrindScore(userId?: string) {
  const [grindScore, setGrindScore] = useState<GrindScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGrindScore();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('grind-scores-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'grit_scores'
        },
        () => {
          loadGrindScore();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadGrindScore = async () => {
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
        console.error('Error loading GRIND score:', error);
        toast.error('Failed to load GRIND score');
        return;
      }

      setGrindScore(data);
    } catch (error) {
      console.error('Error in loadGrindScore:', error);
      toast.error('Failed to load GRIND score');
    } finally {
      setLoading(false);
    }
  };

  const getStreakBadge = () => {
    if (!grindScore) return null;
    
    const streak = grindScore.current_streak;
    if (streak >= 30) return { level: 'platinum', days: 30, emoji: '💎' };
    if (streak >= 14) return { level: 'gold', days: 14, emoji: '🥇' };
    if (streak >= 7) return { level: 'silver', days: 7, emoji: '🥈' };
    return null;
  };

  return {
    grindScore,
    loading,
    reload: loadGrindScore,
    streakBadge: getStreakBadge(),
    completionRate: grindScore 
      ? grindScore.total_tasks_assigned > 0
        ? Math.round((grindScore.total_tasks_completed / grindScore.total_tasks_assigned) * 100)
        : 0
      : 0,
    onTimeRate: grindScore
      ? grindScore.total_tasks_assigned > 0
        ? Math.round((grindScore.total_tasks_on_time / grindScore.total_tasks_assigned) * 100)
        : 0
      : 0,
  };
}
