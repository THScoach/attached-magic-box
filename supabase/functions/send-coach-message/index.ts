import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MessagePayload {
  user_id: string;
  player_id?: string;
  message_type: 'motivation' | 'accountability' | 'micro_tip';
  trigger_reason?: string;
  message_content: string;
  cta_text?: string;
  cta_action?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: MessagePayload = await req.json();
    console.log('Creating coach message:', payload);

    // Check if user has muted messages
    const { data: preferences } = await supabaseClient
      .from('coach_message_preferences')
      .select('muted_until')
      .eq('user_id', payload.user_id)
      .single();

    if (preferences?.muted_until && new Date(preferences.muted_until) > new Date()) {
      console.log('User has muted messages until:', preferences.muted_until);
      return new Response(
        JSON.stringify({ success: true, message: 'User has muted messages' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert coach message
    const { data: message, error: messageError } = await supabaseClient
      .from('coach_messages')
      .insert({
        user_id: payload.user_id,
        player_id: payload.player_id,
        message_type: payload.message_type,
        trigger_reason: payload.trigger_reason,
        message_content: payload.message_content,
        cta_text: payload.cta_text,
        cta_action: payload.cta_action,
      })
      .select()
      .single();

    if (messageError) {
      console.error('Error creating coach message:', messageError);
      throw messageError;
    }

    // Also create a notification
    await supabaseClient.from('notifications').insert({
      user_id: payload.user_id,
      player_id: payload.player_id,
      type: 'coach_message',
      title: 'Coach Rick',
      message: payload.message_content.substring(0, 100) + '...',
    });

    console.log('Coach message created successfully:', message);

    return new Response(
      JSON.stringify({ success: true, message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-coach-message:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
