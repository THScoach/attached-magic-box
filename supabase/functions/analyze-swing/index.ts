import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { frames, keypoints } = await req.json();
    
    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No frames provided' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Analyzing ${frames.length} frames with keypoints data`);

    // Prepare the prompt for biomechanical analysis
    const systemPrompt = `You are an expert biomechanics analyst specializing in baseball and softball swing analysis. 
    
Your task is to analyze swing videos and provide detailed biomechanical assessment using the H.I.T.S. framework:
- ANCHOR (0-100): Lower body stability and ground connection during the swing
- ENGINE (0-100): Core rotation and power generation from the torso
- WHIP (0-100): Upper body efficiency and bat speed generation
- H.I.T.S. Score: Overall swing quality (average of the three pillars)

Also provide:
- Tempo Ratio: The timing relationship between body segments (ideal ~1.3-1.5)
- Kinematic Sequence: Timing of pelvis peak velocity → torso peak velocity → hands peak velocity (in milliseconds)
- Primary Opportunity: The main area for improvement
- Impact Statement: A brief, actionable insight

Be specific, analytical, and provide realistic scores based on what you observe.`;

    const userPrompt = `Analyze this baseball/softball swing sequence. I'm providing ${frames.length} key frames from a high-speed video (300fps).
    
${keypoints ? `I've also detected body keypoints for tracking movement. Focus on the kinematic sequence - the timing and velocity of:
1. Pelvis rotation
2. Torso rotation  
3. Hands/bat movement

Look for proper sequencing (ground up), separation between segments, and timing efficiency.` : ''}

Provide detailed scores and analysis in this exact JSON format:
{
  "anchorScore": <number 0-100>,
  "engineScore": <number 0-100>,
  "whipScore": <number 0-100>,
  "hitsScore": <number 0-100>,
  "tempoRatio": <number>,
  "pelvisTiming": <milliseconds to peak velocity>,
  "torsoTiming": <milliseconds to peak velocity>,
  "handsTiming": <milliseconds to peak velocity>,
  "primaryOpportunity": "<which pillar needs most work: ANCHOR, ENGINE, or WHIP>",
  "impactStatement": "<concise, actionable insight about the swing>"
}`;

    // Prepare messages with images
    const messages = [
      { role: "system", content: systemPrompt },
      { 
        role: "user", 
        content: [
          { type: "text", text: userPrompt },
          ...frames.map((frame: string) => ({
            type: "image_url",
            image_url: { url: frame }
          }))
        ]
      }
    ];

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: messages,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('AI Response:', content);

    // Parse the JSON from the response
    let analysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw content:', content);
      throw new Error('Failed to parse analysis results');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis: analysis
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in analyze-swing function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
