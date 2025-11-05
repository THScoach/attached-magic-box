import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, TrendingUp, Calendar, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface GoalTrackerProps {
  userId: string;
  playerId?: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  goal_type: string;
  target_metric: string;
  current_value: number;
  target_value: number;
  unit: string;
  status: string;
  priority: string;
  time_bound_deadline: string;
  progress_history: any;
  milestone_checkpoints: any;
  created_at: string;
  completed_at: string | null;
}

export function GoalTracker({ userId, playerId }: GoalTrackerProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  useEffect(() => {
    loadGoals();
  }, [userId, playerId]);

  const loadGoals = async () => {
    try {
      const query = supabase
        .from('athlete_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (playerId) {
        query.eq('player_id', playerId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setGoals(data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (goal: Goal) => {
    const range = goal.target_value - goal.current_value;
    const progressHistory = Array.isArray(goal.progress_history) ? goal.progress_history : [];
    const latestProgress = progressHistory[progressHistory.length - 1];
    const currentProgress = latestProgress ? latestProgress.value : goal.current_value;
    const achieved = currentProgress - goal.current_value;
    const percentage = (achieved / range) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  const getStatusIcon = (goal: Goal) => {
    if (goal.status === 'completed') return <Trophy className="h-4 w-4 text-green-500" />;
    if (isPast(new Date(goal.time_bound_deadline)) && goal.status === 'active') {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusText = (goal: Goal) => {
    if (goal.status === 'completed') return 'Completed';
    if (isPast(new Date(goal.time_bound_deadline))) return 'Overdue';
    return `${formatDistanceToNow(new Date(goal.time_bound_deadline))} left`;
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading goals...</p>
        </CardContent>
      </Card>
    );
  }

  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Goals Set</h3>
          <p className="text-muted-foreground mb-4">
            Start by setting some SMART goals to track your progress
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-primary" />
              <p className="text-sm text-muted-foreground">Active Goals</p>
            </div>
            <p className="text-2xl font-bold">{activeGoals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-green-500" />
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <p className="text-2xl font-bold">{completedGoals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-muted-foreground">Avg Progress</p>
            </div>
            <p className="text-2xl font-bold">
              {activeGoals.length > 0 
                ? Math.round(activeGoals.reduce((sum, g) => sum + calculateProgress(g), 0) / activeGoals.length)
                : 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-purple-500" />
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
            <p className="text-2xl font-bold">
              {goals.length > 0 
                ? Math.round((completedGoals.length / goals.length) * 100)
                : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Goals</h3>
          {activeGoals.map(goal => {
            const progress = calculateProgress(goal);
            
            return (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <CardDescription>{goal.description}</CardDescription>
                    </div>
                    {getStatusIcon(goal)}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    <Badge variant={goal.priority === 'high' ? 'default' : 'secondary'}>
                      {goal.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      {getStatusText(goal)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-bold">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{goal.current_value} {goal.unit}</span>
                      <span className="font-semibold text-primary">
                        Target: {goal.target_value} {goal.unit}
                      </span>
                    </div>
                  </div>

                  {/* Milestones */}
                  {goal.milestone_checkpoints && Array.isArray(goal.milestone_checkpoints) && goal.milestone_checkpoints.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Milestones</p>
                      <div className="space-y-2">
                        {goal.milestone_checkpoints.map((milestone: any, idx: number) => (
                          <div 
                            key={idx} 
                            className={`flex items-center gap-2 text-sm p-2 rounded ${
                              milestone.achieved ? 'bg-green-500/10' : 'bg-muted'
                            }`}
                          >
                            {milestone.achieved ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                            )}
                            <span className={milestone.achieved ? 'line-through text-muted-foreground' : ''}>
                              {milestone.value} {goal.unit}: {milestone.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Progress Chart */}
                  {goal.progress_history && Array.isArray(goal.progress_history) && goal.progress_history.length > 0 && (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={goal.progress_history}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(date) => format(new Date(date), 'MMM d')}
                          />
                          <YAxis />
                          <Tooltip />
                          <ReferenceLine y={goal.target_value} stroke="hsl(var(--primary))" strokeDasharray="3 3" />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-green-500" />
            Completed Goals
          </h3>
          <div className="grid gap-4">
            {completedGoals.slice(0, 3).map(goal => (
              <Card key={goal.id} className="border-green-500/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{goal.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Completed {format(new Date(goal.completed_at!), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Trophy className="h-5 w-5 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Achieved {goal.target_value} {goal.unit} 
                    ({((goal.target_value - goal.current_value) / goal.current_value * 100).toFixed(0)}% improvement)
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
