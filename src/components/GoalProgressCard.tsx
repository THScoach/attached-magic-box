import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Trash2, CheckCircle2 } from "lucide-react";
import { UserGoal, useUserGoals } from "@/hooks/useUserGoals";
import { useCelebration } from "@/hooks/useCelebration";
import { format } from "date-fns";

interface GoalProgressCardProps {
  goal: UserGoal;
}

export function GoalProgressCard({ goal }: GoalProgressCardProps) {
  const { updateGoal, deleteGoal } = useUserGoals();
  const { celebrate } = useCelebration();

  const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
  const isCompleted = progress >= 100;
  const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && !isCompleted;

  const categoryEmojis = {
    bat: '🏏',
    body: '💪',
    ball: '⚾',
    brain: '🧠',
  };

  const handleComplete = () => {
    updateGoal({
      id: goal.id,
      updates: {
        status: 'completed',
        completed_at: new Date().toISOString(),
      },
    });
    
    // Trigger celebration
    celebrate({
      type: "goal",
      title: "Goal Achieved! 🎉",
      message: `You crushed your ${goal.metric_name} goal!`,
      metric: goal.metric_name,
      value: goal.target_value,
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(goal.id);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{categoryEmojis[goal.metric_category]}</span>
          <div>
            <h3 className="font-semibold">{goal.metric_name}</h3>
            <p className="text-sm text-muted-foreground">
              {goal.current_value} → {goal.target_value} {goal.unit}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isCompleted && goal.status === 'active' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleComplete}
              className="h-8 w-8 p-0"
            >
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold">{progress.toFixed(0)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-2">
          {goal.status === 'completed' && (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
          {isOverdue && (
            <Badge variant="destructive">Overdue</Badge>
          )}
          {goal.deadline && !isCompleted && !isOverdue && (
            <Badge variant="secondary">
              Due {format(new Date(goal.deadline), 'MMM d')}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
