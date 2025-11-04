import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { playerId } = await req.json();

    // Fetch user's recent metrics
    const [batMetrics, bodyMetrics, ballMetrics, brainMetrics, currentGoals] = await Promise.all([
      supabase.from('bat_metrics').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('body_metrics').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('ball_metrics').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('brain_metrics').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      supabase.from('user_goals').select('*').eq('user_id', user.id).eq('status', 'active'),
    ]);

    // Calculate trends and averages
    const batAvg = batMetrics.data?.length ? {
      batSpeed: batMetrics.data.reduce((sum, m) => sum + Number(m.bat_speed), 0) / batMetrics.data.length,
      attackAngle: batMetrics.data.reduce((sum, m) => sum + Number(m.attack_angle), 0) / batMetrics.data.length,
    } : null;

    const bodyAvg = bodyMetrics.data?.length ? {
      sequenceEfficiency: bodyMetrics.data.reduce((sum, m) => sum + Number(m.sequence_efficiency), 0) / bodyMetrics.data.length,
      tempoRatio: bodyMetrics.data.reduce((sum, m) => sum + Number(m.tempo_ratio), 0) / bodyMetrics.data.length,
    } : null;

    const ballAvg = ballMetrics.data?.length ? {
      exitVelocity: ballMetrics.data.reduce((sum, m) => sum + Number(m.exit_velocity), 0) / ballMetrics.data.length,
      hardHitPercentage: ballMetrics.data.reduce((sum, m) => sum + Number(m.hard_hit_percentage || 0), 0) / ballMetrics.data.length,
    } : null;

    const brainAvg = brainMetrics.data?.length ? {
      reactionTime: brainMetrics.data.reduce((sum, m) => sum + Number(m.reaction_time), 0) / brainMetrics.data.length,
      focusScore: brainMetrics.data.reduce((sum, m) => sum + Number(m.focus_score || 0), 0) / brainMetrics.data.length,
    } : null;

    // Use Lovable AI to generate personalized goal suggestions
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const prompt = `You are a baseball hitting coach analyzing a player's performance data to suggest personalized training goals.

Current Performance Averages:
${batAvg ? `- Bat Speed: ${batAvg.batSpeed.toFixed(1)} mph
- Attack Angle: ${batAvg.attackAngle.toFixed(1)}°` : '- No bat data yet'}

${bodyAvg ? `- Sequence Efficiency: ${bodyAvg.sequenceEfficiency.toFixed(1)}%
- Tempo Ratio: ${bodyAvg.tempoRatio.toFixed(2)}:1` : '- No body mechanics data yet'}

${ballAvg ? `- Exit Velocity: ${ballAvg.exitVelocity.toFixed(1)} mph
- Hard Hit %: ${ballAvg.hardHitPercentage.toFixed(1)}%` : '- No ball contact data yet'}

${brainAvg ? `- Reaction Time: ${brainAvg.reactionTime.toFixed(0)} ms
- Focus Score: ${brainAvg.focusScore.toFixed(1)}` : '- No cognitive data yet'}

Active Goals: ${currentGoals.data?.length || 0}

Based on this data, suggest 3-5 SMART goals that are:
1. Specific and measurable
2. Challenging but achievable (5-15% improvement)
3. Focused on their weakest areas
4. Varied across different skill categories

Respond ONLY with a JSON array of goals in this exact format:
[
  {
    "metric_name": "Bat Speed",
    "metric_category": "bat",
    "current_value": 72.5,
    "target_value": 78.0,
    "unit": "mph",
    "reasoning": "Your bat speed is below the high school average of 75 mph. Increasing to 78 mph will put you in the competitive range.",
    "priority": "high"
  }
]

Valid metric_category values: "bat", "body", "ball", "brain"
Priority values: "high", "medium", "low"`;

    const aiResponse = await fetch('https://api.lovable.app/v1/ai/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('AI suggestion failed');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    // Parse JSON from AI response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    console.log('Generated goal suggestions:', suggestions);

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in suggest-goals:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
