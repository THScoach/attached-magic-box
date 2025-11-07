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

    console.log('Starting meeting reminder check...');

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    console.log('Checking for meetings on:', todayStr);

    // Find all scheduled Zoom meetings for today
    const { data: meetings, error: meetingsError } = await supabaseClient
      .from('calendar_items')
      .select('*, profiles!calendar_items_user_id_fkey(id, email, first_name)')
      .eq('item_type', 'live_meeting')
      .eq('scheduled_date', todayStr)
      .eq('status', 'scheduled')
      .eq('reminder_sent', false);

    if (meetingsError) {
      console.error('Error fetching meetings:', meetingsError);
      throw meetingsError;
    }

    console.log(`Found ${meetings?.length || 0} meetings to remind about`);

    if (!meetings || meetings.length === 0) {
      return new Response(
        JSON.stringify({ success: true, reminders_sent: 0, message: 'No meetings today needing reminders' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Send reminder notifications
    const notifications = meetings.map(meeting => ({
      user_id: meeting.user_id,
      type: 'meeting_reminder',
      title: '🎯 Meeting Today!',
      message: `Reminder: ${meeting.title} today at ${meeting.scheduled_time || '7:00 PM'} CST.\n\n${meeting.description}`,
    }));

    const { error: notifError } = await supabaseClient
      .from('notifications')
      .insert(notifications);

    if (notifError) {
      console.error('Error creating notifications:', notifError);
      throw notifError;
    }

    // Mark reminders as sent
    const { error: updateError } = await supabaseClient
      .from('calendar_items')
      .update({ reminder_sent: true })
      .eq('item_type', 'live_meeting')
      .eq('scheduled_date', todayStr)
      .eq('status', 'scheduled')
      .eq('reminder_sent', false);

    if (updateError) {
      console.error('Error updating reminder_sent status:', updateError);
    }

    console.log(`Successfully sent ${notifications.length} reminders`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        reminders_sent: notifications.length,
        meeting_date: todayStr
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in send-meeting-reminders:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
