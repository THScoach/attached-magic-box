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
    const { userId, playerId, currentMetrics, historicalData } = await req.json();
    console.log('Generating AI goal suggestions for user:', userId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch recent analyses for context
    const { data: analyses, error: analysesError } = await supabase
      .from('swing_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (analysesError) throw analysesError;

    // Calculate trends
    const trends = calculateTrends(analyses || []);

    const systemPrompt = `You are an elite baseball performance coach specialized in goal setting using the SMART framework (Specific, Measurable, Achievable, Relevant, Time-bound).

Your job is to analyze an athlete's current performance and suggest 3-5 achievable goals that will meaningfully improve their hitting performance.

Guidelines for SMART goals:
- **Specific**: Clear, focused target (e.g., "Increase bat speed from 70 to 75 mph")
- **Measurable**: Quantifiable with objective metrics
- **Achievable**: Realistic based on current performance and typical improvement rates
- **Relevant**: Directly impacts hitting success
- **Time-bound**: Clear deadline (2 weeks for quick wins, 30 days for moderate improvements, 90 days for major changes)

Typical improvement rates for reference:
- Bat speed: 2-5 mph in 30 days with focused training
- Exit velocity: 3-7 mph in 30 days
- Tempo ratio: 0.3-0.5 improvement in 30 days  
- Pillar scores: 5-15 points in 30 days
- Overall score: 5-10 points in 30 days

Prioritize goals that:
1. Address the weakest areas first (biggest opportunity)
2. Build on recent positive trends
3. Have measurable short-term milestones`;

    const userPrompt = `Current Performance Metrics:
- Overall Score: ${currentMetrics.overall_score}/100
- ANCHOR (Balance): ${currentMetrics.anchor_score}/100
- ENGINE (Timing): ${currentMetrics.engine_score}/100
- WHIP (Power): ${currentMetrics.whip_score}/100
- BAT: ${currentMetrics.bat_score}/100
- BALL: ${currentMetrics.ball_score}/100
- BODY: ${currentMetrics.body_score}/100
- BRAIN: ${currentMetrics.brain_score}/100

Specific Metrics:
- Bat Speed: ${currentMetrics.bat_speed || 'N/A'} mph
- Exit Velocity: ${currentMetrics.exit_velocity || 'N/A'} mph
- Tempo Ratio: ${currentMetrics.tempo_ratio || 'N/A'}
- Attack Angle: ${currentMetrics.attack_angle || 'N/A'}°

Recent Trends:
${trends.improving.length > 0 ? `Improving: ${trends.improving.join(', ')}` : 'No clear improvements yet'}
${trends.declining.length > 0 ? `Declining: ${trends.declining.join(', ')}` : ''}
${trends.stable.length > 0 ? `Stable: ${trends.stable.join(', ')}` : ''}

Total Swings Analyzed: ${analyses?.length || 0}

Based on this athlete's current performance, suggest 3-5 SMART goals that are:
1. Challenging but achievable
2. Have clear milestones
3. Will meaningfully improve overall hitting performance`;

    // Call Lovable AI
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
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'suggest_goals',
            description: 'Suggest SMART goals for athlete development',
            parameters: {
              type: 'object',
              properties: {
                goals: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      goal_type: { 
                        type: 'string',
                        enum: ['bat_speed', 'exit_velocity', 'tempo_ratio', 'pillar_score', 'overall_score', 'custom']
                      },
                      target_metric: { type: 'string' },
                      current_value: { type: 'number' },
                      target_value: { type: 'number' },
                      unit: { type: 'string' },
                      description: { type: 'string' },
                      specific_details: { type: 'string' },
                      measurable_criteria: { type: 'string' },
                      achievable_reasoning: { type: 'string' },
                      relevant_context: { type: 'string' },
                      days_to_complete: { type: 'number' },
                      priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                      milestones: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            value: { type: 'number' },
                            description: { type: 'string' }
                          },
                          required: ['value', 'description']
                        }
                      }
                    },
                    required: ['title', 'goal_type', 'target_metric', 'current_value', 'target_value', 'unit', 'description', 'days_to_complete', 'priority'],
                    additionalProperties: false
                  }
                },
                overall_strategy: { type: 'string' }
              },
              required: ['goals', 'overall_strategy'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'suggest_goals' } }
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a moment.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI credits depleted. Please add credits to continue.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('AI goal suggestion failed');
    }

    const aiResult = await aiResponse.json();
    console.log('AI response:', JSON.stringify(aiResult, null, 2));

    const toolCall = aiResult.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const suggestions = JSON.parse(toolCall.function.arguments);

    console.log('Goal suggestions generated successfully');

    return new Response(
      JSON.stringify({
        goals: suggestions.goals,
        overall_strategy: suggestions.overall_strategy
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-goal-suggestions:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function calculateTrends(analyses: any[]) {
  if (analyses.length < 3) {
    return { improving: [], declining: [], stable: [] };
  }

  const metrics = ['overall_score', 'anchor_score', 'engine_score', 'whip_score'];
  const improving: string[] = [];
  const declining: string[] = [];
  const stable: string[] = [];

  for (const metric of metrics) {
    const values = analyses.slice(0, 5).map(a => Number(a[metric])).filter(v => !isNaN(v));
    if (values.length < 3) continue;

    const recent = values.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
    const older = values.slice(2).reduce((a, b) => a + b, 0) / (values.length - 2);
    const change = recent - older;

    const metricName = metric.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    if (change > 3) {
      improving.push(metricName);
    } else if (change < -3) {
      declining.push(metricName);
    } else {
      stable.push(metricName);
    }
  }

  return { improving, declining, stable };
}
