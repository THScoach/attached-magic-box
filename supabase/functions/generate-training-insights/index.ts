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

    // Fetch comprehensive performance data
    const [
      swingAnalyses,
      batMetrics,
      bodyMetrics,
      ballMetrics,
      brainMetrics,
      recentGoals
    ] = await Promise.all([
      supabase.from('swing_analyses').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('bat_metrics').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(15),
      supabase.from('body_metrics').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(15),
      supabase.from('ball_metrics').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(15),
      supabase.from('brain_metrics').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(15),
      supabase.from('user_goals').select('*').eq('user_id', user.id).eq('status', 'active')
    ]);

    // Calculate trends
    const calculateTrend = (data: any[], field: string) => {
      if (!data || data.length < 2) return 0;
      const recent = data.slice(0, 5);
      const older = data.slice(5, 10);
      if (older.length === 0) return 0;
      const recentAvg = recent.reduce((sum, item) => sum + Number(item[field] || 0), 0) / recent.length;
      const olderAvg = older.reduce((sum, item) => sum + Number(item[field] || 0), 0) / older.length;
      return ((recentAvg - olderAvg) / olderAvg) * 100;
    };

    const trends = {
      batSpeed: calculateTrend(batMetrics.data || [], 'bat_speed'),
      attackAngle: calculateTrend(batMetrics.data || [], 'attack_angle'),
      sequenceEfficiency: calculateTrend(bodyMetrics.data || [], 'sequence_efficiency'),
      tempoRatio: calculateTrend(bodyMetrics.data || [], 'tempo_ratio'),
      exitVelocity: calculateTrend(ballMetrics.data || [], 'exit_velocity'),
      reactionTime: calculateTrend(brainMetrics.data || [], 'reaction_time'),
    };

    // Calculate averages
    const getAverage = (data: any[], field: string) => {
      if (!data || data.length === 0) return null;
      return data.reduce((sum, item) => sum + Number(item[field] || 0), 0) / data.length;
    };

    const averages = {
      overallScore: getAverage(swingAnalyses.data || [], 'overall_score'),
      anchorScore: getAverage(swingAnalyses.data || [], 'anchor_score'),
      engineScore: getAverage(swingAnalyses.data || [], 'engine_score'),
      whipScore: getAverage(swingAnalyses.data || [], 'whip_score'),
      batSpeed: getAverage(batMetrics.data || [], 'bat_speed'),
      exitVelocity: getAverage(ballMetrics.data || [], 'exit_velocity'),
      sequenceEfficiency: getAverage(bodyMetrics.data || [], 'sequence_efficiency'),
    };

    // Use Lovable AI to generate insights
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const prompt = `You are an elite baseball hitting coach analyzing a player's performance data to provide actionable training insights.

Performance Trends (% change over last 10 sessions):
${Object.entries(trends).map(([key, value]) => `- ${key}: ${value > 0 ? '+' : ''}${value.toFixed(1)}%`).join('\n')}

Current Averages:
${Object.entries(averages).map(([key, value]) => value !== null ? `- ${key}: ${value.toFixed(1)}` : null).filter(Boolean).join('\n')}

Active Goals: ${recentGoals.data?.length || 0}

Based on this comprehensive data, provide:

1. **Overall Assessment** (2-3 sentences): Current performance level and trajectory
2. **Key Strengths** (2-3 bullet points): What they're doing well
3. **Areas for Improvement** (2-3 bullet points): Specific weaknesses with context
4. **Training Focus** (1-2 sentences): Primary area to focus training on
5. **Drill Recommendations** (3-5 specific drills): Match drills to their needs
6. **Weekly Practice Plan** (brief outline): How to structure their week

Use baseball coaching terminology and be specific. Reference the H.I.T.S. framework (ANCHOR, ENGINE, WHIP) when relevant.

Respond in this JSON format:
{
  "assessment": "string",
  "strengths": ["string", "string", "string"],
  "improvements": ["string", "string", "string"],
  "trainingFocus": "string",
  "drillRecommendations": [
    {
      "name": "Drill Name",
      "pillar": "ANCHOR|ENGINE|WHIP",
      "description": "Brief description",
      "reason": "Why this drill helps"
    }
  ],
  "weeklyPlan": {
    "focus": "Primary focus for the week",
    "structure": "How to structure practice sessions"
  }
}`;

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
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('AI analysis failed');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    // Parse JSON from AI response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const insights = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!insights) {
      throw new Error('Failed to parse AI insights');
    }

    console.log('Generated training insights:', insights);

    return new Response(
      JSON.stringify({ insights, trends, averages }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-training-insights:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
