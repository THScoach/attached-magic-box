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

    const { swing } = await req.json();

    // Use Lovable AI to generate an engaging description
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const prompt = `You are a baseball announcer creating an exciting highlight description for a player's best swing.

Swing Details:
- Overall H.I.T.S. Score: ${swing.overall_score}/100
- ANCHOR (Balance): ${swing.anchor_score}/100
- ENGINE (Power): ${swing.engine_score}/100  
- WHIP (Bat Speed): ${swing.whip_score}/100
${swing.bat_speed ? `- Bat Speed: ${swing.bat_speed} mph` : ''}
${swing.exit_velocity ? `- Exit Velocity: ${swing.exit_velocity} mph` : ''}
${swing.sequence_efficiency ? `- Sequence Efficiency: ${swing.sequence_efficiency}%` : ''}

Create a short, exciting 1-2 sentence description for this highlight swing. Make it sound like a sports announcer calling an impressive play. Focus on the standout metrics and what makes this swing special.

Examples:
- "Absolute moonshot! 95 mph exit velocity with perfect 92% sequence efficiency - that's the kind of swing that changes games."
- "Lightning quick hands and pristine balance combine for an elite 89 H.I.T.S. score. This is textbook hitting mechanics."
- "Watch that bat speed explode through the zone at 78 mph! The ENGINE and WHIP scores are off the charts on this one."

Keep it energetic, specific to the numbers, and 1-2 sentences max.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.9,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('AI description generation failed');
    }

    const aiData = await aiResponse.json();
    const description = aiData.choices[0].message.content.trim();

    console.log('Generated highlight description:', description);

    return new Response(
      JSON.stringify({ description }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-highlight-description:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
