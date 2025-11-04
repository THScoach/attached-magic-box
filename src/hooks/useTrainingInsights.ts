import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DrillRecommendation {
  name: string;
  pillar: 'ANCHOR' | 'ENGINE' | 'WHIP';
  description: string;
  reason: string;
}

export interface TrainingInsights {
  assessment: string;
  strengths: string[];
  improvements: string[];
  trainingFocus: string;
  drillRecommendations: DrillRecommendation[];
  weeklyPlan: {
    focus: string;
    structure: string;
  };
}

export function useTrainingInsights() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<TrainingInsights | null>(null);
  const [trends, setTrends] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const generateInsights = async (playerId?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-training-insights', {
        body: { playerId },
      });

      if (error) throw error;

      setInsights(data.insights);
      setTrends(data.trends || {});
      
      toast({
        title: "Insights Generated!",
        description: "Your personalized training analysis is ready.",
      });

      return data.insights;
    } catch (error: any) {
      console.error('Error generating insights:', error);
      toast({
        title: "Failed to Generate Insights",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    insights,
    trends,
    loading,
    generateInsights,
  };
}
