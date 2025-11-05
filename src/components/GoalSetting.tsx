import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Target, TrendingUp, Calendar, Trophy, Sparkles, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays } from "date-fns";

interface Goal {
  title: string;
  goal_type: string;
  target_metric: string;
  current_value: number;
  target_value: number;
  unit: string;
  description: string;
  specific_details?: string;
  measurable_criteria?: string;
  achievable_reasoning?: string;
  relevant_context?: string;
  days_to_complete: number;
  priority: 'high' | 'medium' | 'low';
  milestones?: Array<{ value: number; description: string }>;
}

interface GoalSettingProps {
  userId: string;
  playerId?: string;
  currentMetrics: any;
}

const PRIORITY_COLORS = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500'
};

export function GoalSetting({ userId, playerId, currentMetrics }: GoalSettingProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Goal[]>([]);
  const [strategy, setStrategy] = useState<string>('');
  const [selectedGoals, setSelectedGoals] = useState<Set<number>>(new Set());

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-goal-suggestions', {
        body: { userId, playerId, currentMetrics }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes('Rate limit') || data.error.includes('429')) {
          toast.error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (data.error.includes('credits') || data.error.includes('402')) {
          toast.error('AI credits depleted. Please add credits to continue.');
        } else {
          toast.error(data.error);
        }
        return;
      }

      setSuggestions(data.goals);
      setStrategy(data.overall_strategy);
      toast.success('AI goal suggestions generated!');
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate goal suggestions');
    } finally {
      setLoading(false);
    }
  };

  const toggleGoalSelection = (index: number) => {
    const newSelected = new Set(selectedGoals);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedGoals(newSelected);
  };

  const saveSelectedGoals = async () => {
    if (selectedGoals.size === 0) {
      toast.error('Please select at least one goal');
      return;
    }

    setLoading(true);
    try {
      const goalsToSave = Array.from(selectedGoals).map(index => {
        const goal = suggestions[index];
        const deadline = addDays(new Date(), goal.days_to_complete);
        
        return {
          user_id: userId,
          player_id: playerId,
          goal_type: goal.goal_type,
          target_metric: goal.target_metric,
          current_value: goal.current_value,
          target_value: goal.target_value,
          unit: goal.unit,
          title: goal.title,
          description: goal.description,
          specific_details: goal.specific_details,
          measurable_criteria: goal.measurable_criteria,
          achievable_reasoning: goal.achievable_reasoning,
          relevant_context: goal.relevant_context,
          time_bound_deadline: deadline.toISOString(),
          status: 'active',
          priority: goal.priority,
          milestone_checkpoints: goal.milestones ? 
            goal.milestones.map(m => ({ ...m, achieved: false, achieved_at: null })) : 
            null,
          progress_history: [],
          ai_generated: true
        };
      });

      const { error } = await supabase
        .from('athlete_goals')
        .insert(goalsToSave);

      if (error) throw error;

      toast.success(`${goalsToSave.length} goal(s) saved successfully!`);
      setSuggestions([]);
      setSelectedGoals(new Set());
      setStrategy('');
    } catch (error) {
      console.error('Error saving goals:', error);
      toast.error('Failed to save goals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI-Powered Goal Setting
            </CardTitle>
            <CardDescription>
              Get personalized SMART goals based on your performance data
            </CardDescription>
          </div>
          {suggestions.length === 0 && (
            <Button onClick={generateSuggestions} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Generate Goals
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      {suggestions.length > 0 && (
        <CardContent className="space-y-6">
          {/* Strategy Overview */}
          {strategy && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Development Strategy
              </h3>
              <p className="text-sm text-muted-foreground">{strategy}</p>
            </div>
          )}

          {/* Goal Suggestions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Suggested Goals</h3>
              <p className="text-sm text-muted-foreground">
                {selectedGoals.size} selected
              </p>
            </div>

            {suggestions.map((goal, index) => {
              const isSelected = selectedGoals.has(index);
              const progressToTarget = ((goal.target_value - goal.current_value) / goal.current_value) * 100;
              
              return (
                <Card 
                  key={index} 
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-primary' : 'hover:border-primary/50'
                  }`}
                  onClick={() => toggleGoalSelection(index)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">{goal.title}</CardTitle>
                          {isSelected && (
                            <Trophy className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={PRIORITY_COLORS[goal.priority]}>
                            {goal.priority.toUpperCase()} Priority
                          </Badge>
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            {goal.days_to_complete} days
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Current vs Target */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Current</span>
                        <span className="font-bold">{goal.current_value} {goal.unit}</span>
                      </div>
                      <Progress value={50} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Target</span>
                        <span className="font-bold text-primary">
                          {goal.target_value} {goal.unit}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        +{(goal.target_value - goal.current_value).toFixed(1)} {goal.unit} increase 
                        ({Math.abs(progressToTarget).toFixed(0)}% improvement)
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground">{goal.description}</p>

                    {/* SMART Details */}
                    {goal.achievable_reasoning && (
                      <div className="p-3 bg-muted rounded-lg space-y-2">
                        <p className="text-xs font-medium">Why This Is Achievable</p>
                        <p className="text-xs text-muted-foreground">
                          {goal.achievable_reasoning}
                        </p>
                      </div>
                    )}

                    {/* Milestones */}
                    {goal.milestones && goal.milestones.length > 0 && (
                      <div>
                        <p className="text-xs font-medium mb-2">Milestones</p>
                        <div className="space-y-1">
                          {goal.milestones.map((milestone, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 rounded-full bg-primary/30" />
                              <span className="text-muted-foreground">
                                {milestone.value} {goal.unit}: {milestone.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={saveSelectedGoals} 
              disabled={loading || selectedGoals.size === 0}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Save {selectedGoals.size > 0 ? `${selectedGoals.size} ` : ''}Selected Goal{selectedGoals.size !== 1 ? 's' : ''}
                </>
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setSuggestions([]);
                setSelectedGoals(new Set());
                setStrategy('');
              }}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
