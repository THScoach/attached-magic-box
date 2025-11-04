import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SwingMetrics {
  bat_speed?: number;
  attack_angle?: number;
  time_in_zone?: number;
  tempo_ratio?: number;
  sequence_efficiency?: number;
  exit_velocity?: number;
  launch_angle?: number;
  reaction_time?: number;
}

interface AnalysisScores {
  bat_score: number;
  body_score: number;
  ball_score: number;
  brain_score: number;
  overall_score: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_id, player_id, analysis_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch recent swing analyses
    let query = supabase
      .from('swing_analyses')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (player_id) {
      query = query.eq('player_id', player_id);
    }

    if (analysis_id) {
      query = query.eq('id', analysis_id).limit(1);
    }

    const { data: analyses, error: analysisError } = await query;

    if (analysisError) throw analysisError;

    if (!analyses || analyses.length === 0) {
      return new Response(
        JSON.stringify({ recommendations: [], message: 'No swing data found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate average scores
    const avgScores: AnalysisScores = {
      bat_score: analyses.reduce((sum, a) => sum + (a.bat_score || 0), 0) / analyses.length,
      body_score: analyses.reduce((sum, a) => sum + (a.body_score || 0), 0) / analyses.length,
      ball_score: analyses.reduce((sum, a) => sum + (a.ball_score || 0), 0) / analyses.length,
      brain_score: analyses.reduce((sum, a) => sum + (a.brain_score || 0), 0) / analyses.length,
      overall_score: analyses.reduce((sum, a) => sum + (a.overall_score || 0), 0) / analyses.length,
    };

    // Extract key metrics
    const latestMetrics = analyses[0].metrics as SwingMetrics;

    // Fetch available drills
    const { data: drills, error: drillsError } = await supabase
      .from('drills')
      .select('*')
      .order('name');

    if (drillsError) throw drillsError;

    // Use Lovable AI to analyze and recommend drills
    const systemPrompt = `You are an expert baseball hitting coach. Analyze the player's swing metrics and scores to recommend the most effective drills.

Available drills:
${JSON.stringify(drills, null, 2)}

Focus on:
1. Identifying the weakest pillar (lowest score)
2. Recommending 3-5 specific drills that address the weakness
3. Ordering drills from most to least important
4. Providing clear reasoning for each recommendation`;

    const userPrompt = `Player Performance Summary:
- BAT Score: ${avgScores.bat_score.toFixed(1)}/100 (Speed: ${latestMetrics.bat_speed || 'N/A'} mph, Attack Angle: ${latestMetrics.attack_angle || 'N/A'}°, Time in Zone: ${latestMetrics.time_in_zone || 'N/A'} ms)
- BODY Score: ${avgScores.body_score.toFixed(1)}/100 (Tempo Ratio: ${latestMetrics.tempo_ratio || 'N/A'}, Sequence: ${latestMetrics.sequence_efficiency || 'N/A'}%)
- BALL Score: ${avgScores.ball_score.toFixed(1)}/100 (Exit Velo: ${latestMetrics.exit_velocity || 'N/A'} mph, Launch Angle: ${latestMetrics.launch_angle || 'N/A'}°)
- BRAIN Score: ${avgScores.brain_score.toFixed(1)}/100 (Reaction Time: ${latestMetrics.reaction_time || 'N/A'} ms)
- Overall: ${avgScores.overall_score.toFixed(1)}/100

Based on ${analyses.length} recent swing(s), recommend drills to improve their weakest areas.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'recommend_drills',
              description: 'Return personalized drill recommendations',
              parameters: {
                type: 'object',
                properties: {
                  primary_weakness: {
                    type: 'string',
                    enum: ['bat', 'body', 'ball', 'brain'],
                  },
                  recommendations: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        drill_id: { type: 'string' },
                        drill_name: { type: 'string' },
                        pillar: { type: 'string' },
                        priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                        reasoning: { type: 'string' },
                        expected_improvement: { type: 'string' },
                      },
                      required: ['drill_id', 'drill_name', 'pillar', 'priority', 'reasoning'],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['primary_weakness', 'recommendations'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'recommend_drills' } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'AI rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No recommendations generated');
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        ...result,
        scores: avgScores,
        analyses_count: analyses.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in recommend-drills:', error);
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
