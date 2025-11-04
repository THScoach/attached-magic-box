import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RankingEntry {
  rank: number;
  userId: string;
  name: string;
  value: number;
  level?: string;
  trend?: number;
}

export function usePeerComparison(
  metric: 'batSpeed' | 'exitVelocity' | 'hitsScore' | 'sequenceEfficiency',
  playerId?: string
) {
  const { data, isLoading } = useQuery({
    queryKey: ['peer-comparison', metric, playerId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let rankings: RankingEntry[] = [];

      // Fetch data based on metric type
      if (metric === 'batSpeed') {
        const { data: batData, error } = await supabase
          .from('bat_metrics')
          .select(`
            bat_speed,
            user_id,
            profiles!inner(first_name, last_name, current_level)
          `)
          .order('bat_speed', { ascending: false })
          .limit(100);

        if (error) throw error;

        rankings = batData?.map((entry: any, index: number) => ({
          rank: index + 1,
          userId: entry.user_id,
          name: `${entry.profiles.first_name} ${entry.profiles.last_name}`,
          value: entry.bat_speed,
          level: entry.profiles.current_level,
        })) || [];

      } else if (metric === 'exitVelocity') {
        const { data: ballData, error } = await supabase
          .from('ball_metrics')
          .select(`
            exit_velocity,
            user_id,
            profiles!inner(first_name, last_name, current_level)
          `)
          .order('exit_velocity', { ascending: false })
          .limit(100);

        if (error) throw error;

        rankings = ballData?.map((entry: any, index: number) => ({
          rank: index + 1,
          userId: entry.user_id,
          name: `${entry.profiles.first_name} ${entry.profiles.last_name}`,
          value: entry.exit_velocity,
          level: entry.profiles.current_level,
        })) || [];

      } else if (metric === 'sequenceEfficiency') {
        const { data: bodyData, error } = await supabase
          .from('body_metrics')
          .select(`
            sequence_efficiency,
            user_id,
            profiles!inner(first_name, last_name, current_level)
          `)
          .order('sequence_efficiency', { ascending: false })
          .limit(100);

        if (error) throw error;

        rankings = bodyData?.map((entry: any, index: number) => ({
          rank: index + 1,
          userId: entry.user_id,
          name: `${entry.profiles.first_name} ${entry.profiles.last_name}`,
          value: entry.sequence_efficiency,
          level: entry.profiles.current_level,
        })) || [];

      } else if (metric === 'hitsScore') {
        const { data: swingData, error } = await supabase
          .from('swing_analyses')
          .select(`
            overall_score,
            user_id,
            profiles!inner(first_name, last_name, current_level)
          `)
          .order('overall_score', { ascending: false })
          .limit(100);

        if (error) throw error;

        rankings = swingData?.map((entry: any, index: number) => ({
          rank: index + 1,
          userId: entry.user_id,
          name: `${entry.profiles.first_name} ${entry.profiles.last_name}`,
          value: entry.overall_score,
          level: entry.profiles.current_level,
        })) || [];
      }

      // Remove duplicates - keep highest score for each user
      const uniqueRankings = rankings.reduce((acc: RankingEntry[], current) => {
        const existing = acc.find(entry => entry.userId === current.userId);
        if (!existing || current.value > existing.value) {
          return [...acc.filter(entry => entry.userId !== current.userId), current];
        }
        return acc;
      }, []);

      // Re-rank after deduplication
      const sortedRankings = uniqueRankings
        .sort((a, b) => b.value - a.value)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

      // Find current user's rank
      const userRank = sortedRankings.find(entry => entry.userId === user.id);

      return {
        rankings: sortedRankings,
        userRank,
      };
    },
  });

  return {
    rankings: data?.rankings || [],
    userRank: data?.userRank,
    loading: isLoading,
  };
}
