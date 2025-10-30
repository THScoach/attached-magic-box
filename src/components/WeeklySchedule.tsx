import { Card } from "@/components/ui/card";
import { useWeeklyTasks } from "@/hooks/useWeeklyTasks";
import { TaskListView } from "./TaskListView";
import { Loader2 } from "lucide-react";

export function WeeklySchedule() {
  const { tasks, loading, completeTask } = useWeeklyTasks();

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Weekly Schedule</h2>
        <p className="text-sm text-muted-foreground">
          Your tasks for this week • Complete on time to maintain your streak
        </p>
      </div>

      <TaskListView tasks={tasks} onComplete={completeTask} />
    </Card>
  );
}
