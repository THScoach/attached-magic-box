import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HighlightSwing {
  id: string;
  video_url: string;
  overall_score: number;
  anchor_score: number;
  engine_score: number;
  whip_score: number;
  created_at: string;
  metrics: any;
  bat_speed?: number;
  exit_velocity?: number;
  sequence_efficiency?: number;
}

export function useHighlightReel(playerId?: string, limit: number = 10) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['highlight-reel', playerId, limit],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch top scoring swings with video
      const { data: swings, error } = await supabase
        .from('swing_analyses')
        .select('*')
        .eq('user_id', user.id)
        .not('video_url', 'is', null)
        .order('overall_score', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Fetch associated metrics for each swing
      const swingsWithMetrics: HighlightSwing[] = await Promise.all(
        (swings || []).map(async (swing) => {
          const [batMetric, ballMetric, bodyMetric] = await Promise.all([
            supabase.from('bat_metrics').select('bat_speed').eq('analysis_id', swing.id).maybeSingle(),
            supabase.from('ball_metrics').select('exit_velocity').eq('analysis_id', swing.id).maybeSingle(),
            supabase.from('body_metrics').select('sequence_efficiency').eq('analysis_id', swing.id).maybeSingle(),
          ]);

          return {
            ...swing,
            bat_speed: batMetric.data?.bat_speed,
            exit_velocity: ballMetric.data?.exit_velocity,
            sequence_efficiency: bodyMetric.data?.sequence_efficiency,
          };
        })
      );

      return swingsWithMetrics;
    },
  });

  const generateDescription = async (swing: HighlightSwing) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-highlight-description', {
        body: { swing },
      });

      if (error) throw error;
      return data.description;
    } catch (error) {
      console.error('Error generating description:', error);
      return null;
    }
  };

  return {
    highlights: data || [],
    isLoading,
    refetch,
    generateDescription,
  };
}
