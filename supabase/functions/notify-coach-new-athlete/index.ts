import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // This function is called via database trigger when a new Whop profile is created
    const { profile_id, whop_user_id, whop_username, email } = await req.json();

    console.log('[Notify Coach] New Whop athlete:', { profile_id, whop_user_id });

    // Get all coaches (users with coach role)
    const { data: coaches, error: coachError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'coach');

    if (coachError) {
      console.error('[Notify Coach] Error fetching coaches:', coachError);
      throw coachError;
    }

    if (!coaches || coaches.length === 0) {
      console.log('[Notify Coach] No coaches found to notify');
      return new Response(JSON.stringify({ success: true, notified: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create notifications for all coaches
    const notifications = coaches.map(coach => ({
      user_id: coach.user_id,
      type: 'athlete_synced',
      title: 'New Athlete from Whop',
      message: `${whop_username || email} subscribed via Whop. Add them to your roster using Whop ID: ${whop_user_id}`,
    }));

    const { error: notifyError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (notifyError) {
      console.error('[Notify Coach] Error creating notifications:', notifyError);
      throw notifyError;
    }

    console.log('[Notify Coach] Notified', coaches.length, 'coaches');

    return new Response(
      JSON.stringify({ success: true, notified: coaches.length }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Notify Coach] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
