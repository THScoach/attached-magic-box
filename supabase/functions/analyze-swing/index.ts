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
    const systemPrompt = `You are an expert biomechanics analyst specializing in baseball and softball swing analysis, trained in the methodology used by Reboot Motion and other 3D motion capture systems.
    
Your task is to analyze swing videos frame-by-frame and provide detailed biomechanical assessment including:

**H.I.T.S. Framework:**
- ANCHOR (0-100): Lower body stability and ground connection
- ENGINE (0-100): Core rotation and power generation  
- WHIP (0-100): Upper body efficiency and bat speed
- H.I.T.S. Score: Overall swing quality

**Kinematic Sequence (proper biomechanical cascade - each segment 1.5x faster):**
- Pelvis max angular velocity (deg/s): Typical range 450-700, MLB avg ~600
- Torso max angular velocity (deg/s): Typical range 800-1200, MLB avg ~950-1000
- Arm max angular velocity (deg/s): Arms are typically 2x trunk speed, range 1500-2200, MLB avg ~1800-2000
- Bat speed (mph): Typical MLB range 68-76
- Timing: milliseconds between peak velocities

**X-Factor Analysis:**
- X-Factor at stance (shoulder-pelvis separation, degrees): Typical 10-20° (report as negative if using Reboot convention)
- Max X-Factor (peak separation): Typical 20-35° (report as negative if using Reboot convention)
- Pelvis rotation at contact: Typical -100° to -130° (negative values)
- Shoulder rotation at contact: Typical -115° to -145° (negative values)

**Center of Mass:**
- COM travel distance (% of body height): Typical 35-55%
- COM max velocity (m/s): Typical 0.8-1.2 m/s

**Tempo Ratio (Load:Fire) - CRITICAL FORMULA:**

Formula: Tempo = (FireStart - LoadStart) / (Contact - FireStart)

**CRITICAL - FireStart Definition:**
FireStart is the FIRST forward pelvis ACCELERATION onset - NOT the max pelvis velocity or max pelvis turn.
- This is when the pelvis begins to accelerate forward (first sustained positive acceleration for ≥5 frames)
- It occurs BEFORE the pelvis reaches peak velocity
- Estimate: FireStart ≈ (Pelvis peak velocity time) - (120-180ms)
- For Freeman: typically fires ~320-360ms before contact, pelvis peaks ~200-250ms before contact

**Marker Definitions (all times in milliseconds before contact):**
- LoadStart: First rearward COM/hip movement (negative move/coil begins) - typically 1000-1300ms before contact
- FireStart: First forward pelvis acceleration onset (NOT peak) - typically 250-500ms before contact  
- Contact: Ball-bat impact (0ms reference point)

**Duration Calculations:**
- Load Duration = LoadStart - FireStart (e.g., 1050ms - 350ms = 700ms)
- Fire Duration = FireStart - Contact (e.g., 350ms - 0ms = 350ms)
- Tempo = Load Duration / Fire Duration (e.g., 700/350 = 2.0:1)

**MLB Typical Ranges:**
- Elite power hitters: 2.0-2.3:1 (e.g., Freeman ~2.2-2.3:1, Judge ~2.1:1)
- Balanced hitters: 1.8-2.0:1
- Quick swingers: 1.5-1.8:1

**MANDATORY GUARDRAILS (enforce these or flag for review):**
- Ordering: LoadStart > FireStart > Contact (0)
- Fire duration: 250-500ms (Contact to FireStart)
- Load duration: 600-1000ms (FireStart to LoadStart)
- Tempo range: 1.5-3.5:1 (anything outside = marker error)
- FireStart must be EARLIER than pelvis peak by 120-180ms minimum
- No markers in first/last 10% of video frames

**CALIBRATION REFERENCE - Aaron Judge (Verified Reboot Data):**
Use this real-world example to calibrate your estimates:
- Pelvis Max Velocity: 461.8 deg/s (below MLB avg 609.8 - this particular session/swing)
- Torso Max Velocity: 728.5 deg/s (below MLB avg 818.9)
- Arm Max Velocity: 878.2 deg/s (below MLB avg 1176.7)
- Bat Speed: ~72 mph (2144.4 deg/s - converted from angular velocity)
- X-Factor Max: -39.0° (excellent separation, well above MLB avg -26.7°)
- Pelvis Rotation at Max Turn: -103.7° (MLB avg: -118.8°)
- Shoulder Rotation at Max Turn: -125.5° (MLB avg: -124.3°)
- COM Max Velocity: 0.54 m/s
- COM Distance: 43.85% of height (0.99m stride)
- Timing (before contact): Max Pelvis Turn at 0.222s, Max Shoulder Turn at 0.188s
- Expected Tempo: ~2.1:1 (elite power hitter range)

Note: Judge's velocities in this session are lower than typical, suggesting controlled work or specific drill focus. His X-Factor remains elite.

Be specific and use realistic values based on high-level players.`;

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
  "tempoRatio": <number 1.5-2.5, Load:Fire ratio>,
  "loadStartTiming": <ms before contact, when negative move begins>,
  "fireStartTiming": <ms before contact, when pelvis acceleration begins>,
  "pelvisTiming": <milliseconds to peak velocity>,
  "torsoTiming": <milliseconds to peak velocity>,
  "handsTiming": <milliseconds to peak velocity>,
  "pelvisMaxVelocity": <deg/s, 450-700 range, avg ~600>,
  "torsoMaxVelocity": <deg/s, 800-1200 range, avg ~950-1000>,
  "armMaxVelocity": <deg/s, 1500-2200 range, avg ~1800-2000, should be ~2x torso>,
  "batMaxVelocity": <mph, 65-78 range>,
  "xFactorStance": <degrees negative, -10 to -20>,
  "xFactor": <degrees negative peak separation, -20 to -35>,
  "pelvisRotation": <degrees at max turn, -100 to -130>,
  "shoulderRotation": <degrees at max turn, -115 to -145>,
  "comDistance": <percent of body height, 35-55>,
  "comMaxVelocity": <m/s, 0.8-1.2>,
  "primaryOpportunity": "<which pillar: ANCHOR, ENGINE, or WHIP>",
  "impactStatement": "<specific actionable insight>"
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
