import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, playerId, sessionId, rebootApiKey } = await req.json();

    if (!userId || !sessionId) {
      throw new Error('Missing required parameters');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user has Elite tier access
    const { data: membership } = await supabase
      .from('user_memberships')
      .select('tier')
      .eq('user_id', userId)
      .single();

    if (membership?.tier !== 'elite') {
      throw new Error('Reboot Motion integration requires Elite tier membership');
    }

    console.log('Fetching Reboot Motion data for session:', sessionId);

    // Call Reboot Motion API
    const rebootResponse = await fetch(
      `https://api.rebootmotion.com/v1/sessions/${sessionId}`,
      {
        headers: {
          'Authorization': `Bearer ${rebootApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!rebootResponse.ok) {
      throw new Error(`Reboot API error: ${rebootResponse.statusText}`);
    }

    const rebootData = await rebootResponse.json();

    // Map Reboot data to 4 B's framework
    const bodyMetrics = {
      legs_peak_velocity: rebootData.pelvis_peak_rotational_velocity || 0,
      core_peak_velocity: rebootData.torso_peak_rotational_velocity || 0,
      arms_peak_velocity: rebootData.lead_arm_peak_velocity || 0,
      bat_peak_velocity: rebootData.bat_peak_velocity || 0,
      legs_power: rebootData.hip_power || 0,
      core_power: rebootData.torso_power || 0,
      arms_power: rebootData.arm_power || 0,
      sequence_efficiency: rebootData.kinematic_sequence_efficiency || 0,
      load_time: rebootData.load_phase_time || 0,
      launch_time: rebootData.swing_phase_time || 0,
      tempo_ratio: rebootData.load_phase_time / (rebootData.swing_phase_time || 1),
      is_correct_sequence: rebootData.sequence_correct || false,
    };

    const batMetrics = {
      bat_speed: rebootData.bat_speed_mph || 0,
      attack_angle: rebootData.attack_angle || 0,
      time_in_zone: rebootData.time_to_contact || 0,
    };

    // Create or update swing analysis with verified Reboot data
    const { data: analysis, error: analysisError } = await supabase
      .from('swing_analyses')
      .insert({
        user_id: userId,
        player_id: playerId,
        video_url: rebootData.video_url,
        overall_score: 85, // Will be calculated based on metrics
        metrics: {
          ...bodyMetrics,
          ...batMetrics,
          dataSource: 'reboot_motion',
          verified: true,
          sessionId: sessionId,
        },
      })
      .select()
      .single();

    if (analysisError) throw analysisError;

    // Store detailed body metrics
    await supabase.from('body_metrics').insert({
      user_id: userId,
      player_id: playerId,
      analysis_id: analysis.id,
      ...bodyMetrics,
    });

    // Store bat metrics
    await supabase.from('bat_metrics').insert({
      user_id: userId,
      player_id: playerId,
      analysis_id: analysis.id,
      ...batMetrics,
    });

    console.log('Successfully synced Reboot Motion data');

    return new Response(
      JSON.stringify({
        success: true,
        analysisId: analysis.id,
        message: 'Reboot Motion data synced successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error syncing Reboot data:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
