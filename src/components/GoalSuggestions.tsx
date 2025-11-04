import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Loader2, Plus, Sparkles } from "lucide-react";
import { useGoalSuggestions, GoalSuggestion } from "@/hooks/useGoalSuggestions";
import { useUserGoals } from "@/hooks/useUserGoals";

interface GoalSuggestionsProps {
  playerId?: string;
}

export function GoalSuggestions({ playerId }: GoalSuggestionsProps) {
  const { suggestions, loading, generateSuggestions } = useGoalSuggestions();
  const { createGoal } = useUserGoals(playerId);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleGenerate = async () => {
    await generateSuggestions(playerId);
    setShowSuggestions(true);
  };

  const handleAcceptSuggestion = (suggestion: GoalSuggestion) => {
    createGoal({
      player_id: playerId || null,
      metric_name: suggestion.metric_name,
      metric_category: suggestion.metric_category,
      current_value: suggestion.current_value,
      target_value: suggestion.target_value,
      unit: suggestion.unit,
      deadline: null,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'bat':
        return '🏏';
      case 'body':
        return '💪';
      case 'ball':
        return '⚾';
      case 'brain':
        return '🧠';
      default:
        return '🎯';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">AI Goal Suggestions</h3>
      </div>

      {!showSuggestions ? (
        <div className="text-center py-8">
          <Lightbulb className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-6">
            Get personalized goal recommendations based on your performance data and trends.
          </p>
          <Button onClick={handleGenerate} disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Your Data...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Smart Goals
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Based on your performance data, here are personalized goals to help you improve:
              </p>
              {suggestions.map((suggestion, index) => (
                <Card key={index} className="p-4 border-2 hover:border-primary/50 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryEmoji(suggestion.metric_category)}</span>
                      <div>
                        <h4 className="font-semibold">{suggestion.metric_name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getPriorityColor(suggestion.priority)}>
                            {suggestion.priority} priority
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {suggestion.metric_category.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAcceptSuggestion(suggestion)}
                      className="ml-2"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Current:</span>
                      <span className="font-semibold">
                        {suggestion.current_value.toFixed(1)} {suggestion.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Target:</span>
                      <span className="font-semibold text-primary">
                        {suggestion.target_value.toFixed(1)} {suggestion.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Improvement:</span>
                      <span className="font-semibold text-green-500">
                        +{((suggestion.target_value - suggestion.current_value) / suggestion.current_value * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    <Lightbulb className="h-4 w-4 inline mr-1" />
                    {suggestion.reasoning}
                  </p>
                </Card>
              ))}

              <Button
                variant="outline"
                onClick={handleGenerate}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Refresh Suggestions
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No suggestions available. Record more swings to get personalized recommendations.
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
