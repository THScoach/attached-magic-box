import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DrillRecommendation {
  drill_id: string;
  drill_name: string;
  pillar: string;
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
  expected_improvement?: string;
}

interface RecommendationResponse {
  primary_weakness: 'bat' | 'body' | 'ball' | 'brain';
  recommendations: DrillRecommendation[];
  scores: {
    bat_score: number;
    body_score: number;
    ball_score: number;
    brain_score: number;
    overall_score: number;
  };
  analyses_count: number;
  error?: string;
}

export function useDrillRecommendations(userId?: string, playerId?: string, analysisId?: string) {
  return useQuery({
    queryKey: ['drill-recommendations', userId, playerId, analysisId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase.functions.invoke<RecommendationResponse>(
        'recommend-drills',
        {
          body: { user_id: userId, player_id: playerId, analysis_id: analysisId },
        }
      );

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
