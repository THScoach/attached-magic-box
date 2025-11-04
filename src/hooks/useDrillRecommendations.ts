import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DrillRecommendation {
  drill: {
    id: string;
    name: string;
    description: string;
    pillar: string;
    difficulty: number;
    duration: number;
    target_area: string;
  };
  reason: string;
  priority: 'high' | 'medium' | 'low';
  targetScore: number;
}

interface WeaknessAnalysis {
  pillar: 'ANCHOR' | 'ENGINE' | 'WHIP';
  avgScore: number;
  priority: 'high' | 'medium' | 'low';
}

export function useDrillRecommendations(playerId: string | null, limit: number = 5) {
  const [recommendations, setRecommendations] = useState<DrillRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [weaknesses, setWeaknesses] = useState<WeaknessAnalysis[]>([]);

  useEffect(() => {
    if (!playerId) {
      setRecommendations([]);
      setWeaknesses([]);
      setLoading(false);
      return;
    }

    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        // Fetch recent swing analyses (last 10 swings)
        const { data: analyses, error: analysisError } = await supabase
          .from('swing_analyses')
          .select('anchor_score, engine_score, whip_score')
          .eq('player_id', playerId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (analysisError) throw analysisError;

        if (!analyses || analyses.length === 0) {
          setRecommendations([]);
          setWeaknesses([]);
          setLoading(false);
          return;
        }

        // Calculate average scores for each pillar
        const avgAnchor = analyses.reduce((sum, a) => sum + (a.anchor_score || 0), 0) / analyses.length;
        const avgEngine = analyses.reduce((sum, a) => sum + (a.engine_score || 0), 0) / analyses.length;
        const avgWhip = analyses.reduce((sum, a) => sum + (a.whip_score || 0), 0) / analyses.length;

        // Identify weaknesses (scores below 75)
        const weaknessesData: WeaknessAnalysis[] = [];
        
        if (avgAnchor < 75) {
          weaknessesData.push({
            pillar: 'ANCHOR',
            avgScore: avgAnchor,
            priority: avgAnchor < 60 ? 'high' : avgAnchor < 70 ? 'medium' : 'low'
          });
        }
        if (avgEngine < 75) {
          weaknessesData.push({
            pillar: 'ENGINE',
            avgScore: avgEngine,
            priority: avgEngine < 60 ? 'high' : avgEngine < 70 ? 'medium' : 'low'
          });
        }
        if (avgWhip < 75) {
          weaknessesData.push({
            pillar: 'WHIP',
            avgScore: avgWhip,
            priority: avgWhip < 60 ? 'high' : avgWhip < 70 ? 'medium' : 'low'
          });
        }

        // Sort by priority (high first)
        weaknessesData.sort((a, b) => {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        setWeaknesses(weaknessesData);

        // Fetch drills for identified weaknesses
        const recommendationsData: DrillRecommendation[] = [];
        
        for (const weakness of weaknessesData.slice(0, 3)) { // Focus on top 3 weaknesses
          const { data: drills, error: drillError } = await supabase
            .from('drills')
            .select('*')
            .eq('pillar', weakness.pillar)
            .order('difficulty', { ascending: true })
            .limit(2); // Get 2 drills per weakness

          if (drillError) throw drillError;

          if (drills) {
            drills.forEach(drill => {
              recommendationsData.push({
                drill,
                reason: `Improve ${weakness.pillar} score (current: ${weakness.avgScore.toFixed(1)})`,
                priority: weakness.priority,
                targetScore: weakness.avgScore
              });
            });
          }
        }

        setRecommendations(recommendationsData.slice(0, limit));
      } catch (error) {
        console.error('Error fetching drill recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [playerId, limit]);

  return { recommendations, loading, weaknesses };
}
