import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Clock, XCircle, Camera, Dumbbell, Video, FileText } from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Task {
  id: string;
  task_id: string;
  title: string;
  description: string;
  task_type: string;
  scheduled_date: string;
  status: string;
  due_time: string | null;
}

const taskIcons = {
  swing_upload: Camera,
  drill_block: Dumbbell,
  live_coaching: Video,
  check_in_form: FileText,
};

export function WeeklySchedule() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadWeeklyTasks();
  }, []);

  const loadWeeklyTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's membership tier
      const { data: membership } = await supabase
        .from("user_memberships")
        .select("tier")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (!membership) {
        setTasks([]);
        setLoading(false);
        return;
      }

      // Get scheduled tasks for this tier
      const { data: scheduledTasks } = await supabase
        .from("scheduled_tasks")
        .select("*")
        .eq("program_tier", membership.tier)
        .eq("is_active", true);

      if (!scheduledTasks) {
        setTasks([]);
        setLoading(false);
        return;
      }

      // Get task completions for the current week
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());

      const { data: completions } = await supabase
        .from("task_completions")
        .select("*")
        .eq("user_id", user.id)
        .gte("scheduled_date", weekStart.toISOString().split('T')[0]);

      // Combine scheduled tasks with completion status
      const tasksWithStatus = scheduledTasks.map(task => {
        const completion = completions?.find(c => c.task_id === task.id && isSameDay(parseISO(c.scheduled_date), today));
        
        return {
          id: completion?.id || task.id,
          task_id: task.id,
          title: task.title,
          description: task.description || "",
          task_type: task.task_type,
          scheduled_date: today.toISOString(),
          status: completion?.status || "pending",
          due_time: task.due_time,
        };
      });

      setTasks(tasksWithStatus);
    } catch (error) {
      console.error("Error loading weekly tasks:", error);
      toast.error("Failed to load your schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAction = async (task: Task) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (task.status === "pending") {
      // Navigate based on task type
      switch (task.task_type) {
        case "swing_upload":
          navigate("/analyze");
          break;
        case "drill_block":
          navigate("/drills");
          break;
        case "live_coaching":
          navigate("/live-coaching");
          break;
        case "check_in_form":
          // Mark as complete
          await completeTask(task);
          break;
      }
    }
  };

  const completeTask = async (task: Task) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const dueTime = task.due_time ? parseISO(`${task.scheduled_date}T${task.due_time}`) : null;
      const isOnTime = !dueTime || now <= dueTime;

      const { error } = await supabase
        .from("task_completions")
        .upsert({
          user_id: user.id,
          task_id: task.task_id,
          scheduled_date: task.scheduled_date.split('T')[0],
          status: isOnTime ? "completed" : "late",
          completed_at: now.toISOString(),
        });

      if (error) throw error;

      toast.success("Task completed! 🎉");
      loadWeeklyTasks();
    } catch (error) {
      console.error("Error completing task:", error);
      toast.error("Failed to complete task");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "late":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "missed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Completed</Badge>;
      case "late":
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Late</Badge>;
      case "missed":
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Missed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No tasks scheduled for today</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Today's Schedule</h2>
        <p className="text-sm text-muted-foreground">Stay consistent to boost your GRIT Score</p>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => {
          const Icon = taskIcons[task.task_type as keyof typeof taskIcons] || Clock;
          const isCompleted = task.status === "completed" || task.status === "late";

          return (
            <div
              key={task.id}
              className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="flex-shrink-0">
                {getStatusIcon(task.status)}
              </div>

              <Icon className="h-5 w-5 text-primary flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-medium text-foreground">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}
                    {task.due_time && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {format(parseISO(`2000-01-01T${task.due_time}`), 'h:mm a')}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(task.status)}
                </div>
              </div>

              {!isCompleted && (
                <Button
                  onClick={() => handleTaskAction(task)}
                  size="sm"
                  className="flex-shrink-0"
                >
                  Start
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
