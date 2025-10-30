import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Analysis {
  id: string;
  video_url: string | null;
  overall_score: number;
  anchor_score: number;
  engine_score: number;
  whip_score: number;
  metrics: any;
  created_at: string;
  video_type: string;
}

interface PlayerStats {
  totalSwings: number;
  avgScore: number;
  lastAnalysis: string | null;
}

export function usePlayerAnalyses(playerId: string | null) {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [stats, setStats] = useState<PlayerStats>({
    totalSwings: 0,
    avgScore: 0,
    lastAnalysis: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalyses = async () => {
    if (!playerId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all analyses for this player
      const { data, error: fetchError } = await supabase
        .from('swing_analyses')
        .select('*')
        .eq('player_id', playerId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const analysesData = data || [];
      setAnalyses(analysesData);

      // Calculate stats
      if (analysesData.length > 0) {
        const totalScore = analysesData.reduce((sum, a) => sum + (a.overall_score || 0), 0);
        setStats({
          totalSwings: analysesData.length,
          avgScore: totalScore / analysesData.length,
          lastAnalysis: analysesData[0].created_at
        });
      }
    } catch (err: any) {
      console.error('Error loading analyses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyses();
  }, [playerId]);

  return {
    analyses,
    stats,
    loading,
    error,
    refetch: loadAnalyses
  };
}
