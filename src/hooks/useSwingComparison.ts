import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface SwingComparisonData {
  id: string;
  video_url: string;
  created_at: string;
  overall_score: number;
  bat_score: number;
  body_score: number;
  ball_score: number;
  brain_score: number;
  bat_metrics?: {
    bat_speed: number;
    attack_angle: number;
    time_in_zone: number;
  };
  body_metrics?: {
    tempo_ratio: number;
    sequence_efficiency: number;
  };
  ball_metrics?: {
    exit_velocity: number;
    launch_angle: number;
  };
  brain_metrics?: {
    reaction_time: number;
  };
}

export function useSwingComparison(playerId?: string) {
  const [selectedSwings, setSelectedSwings] = useState<[string | null, string | null]>([null, null]);

  const { data: availableSwings, isLoading: isLoadingSwings } = useQuery({
    queryKey: ['swings-for-comparison', playerId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('swing_analyses')
        .select(`
          id,
          video_url,
          created_at,
          overall_score,
          bat_score,
          body_score,
          ball_score,
          brain_score,
          bat_metrics (
            bat_speed,
            attack_angle,
            time_in_zone
          ),
          body_metrics (
            tempo_ratio,
            sequence_efficiency
          ),
          ball_metrics (
            exit_velocity,
            launch_angle
          ),
          brain_metrics (
            reaction_time
          )
        `)
        .eq('user_id', user.id)
        .not('video_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (playerId) {
        query = query.eq('player_id', playerId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map(swing => ({
        ...swing,
        bat_metrics: Array.isArray(swing.bat_metrics) ? swing.bat_metrics[0] : swing.bat_metrics,
        body_metrics: Array.isArray(swing.body_metrics) ? swing.body_metrics[0] : swing.body_metrics,
        ball_metrics: Array.isArray(swing.ball_metrics) ? swing.ball_metrics[0] : swing.ball_metrics,
        brain_metrics: Array.isArray(swing.brain_metrics) ? swing.brain_metrics[0] : swing.brain_metrics,
      })) as SwingComparisonData[];
    },
  });

  const { data: comparisonData, isLoading: isLoadingComparison } = useQuery({
    queryKey: ['swing-comparison-data', selectedSwings],
    enabled: selectedSwings[0] !== null && selectedSwings[1] !== null,
    queryFn: async () => {
      if (!selectedSwings[0] || !selectedSwings[1]) return null;

      const swingA = availableSwings?.find(s => s.id === selectedSwings[0]);
      const swingB = availableSwings?.find(s => s.id === selectedSwings[1]);

      if (!swingA || !swingB) return null;

      return {
        swingA,
        swingB,
        differences: {
          overall_score: swingB.overall_score - swingA.overall_score,
          bat_score: swingB.bat_score - swingA.bat_score,
          body_score: swingB.body_score - swingA.body_score,
          ball_score: swingB.ball_score - swingA.ball_score,
          brain_score: swingB.brain_score - swingA.brain_score,
          bat_speed: (swingB.bat_metrics?.bat_speed || 0) - (swingA.bat_metrics?.bat_speed || 0),
          exit_velocity: (swingB.ball_metrics?.exit_velocity || 0) - (swingA.ball_metrics?.exit_velocity || 0),
          launch_angle: (swingB.ball_metrics?.launch_angle || 0) - (swingA.ball_metrics?.launch_angle || 0),
          tempo_ratio: (swingB.body_metrics?.tempo_ratio || 0) - (swingA.body_metrics?.tempo_ratio || 0),
          reaction_time: (swingB.brain_metrics?.reaction_time || 0) - (swingA.brain_metrics?.reaction_time || 0),
        },
      };
    },
  });

  const selectSwing = (position: 0 | 1, swingId: string | null) => {
    setSelectedSwings(prev => {
      const newSelection: [string | null, string | null] = [...prev];
      newSelection[position] = swingId;
      return newSelection;
    });
  };

  const clearComparison = () => {
    setSelectedSwings([null, null]);
  };

  return {
    availableSwings: availableSwings || [],
    isLoadingSwings,
    selectedSwings,
    comparisonData,
    isLoadingComparison,
    selectSwing,
    clearComparison,
  };
}
