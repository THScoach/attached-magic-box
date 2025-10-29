import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Checking for height/weight update reminders...');

    // Calculate date 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Find players that need updates (excluding model players)
    const { data: playersNeedingUpdate, error: playersError } = await supabase
      .from('players')
      .select('id, user_id, first_name, last_name, height_weight_updated_at, is_model')
      .eq('is_active', true)
      .eq('is_model', false)
      .lt('height_weight_updated_at', sixMonthsAgo.toISOString());

    if (playersError) {
      console.error('Error fetching players:', playersError);
      throw playersError;
    }

    console.log(`Found ${playersNeedingUpdate?.length || 0} players needing updates`);

    if (!playersNeedingUpdate || playersNeedingUpdate.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No players need updates', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Check for existing notifications for these players
    const playerIds = playersNeedingUpdate.map(p => p.id);
    const { data: existingNotifications } = await supabase
      .from('notifications')
      .select('player_id')
      .in('player_id', playerIds)
      .eq('type', 'height_weight_reminder')
      .eq('is_read', false);

    const existingPlayerIds = new Set(existingNotifications?.map(n => n.player_id) || []);

    // Create notifications for players who don't already have one
    const notificationsToCreate = playersNeedingUpdate
      .filter(player => !existingPlayerIds.has(player.id))
      .map(player => ({
        user_id: player.user_id,
        player_id: player.id,
        type: 'height_weight_reminder',
        title: 'Update Player Measurements',
        message: `It's been 6 months! Please update height and weight for ${player.first_name} ${player.last_name}.`,
      }));

    if (notificationsToCreate.length > 0) {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notificationsToCreate);

      if (notificationError) {
        console.error('Error creating notifications:', notificationError);
        throw notificationError;
      }

      console.log(`Created ${notificationsToCreate.length} new notifications`);
    }

    return new Response(
      JSON.stringify({
        message: 'Height/weight reminders processed',
        playersChecked: playersNeedingUpdate.length,
        notificationsCreated: notificationsToCreate.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in check-height-weight-reminders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
