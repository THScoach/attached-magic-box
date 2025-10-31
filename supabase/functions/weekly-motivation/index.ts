import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MOTIVATION_MESSAGES = [
  "You improving today or waiting for next week?",
  "Consistency beats talent. Choose consistency today.",
  "Small gains stack into big results. One swing at a time.",
  "If it mattered yesterday, it matters today.",
  "You don't have forever to develop your skills — make today count.",
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

    console.log('Running weekly motivation job...');

    // Get all active users with non-free memberships
    const { data: memberships, error: membershipError } = await supabaseClient
      .from('user_memberships')
      .select('user_id')
      .eq('status', 'active')
      .neq('tier', 'free');

    if (membershipError) {
      console.error('Error fetching memberships:', membershipError);
      throw membershipError;
    }

    console.log(`Found ${memberships?.length || 0} active users`);

    // Select a random motivation message
    const randomMessage = MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)];
    const fullMessage = `${randomMessage} Let's get it. — Coach Rick`;

    let sentCount = 0;
    let errorCount = 0;

    // Send message to each user
    for (const membership of memberships || []) {
      try {
        // Check if user has muted messages
        const { data: preferences } = await supabaseClient
          .from('coach_message_preferences')
          .select('muted_until')
          .eq('user_id', membership.user_id)
          .single();

        if (preferences?.muted_until && new Date(preferences.muted_until) > new Date()) {
          console.log(`User ${membership.user_id} has muted messages`);
          continue;
        }

        // Insert coach message
        await supabaseClient.from('coach_messages').insert({
          user_id: membership.user_id,
          message_type: 'motivation',
          trigger_reason: 'weekly_monday',
          message_content: fullMessage,
          cta_text: "Check Today's Task ✅",
          cta_action: '/dashboard',
        });

        // Create notification
        await supabaseClient.from('notifications').insert({
          user_id: membership.user_id,
          type: 'coach_message',
          title: 'Coach Rick',
          message: randomMessage,
        });

        sentCount++;
      } catch (error) {
        console.error(`Error sending message to user ${membership.user_id}:`, error);
        errorCount++;
      }
    }

    console.log(`Weekly motivation job complete: ${sentCount} sent, ${errorCount} errors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sentCount,
        errorCount,
        message: 'Weekly motivation messages sent'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in weekly-motivation:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
