import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NO_SWING_MESSAGES = [
  "You said you want to get better — prove it today.",
  "Even 1 rep moves the needle. Upload one swing.",
  "You don't need perfect conditions — you need consistency.",
  "Talent isn't enough if you don't train.",
  "Show me the work — upload a swing.",
];

const NO_TASK_MESSAGES = [
  "Tasks aren't optional if you want results.",
  "Every day you skip, you're choosing to stay the same.",
  "Champions complete their work — even on hard days.",
  "You can't coast your way to greatness. Check your tasks.",
  "Small efforts every day = big results over time.",
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Running accountability check...');

    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Get all active users
    const { data: memberships, error: membershipError } = await supabaseClient
      .from('user_memberships')
      .select('user_id')
      .eq('status', 'active')
      .neq('tier', 'free');

    if (membershipError) {
      console.error('Error fetching memberships:', membershipError);
      throw membershipError;
    }

    console.log(`Checking accountability for ${memberships?.length || 0} users`);

    let sentCount = 0;

    for (const membership of memberships || []) {
      try {
        // Check if user has muted messages
        const { data: preferences } = await supabaseClient
          .from('coach_message_preferences')
          .select('muted_until')
          .eq('user_id', membership.user_id)
          .single();

        if (preferences?.muted_until && new Date(preferences.muted_until) > new Date()) {
          continue;
        }

        // Check last swing upload
        const { data: analyses } = await supabaseClient
          .from('swing_analyses')
          .select('created_at')
          .eq('user_id', membership.user_id)
          .order('created_at', { ascending: false })
          .limit(1);

        const lastSwing = analyses?.[0]?.created_at;
        const needsSwingReminder = !lastSwing || new Date(lastSwing) < fiveDaysAgo;

        // Check last task completion
        const { data: tasks } = await supabaseClient
          .from('task_completions')
          .select('completed_at')
          .eq('user_id', membership.user_id)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(1);

        const lastTask = tasks?.[0]?.completed_at;
        const needsTaskReminder = !lastTask || new Date(lastTask) < threeDaysAgo;

        // Send appropriate accountability message
        if (needsSwingReminder) {
          const message = NO_SWING_MESSAGES[Math.floor(Math.random() * NO_SWING_MESSAGES.length)];
          const fullMessage = `${message} Let's get it. — Coach Rick`;

          await supabaseClient.from('coach_messages').insert({
            user_id: membership.user_id,
            message_type: 'accountability',
            trigger_reason: 'no_swings_5_days',
            message_content: fullMessage,
            cta_text: 'Upload Swing 📹',
            cta_action: '/analyze',
          });

          await supabaseClient.from('notifications').insert({
            user_id: membership.user_id,
            type: 'coach_message',
            title: 'Coach Rick',
            message: message,
          });

          sentCount++;
        } else if (needsTaskReminder) {
          const message = NO_TASK_MESSAGES[Math.floor(Math.random() * NO_TASK_MESSAGES.length)];
          const fullMessage = `${message} Let's get it. — Coach Rick`;

          await supabaseClient.from('coach_messages').insert({
            user_id: membership.user_id,
            message_type: 'accountability',
            trigger_reason: 'no_tasks_3_days',
            message_content: fullMessage,
            cta_text: 'Check Tasks ✅',
            cta_action: '/dashboard',
          });

          await supabaseClient.from('notifications').insert({
            user_id: membership.user_id,
            type: 'coach_message',
            title: 'Coach Rick',
            message: message,
          });

          sentCount++;
        }
      } catch (error) {
        console.error(`Error checking user ${membership.user_id}:`, error);
      }
    }

    console.log(`Accountability check complete: ${sentCount} messages sent`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sentCount,
        message: 'Accountability check complete'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in accountability-check:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
