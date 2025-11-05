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
    const { analysisId, userId, playerId } = await req.json();
    console.log('Generating AI drill recommendations for:', { analysisId, userId, playerId });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch swing analysis data
    const { data: analysis, error: analysisError } = await supabase
      .from('swing_analyses')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (analysisError) throw analysisError;

    // Fetch available drills
    const { data: drills, error: drillsError } = await supabase
      .from('drills')
      .select('*')
      .order('pillar');

    if (drillsError) throw drillsError;

    // Prepare analysis summary for AI
    const metrics = analysis.metrics || {};
    const scores = {
      overall: Number(analysis.overall_score),
      anchor: Number(analysis.anchor_score),
      engine: Number(analysis.engine_score),
      whip: Number(analysis.whip_score),
      bat: Number(analysis.bat_score),
      ball: Number(analysis.ball_score),
      body: Number(analysis.body_score),
      brain: Number(analysis.brain_score)
    };

    // Find weakest areas
    const pillarScores = [
      { name: 'ANCHOR', score: scores.anchor },
      { name: 'ENGINE', score: scores.engine },
      { name: 'WHIP', score: scores.whip }
    ].sort((a, b) => a.score - b.score);

    const fourBScores = [
      { name: 'BAT', score: scores.bat },
      { name: 'BALL', score: scores.ball },
      { name: 'BODY', score: scores.body },
      { name: 'BRAIN', score: scores.brain }
    ].sort((a, b) => a.score - b.score);

    const systemPrompt = `You are an elite baseball hitting coach analyzing swing mechanics. Your job is to recommend specific drills from the available drill library to address the athlete's weaknesses.

Available Drills:
${drills.map(d => `- ${d.name} (${d.pillar}, Difficulty: ${d.difficulty}/5): ${d.description}`).join('\n')}

Analysis Guidelines:
1. Focus on the 2-3 weakest areas
2. Recommend drills that directly address specific mechanical issues
3. Provide clear, actionable reasoning for each recommendation
4. Consider progression (easier drills first if multiple areas need work)
5. Explain HOW each drill will improve the specific weakness`;

    const userPrompt = `Athlete Swing Analysis:
Overall Score: ${scores.overall}/100

Three Pillars:
- ANCHOR (Balance & Stability): ${scores.anchor}/100
- ENGINE (Timing & Sequencing): ${scores.engine}/100
- WHIP (Acceleration & Release): ${scores.whip}/100

Four B's:
- BAT (Bat speed, attack angle): ${scores.bat}/100
- BALL (Exit velocity, contact quality): ${scores.ball}/100
- BODY (Kinetic chain, mechanics): ${scores.body}/100
- BRAIN (Decision making, timing): ${scores.brain}/100

Key Metrics:
- Tempo Ratio: ${metrics.tempoRatio || 'N/A'}
- Front Foot Weight %: ${metrics.frontFootWeightPercent || 'N/A'}%
- COM Forward Movement: ${metrics.comForwardMovement || 'N/A'}
- Sequence Efficiency: ${metrics.sequenceEfficiency || 'N/A'}

Weakest Pillar: ${pillarScores[0].name} (${pillarScores[0].score}/100)
Weakest 4B Area: ${fourBScores[0].name} (${fourBScores[0].score}/100)

Based on this analysis, recommend 3-5 specific drills from the available drill library. For each drill, explain:
1. Why this drill addresses the athlete's specific weakness
2. What mechanical improvement they should focus on
3. Expected outcome if performed consistently`;

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
            name: 'recommend_drills',
            description: 'Recommend specific drills with detailed reasoning',
            parameters: {
              type: 'object',
              properties: {
                recommendations: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      drill_name: { type: 'string' },
                      drill_id: { type: 'string' },
                      priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                      pillar: { type: 'string', enum: ['ANCHOR', 'ENGINE', 'WHIP'] },
                      reasoning: { type: 'string' },
                      focus_points: {
                        type: 'array',
                        items: { type: 'string' }
                      },
                      expected_improvement: { type: 'string' }
                    },
                    required: ['drill_name', 'priority', 'pillar', 'reasoning', 'focus_points', 'expected_improvement'],
                    additionalProperties: false
                  }
                },
                training_plan_summary: { type: 'string' },
                focus_areas: {
                  type: 'array',
                  items: { type: 'string' }
                }
              },
              required: ['recommendations', 'training_plan_summary', 'focus_areas'],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'recommend_drills' } }
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
      throw new Error('AI recommendation failed');
    }

    const aiResult = await aiResponse.json();
    console.log('AI response:', JSON.stringify(aiResult, null, 2));

    const toolCall = aiResult.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const recommendations = JSON.parse(toolCall.function.arguments);

    // Match drill IDs from database
    const enrichedRecommendations = recommendations.recommendations.map((rec: any) => {
      const matchedDrill = drills.find(d => 
        d.name.toLowerCase() === rec.drill_name.toLowerCase() ||
        d.name.toLowerCase().includes(rec.drill_name.toLowerCase())
      );

      return {
        ...rec,
        drill_id: matchedDrill?.id || null,
        drill_difficulty: matchedDrill?.difficulty || null,
        drill_duration: matchedDrill?.duration || null,
        drill_description: matchedDrill?.description || null,
        drill_video_url: matchedDrill?.video_url || null
      };
    });

    // Store recommendations in database
    const { error: insertError } = await supabase
      .from('drill_recommendations')
      .insert({
        user_id: userId,
        player_id: playerId,
        analysis_id: analysisId,
        recommendations: enrichedRecommendations,
        training_plan_summary: recommendations.training_plan_summary,
        focus_areas: recommendations.focus_areas,
        ai_generated: true
      });

    if (insertError) {
      console.error('Error storing recommendations:', insertError);
      // Don't fail the request, just log the error
    }

    console.log('Drill recommendations generated successfully');

    return new Response(
      JSON.stringify({
        recommendations: enrichedRecommendations,
        training_plan_summary: recommendations.training_plan_summary,
        focus_areas: recommendations.focus_areas
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in recommend-drills-ai:', error);
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
