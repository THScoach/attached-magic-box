import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Checking for tasks needing reminders...');

    // Get current time in America/Chicago
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayStr = now.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Find pending tasks due today or tomorrow that haven't been reminded
    const { data: tasks, error: tasksError } = await supabaseClient
      .from('task_completions')
      .select('*, scheduled_tasks(title, description)')
      .in('status', ['pending'])
      .in('scheduled_date', [todayStr, tomorrowStr]);

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      throw tasksError;
    }

    console.log(`Found ${tasks?.length || 0} tasks to check`);

    const reminders = [];

    for (const task of tasks || []) {
      const dueDate = new Date(task.scheduled_date);
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      let shouldNotify = false;
      let title = '';
      let message = '';

      // T-24h reminder
      if (hoursUntilDue <= 24 && hoursUntilDue > 23) {
        shouldNotify = true;
        title = '📋 Task Due Tomorrow';
        message = `"${task.scheduled_tasks?.title}" is due tomorrow. Keep your streak alive!`;
      }
      // T-1h reminder
      else if (hoursUntilDue <= 1 && hoursUntilDue > 0) {
        shouldNotify = true;
        title = '⏰ Task Due in 1 Hour';
        message = `"${task.scheduled_tasks?.title}" is due in 1 hour!`;
      }
      // Streak at risk (day of, not completed)
      else if (hoursUntilDue <= 0 && hoursUntilDue > -6) {
        shouldNotify = true;
        title = '🔥 Streak at Risk!';
        message = `Complete "${task.scheduled_tasks?.title}" today to maintain your streak`;
      }

      if (shouldNotify) {
        // Send notification via edge function
        const notifyResponse = await supabaseClient.functions.invoke('send-notifications', {
          body: {
            user_id: task.user_id,
            type: hoursUntilDue <= 0 ? 'streak_risk' : 'task_reminder',
            title,
            message,
            player_id: task.player_id,
          },
        });

        if (notifyResponse.error) {
          console.error('Error sending notification:', notifyResponse.error);
        } else {
          reminders.push({ task_id: task.id, title, message });
        }
      }
    }

    console.log(`Sent ${reminders.length} reminders`);

    return new Response(
      JSON.stringify({ success: true, reminders_sent: reminders.length, reminders }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in task-reminders:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
