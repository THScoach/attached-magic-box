import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface GoalSuggestion {
  metric_name: string;
  metric_category: 'bat' | 'body' | 'ball' | 'brain';
  current_value: number;
  target_value: number;
  unit: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
}

export function useGoalSuggestions() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<GoalSuggestion[]>([]);
  const { toast } = useToast();

  const generateSuggestions = async (playerId?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-goals', {
        body: { playerId },
      });

      if (error) throw error;

      setSuggestions(data.suggestions || []);
      
      if (data.suggestions?.length > 0) {
        toast({
          title: "Goals Suggested!",
          description: `We've generated ${data.suggestions.length} personalized goals for you.`,
        });
      } else {
        toast({
          title: "No Suggestions Yet",
          description: "Record more swings to get personalized goal recommendations.",
        });
      }

      return data.suggestions;
    } catch (error: any) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Failed to Generate Suggestions",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    suggestions,
    loading,
    generateSuggestions,
  };
}
