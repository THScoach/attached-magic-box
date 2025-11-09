import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const COACH_RICK_SYSTEM_PROMPT = `You are Coach Rick, an experienced hitting coach from The Hitting Skool who uses data to provide actionable, encouraging insights.

COACHING PHILOSOPHY (CRITICAL - Follow these principles):
1. **Elite hitters rotate LESS, not more** - Quality over quantity. If pelvis rotation is less than MLB average, that's GOOD!
2. **Front side bracing is the #1 priority** - Deceleration rate (m/s²) is the most important metric for bat speed
3. **"Quick" rotation (good timing) > "Fast" rotation (high velocity)** - Sequence timing gaps matter more than velocity
4. **Goal sequence**: Momentum toward ball → rotation → deceleration → bat speed
5. **Reboot data is relative, not absolute** - System underreports velocities. Elite MLB hitters show "below average" on Reboot.

ELITE HITTER REFERENCE DATA:
- Aaron Judge: Pelvis 461.8°/s, Decel -2.25 m/s², X-Factor 39.0°, COM shift 16.07%
- Shohei Ohtani: Pelvis 432.7°/s, Decel 4.54 m/s², X-Factor 28.0°, COM shift 22.56%
- Freddie Freeman: X-Factor 24.2°, COM shift 22.17%
- MLB Average (Reboot): Pelvis 609.8°/s, Shoulders 818.9°/s, X-Factor 26.7°

PERSONALITY:
- Encouraging but honest - Celebrate wins, address issues directly
- Data-driven but accessible - Use numbers to support insights, not overwhelm
- Always provide actionable next steps
- Use player's actual data in comparisons
- Frame challenges as opportunities

RESPONSE FORMAT:
Provide a JSON response with this exact structure:
{
  "mainMessage": "2-3 paragraph analysis of their swing, highlighting biggest wins and key areas",
  "keyInsight": "One powerful sentence about their biggest strength or most important finding",
  "weeklyFocus": "Specific, actionable drill or cue for the week",
  "strengths": ["Strength 1 with data", "Strength 2 with data"],
  "improvements": ["Area 1 to work on with target", "Area 2 to work on"],
  "profile": "elite_mechanics_good_output" or "good_mechanics_low_output" or "rushed_tempo" or "weak_front_side" or "excessive_com"
}

NEVER:
- Say "rotate more" or "rotate faster" - Elite hitters rotate LESS
- Compare to "MLB average" without mentioning Reboot underreports
- Use vague encouragement like "good job!" without data
- Overwhelm with jargon
- Ignore player's specific numbers

ALWAYS:
- Use player's exact numbers in responses
- Compare to elite hitters (Judge, Ohtani, Freeman) when relevant
- Explain WHY a metric matters
- Provide specific, measurable targets
- Frame "below average" rotation as potentially GOOD`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportData, context } = await req.json();

    if (!reportData) {
      throw new Error('Report data is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('AI service not configured');
    }

    // Build context about the player's data
    const playerContext = `
PLAYER'S LATEST SWING DATA:

TIMING & TEMPO:
- Load Duration: ${reportData.loadDuration}ms
- Fire Duration: ${reportData.fireDuration}ms
- Tempo Ratio: ${reportData.tempoRatio}:1
- Pelvis→Shoulder Gap: ${reportData.pelvisShoulderGap}ms

BIOMECHANICS:
- Peak Pelvis Rotation: ${reportData.peakPelvisRotVel}°/s (MLB avg: ${reportData.mlbAvgPelvisRotVel || 609.8}°/s on Reboot)
- Peak Shoulder Rotation: ${reportData.peakShoulderRotVel}°/s (MLB avg: ${reportData.mlbAvgShoulderRotVel || 818.9}°/s on Reboot)
- Peak Arm Rotation: ${reportData.peakArmRotVel}°/s
- X-Factor Separation: ${reportData.xFactor}°
- Total Pelvis Rotation: ${reportData.totalPelvisRotation}°
- Total Shoulder Rotation: ${reportData.totalShoulderRotation}°

FRONT SIDE BRACING (PRIORITY #1):
- Deceleration Rate: ${reportData.comAvgDecelRate} m/s²
- Acceleration Rate: ${reportData.comAvgAccelRate} m/s²
- Bracing Efficiency: ${reportData.bracingEfficiency}:1

WEIGHT TRANSFER:
- COM Weight Shift: ${reportData.weightShift}% (Optimal: 20-30%)
- COM at Neg Move: ${reportData.comDistNegMove}%
- COM at Foot Down: ${reportData.comDistFootDown}%
- COM at Max Forward: ${reportData.comDistMaxForward}%
- Peak COM Velocity: ${reportData.peakCOMVelocity} m/s

CONSISTENCY:
- Overall Consistency: ${reportData.overallConsistency}%
- Pelvis Consistency: ${reportData.pelvisConsistency}%
- Shoulder Consistency: ${reportData.shoulderConsistency}%
- Arm Consistency: ${reportData.armConsistency}%

CONTEXT: ${context || 'Analyzing player\'s Reboot Motion report'}

Analyze this data using The Hitting Skool philosophy. Focus on quality metrics (bracing, tempo, sequence timing) over raw velocity. Remember that rotation velocities "below MLB average" are often GOOD because elite hitters rotate less and Reboot underreports.`;

    // Call Lovable AI
    console.log('Calling Lovable AI for coaching analysis...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: COACH_RICK_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: playerContext
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (aiResponse.status === 402) {
        throw new Error('AI service payment required. Please contact support.');
      }
      throw new Error('Failed to generate coaching insights');
    }

    const aiResult = await aiResponse.json();
    console.log('AI response received');
    
    const content = aiResult.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    let insights;
    try {
      // Strip markdown code fences if present
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.slice(7);
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.slice(3);
      }
      if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.slice(0, -3);
      }
      cleanedContent = cleanedContent.trim();
      
      insights = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        insights
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Coach Rick analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message || 'Unknown error',
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
