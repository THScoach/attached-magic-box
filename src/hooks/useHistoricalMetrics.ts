import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TrendData {
  date: string;
  value: number;
  grade?: number;
}

interface HistoricalMetrics {
  batSpeed: TrendData[];
  attackAngle: TrendData[];
  exitVelocity: TrendData[];
  sequenceEfficiency: TrendData[];
  reactionTime: TrendData[];
  tempoRatio: TrendData[];
}

export function useHistoricalMetrics(playerId?: string) {
  const [metrics, setMetrics] = useState<HistoricalMetrics>({
    batSpeed: [],
    attackAngle: [],
    exitVelocity: [],
    sequenceEfficiency: [],
    reactionTime: [],
    tempoRatio: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistoricalMetrics();
  }, [playerId]);

  const loadHistoricalMetrics = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const userId = user.id;

      // Fetch bat metrics
      const { data: batData } = await supabase
        .from("bat_metrics")
        .select("bat_speed, attack_angle, bat_speed_grade, attack_angle_grade, created_at")
        .eq("user_id", userId)
        .eq("player_id", playerId || userId)
        .order("created_at", { ascending: true })
        .limit(30);

      // Fetch ball metrics
      const { data: ballData } = await supabase
        .from("ball_metrics")
        .select("exit_velocity, exit_velocity_grade, created_at")
        .eq("user_id", userId)
        .eq("player_id", playerId || userId)
        .order("created_at", { ascending: true })
        .limit(30);

      // Fetch body metrics
      const { data: bodyData } = await supabase
        .from("body_metrics")
        .select("sequence_efficiency, sequence_grade, tempo_ratio, tempo_grade, created_at")
        .eq("user_id", userId)
        .eq("player_id", playerId || userId)
        .order("created_at", { ascending: true })
        .limit(30);

      // Fetch brain metrics
      const { data: brainData } = await supabase
        .from("brain_metrics")
        .select("reaction_time, reaction_time_grade, created_at")
        .eq("user_id", userId)
        .eq("player_id", playerId || userId)
        .order("created_at", { ascending: true })
        .limit(30);

      setMetrics({
        batSpeed: batData?.map(d => ({
          date: d.created_at,
          value: Number(d.bat_speed),
          grade: Number(d.bat_speed_grade),
        })) || [],
        attackAngle: batData?.map(d => ({
          date: d.created_at,
          value: Number(d.attack_angle),
          grade: Number(d.attack_angle_grade),
        })) || [],
        exitVelocity: ballData?.map(d => ({
          date: d.created_at,
          value: Number(d.exit_velocity),
          grade: Number(d.exit_velocity_grade),
        })) || [],
        sequenceEfficiency: bodyData?.map(d => ({
          date: d.created_at,
          value: Number(d.sequence_efficiency),
          grade: Number(d.sequence_grade),
        })) || [],
        reactionTime: brainData?.map(d => ({
          date: d.created_at,
          value: Number(d.reaction_time),
          grade: Number(d.reaction_time_grade),
        })) || [],
        tempoRatio: bodyData?.map(d => ({
          date: d.created_at,
          value: Number(d.tempo_ratio),
          grade: Number(d.tempo_grade),
        })) || [],
      });
    } catch (error) {
      console.error("Error loading historical metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  return { metrics, loading, refetch: loadHistoricalMetrics };
}
