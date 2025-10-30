import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WeeklyTask } from "@/hooks/useWeeklyTasks";
import { Check, Clock, X, Video, Dumbbell, Calendar, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";

interface TaskListViewProps {
  tasks: WeeklyTask[];
  onComplete: (taskId: string, isOnTime: boolean) => Promise<boolean>;
}

export function TaskListView({ tasks, onComplete }: TaskListViewProps) {
  const navigate = useNavigate();

  const getTaskIcon = (taskType: string) => {
    switch (taskType) {
      case 'swing_upload':
        return <Video className="h-4 w-4" />;
      case 'drills':
        return <Dumbbell className="h-4 w-4" />;
      case 'live_coaching':
        return <Calendar className="h-4 w-4" />;
      default:
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (task: WeeklyTask) => {
    switch (task.status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500/20 text-green-700 dark:text-green-300">Completed</Badge>;
      case 'late':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300">Late</Badge>;
      case 'missed':
        return <Badge variant="destructive">Missed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const handleQuickAction = (task: WeeklyTask) => {
    if (task.task_type === 'swing_upload') {
      navigate('/analyze');
    } else if (task.task_type === 'drills') {
      navigate('/drills');
    } else if (task.task_type === 'live_coaching') {
      navigate('/live-coaching');
    }
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    const date = task.scheduled_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {} as Record<string, WeeklyTask[]>);

  const sortedDates = Object.keys(groupedTasks).sort();

  return (
    <div className="space-y-4">
      {sortedDates.length === 0 ? (
        <Card className="p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No tasks scheduled for this week</p>
        </Card>
      ) : (
        sortedDates.map((date) => (
          <div key={date}>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
              {format(parseISO(date), 'EEEE, MMM d')}
            </h3>
            <div className="space-y-2">
              {groupedTasks[date].map((task) => (
                <Card key={task.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1 text-primary">
                        {getTaskIcon(task.task_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{task.title}</h4>
                          {getStatusBadge(task)}
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {task.description}
                          </p>
                        )}
                        {task.due_time && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Due by {task.due_time}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {task.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleQuickAction(task)}
                            className="whitespace-nowrap"
                          >
                            {task.task_type === 'swing_upload' && 'Submit Swing'}
                            {task.task_type === 'drills' && 'Start Drills'}
                            {task.task_type === 'live_coaching' && 'Join Live'}
                            {!['swing_upload', 'drills', 'live_coaching'].includes(task.task_type) && 'Start'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onComplete(task.id, true)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onComplete(task.id, false)}
                            className="text-yellow-600 dark:text-yellow-400"
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Mark Late
                          </Button>
                        </>
                      )}
                      {task.completed_at && (
                        <p className="text-xs text-muted-foreground text-right">
                          {format(parseISO(task.completed_at), 'h:mm a')}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
