import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WeeklyTask {
  id: string;
  task_id: string;
  title: string;
  description: string | null;
  task_type: string;
  scheduled_date: string;
  due_time: string | null;
  status: "pending" | "completed" | "late" | "missed";
  completed_at: string | null;
  is_on_time: boolean;
}

export function useWeeklyTasks() {
  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeeklyTasks();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('task-completions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_completions'
        },
        () => {
          loadWeeklyTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadWeeklyTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get current week's tasks (Sunday to Saturday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const { data: completions, error } = await supabase
        .from('task_completions')
        .select(`
          id,
          task_id,
          scheduled_date,
          status,
          completed_at,
          scheduled_tasks (
            title,
            description,
            task_type,
            due_time
          )
        `)
        .eq('user_id', user.id)
        .gte('scheduled_date', startOfWeek.toISOString().split('T')[0])
        .lte('scheduled_date', endOfWeek.toISOString().split('T')[0])
        .order('scheduled_date')
        .order('due_time');

      if (error) {
        console.error('Error loading weekly tasks:', error);
        toast.error('Failed to load tasks');
        return;
      }

      const formattedTasks: WeeklyTask[] = (completions || []).map((c: any) => ({
        id: c.id,
        task_id: c.task_id,
        title: c.scheduled_tasks?.title || 'Untitled Task',
        description: c.scheduled_tasks?.description,
        task_type: c.scheduled_tasks?.task_type || 'general',
        scheduled_date: c.scheduled_date,
        due_time: c.scheduled_tasks?.due_time,
        status: c.status,
        completed_at: c.completed_at,
        is_on_time: c.status === 'completed',
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error in loadWeeklyTasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId: string, isOnTime: boolean = true) => {
    try {
      const status = isOnTime ? 'completed' : 'late';
      
      const { error } = await supabase
        .from('task_completions')
        .update({
          status,
          completed_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) {
        console.error('Error completing task:', error);
        toast.error('Failed to complete task');
        return false;
      }

      toast.success(isOnTime ? 'Task completed!' : 'Task marked as late');
      loadWeeklyTasks();
      return true;
    } catch (error) {
      console.error('Error in completeTask:', error);
      toast.error('Failed to complete task');
      return false;
    }
  };

  return {
    tasks,
    loading,
    completeTask,
    reload: loadWeeklyTasks,
  };
}
