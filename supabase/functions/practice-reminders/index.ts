import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProfileData {
  first_name: string;
  last_name: string;
}

interface CalendarItemData {
  id: string;
  user_id: string;
  player_id: string | null;
  title: string;
  scheduled_date: string;
  scheduled_time: string;
  profiles: ProfileData | ProfileData[] | null;
  players: ProfileData | ProfileData[] | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get tomorrow's date for 24-hour reminders
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Get items scheduled for tomorrow that haven't been reminded
    const { data: upcomingItems, error: fetchError } = await supabase
      .from('calendar_items')
      .select(`
        id,
        user_id,
        player_id,
        title,
        scheduled_date,
        scheduled_time,
        profiles!calendar_items_user_id_fkey(first_name, last_name),
        players!calendar_items_player_id_fkey(first_name, last_name)
      `)
      .eq('scheduled_date', tomorrowStr)
      .is('completed_at', null)
      .eq('reminder_sent', false);

    if (fetchError) throw fetchError;

    console.log(`Found ${upcomingItems?.length || 0} items to remind about`);

    if (!upcomingItems || upcomingItems.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No reminders to send', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create notifications for each upcoming item
    const notifications = upcomingItems.map((item: CalendarItemData) => {
      const players = Array.isArray(item.players) ? item.players[0] : item.players;
      const playerName = players
        ? `${players.first_name} ${players.last_name}`
        : 'Your athlete';
      
      return {
        user_id: item.user_id,
        player_id: item.player_id,
        type: 'practice_reminder',
        title: 'Practice Reminder',
        message: `${playerName} has "${item.title}" scheduled for tomorrow at ${item.scheduled_time}`,
        action_url: `/training`,
        read: false,
      };
    });

    // Insert notifications
    const { error: notifError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (notifError) throw notifError;

    // Mark items as reminded
    const itemIds = upcomingItems.map((item: CalendarItemData) => item.id);
    const { error: updateError } = await supabase
      .from('calendar_items')
      .update({ reminder_sent: true })
      .in('id', itemIds);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${notifications.length} reminders`,
        count: notifications.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in practice-reminders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
