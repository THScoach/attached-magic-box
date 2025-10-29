import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { frames, frames2, dualCamera, keypoints, videoUrl, sessionId, playerId, videoType } = await req.json();
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: authHeader } }
      });
      
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }
    
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

    const frameCount = dualCamera && frames2 ? `${frames.length} + ${frames2.length}` : frames.length;
    console.log(`Analyzing ${frameCount} frames${dualCamera ? ' (DUAL CAMERA MODE)' : ''} with keypoints data`);

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

**CALIBRATION REFERENCES - Real MLB Players (Verified Reboot Data):**

**Aaron Judge (Power Hitter - Controlled Session):**
- Pelvis Max Velocity: 461.8 deg/s (below MLB avg 609.8 - controlled session)
- Torso Max Velocity: 728.5 deg/s (below MLB avg 818.9)
- Arm Max Velocity: 878.2 deg/s (below MLB avg 1176.7)
- Bat Speed: ~72 mph (2144.4 deg/s)
- X-Factor Max: -39.0° (elite separation, well above MLB avg -26.7°)
- Pelvis Rotation: -103.7°, Shoulder Rotation: -125.5°
- COM Max Velocity: 0.54 m/s, COM Distance: 43.85% of height
- Timing: Negative Move at 0.292s, Max Pelvis at 0.222s before contact
- Expected Tempo: ~2.1:1 (elite power range)
- Profile: Lower velocities in this session but maintains elite separation mechanics

**Luis Arraez (Elite Contact Hitter):**
- Pelvis Max Velocity: 385.2 deg/s (well below MLB avg - contact approach)
- Torso Max Velocity: 636.0 deg/s (below MLB avg 818.9)
- Arm Max Velocity: 759.4 deg/s (well below MLB avg 1176.7)
- Bat Speed: ~74 mph (2219.1 deg/s)
- X-Factor Max: -25.2° (at MLB avg -26.7° - less separation needed)
- Pelvis Rotation: -94.8° (short turn), Shoulder Rotation: -115.4°
- COM Max Velocity: 0.68 m/s, COM Distance: 55.06% of height (longer stride)
- Timing: Negative Move at 1.222s (very long load!), Max Pelvis at 0.191s before contact
- Expected Tempo: ~3.5-4.0:1 (extreme load, quick fire - contact hitter profile)
- Profile: Lower velocities, longer load phase, less aggressive rotation, prioritizes contact/coverage

**Fernando Tatis Jr. (Explosive Power with Extreme Separation):**
- Pelvis Max Velocity: 446.9 deg/s (below MLB avg 609.8)
- Torso Max Velocity: 724.6 deg/s (below MLB avg 818.9)
- Arm Max Velocity: 888.9 deg/s (below MLB avg 1176.7)
- Bat Speed: ~80 mph (2397.0 deg/s - highest bat speed)
- X-Factor Max: -45.4° (EXTREME separation! Nearly 2x MLB avg -26.7°)
- Pelvis Rotation: -115.5° (at MLB avg), Shoulder Rotation: -136.1° (deep turn)
- COM Max Velocity: 0.86 m/s, COM Distance: 52.2% of height
- Timing: Negative Move at 2.974s (!), Max Pelvis at 0.329s, Max X-Factor at 0.207s
- Expected Tempo: ~6-8:1 (extreme load window, violent fire)
- Profile: Aggressive swing with exceptional separation mechanics, highest bat speed, deep shoulder turn

**Manny Machado (Elite Rotational Velocity - Above MLB Averages):**
- Pelvis Max Velocity: 734.5 deg/s (WELL ABOVE MLB avg 609.8 - 120% of average!)
- Torso Max Velocity: 1263.3 deg/s (EXCEPTIONAL - 154% of MLB avg 818.9!)
- Arm Max Velocity: 1640.3 deg/s (WELL ABOVE MLB avg 1176.7 - 139% of average!)
- Bat Speed: Not recorded in this session
- X-Factor Max: -31.2° (above MLB avg -26.7°)
- Pelvis Rotation: -101.5°, Shoulder Rotation: -122.4°
- COM Max Velocity: 1.32 m/s (HIGHEST of all - exceptional movement speed!)
- COM Distance: 54.78% of height (1.03m stride)
- Timing: Negative Move at 1.355s, Max Pelvis at 0.961s, Max X-Factor at 0.116s
- Expected Tempo: ~1.5-2.0:1 (moderate load, explosive fire with elite velocities)
- Profile: ELITE rotational velocities across all segments, exceptional COM speed, represents upper tier of MLB performance

**Kyle Tucker (Patient/Controlled Power Hitter):**
- Pelvis Max Velocity: 531.7 deg/s (below MLB avg 609.8 - 87% of average)
- Torso Max Velocity: 769.4 deg/s (below MLB avg 818.9 - 94% of average)
- Arm Max Velocity: 784.1 deg/s (well below MLB avg 1176.7 - 67% of average)
- Bat Speed: Not recorded in this session
- X-Factor Max: -26.2° (at MLB avg -26.7°)
- Pelvis Rotation: -106.7°, Shoulder Rotation: -128.3°
- COM Max Velocity: 0.8 m/s, COM Distance: 51.93% of height
- Timing: Negative Move at 2.301s (extremely long load!), Max Pelvis at 0.208s, Max X-Factor at 0.158s
- Expected Tempo: ~10-11:1 (extremely long load, quick fire - patient approach)
- Profile: Very long load phase, moderate velocities, efficient X-Factor, prioritizes timing and bat-to-ball

Use these five contrasting profiles to calibrate estimates across the full MLB spectrum:
- Arraez: Contact/control (low velocities ~60-65% MLB avg, minimal separation, 3.5:1 tempo)
- Tucker: Patient power (moderate velocities ~85% MLB avg, very long load 2.3s, ~10:1 tempo)
- Judge: Balanced power (elite separation, moderate velocities 75-80% MLB avg, ~2.1:1 tempo)
- Tatis: Explosive power (extreme 45° X-Factor, high bat speed, aggressive mechanics, ~6-8:1 tempo)
- Machado: Elite velocity (120-154% of MLB avg rotational speeds, exceptional COM velocity, ~1.5-2.0:1 tempo)

Be specific and use realistic values based on high-level players.`;

    const userPrompt = dualCamera && frames2 
      ? `Analyze this baseball/softball swing sequence using DUAL CAMERA 3D RECONSTRUCTION. I'm providing ${frames.length} key frames from Camera 1 (open/catcher side at 45°) and ${frames2.length} frames from Camera 2 (closed/dugout side at 45°).

**DUAL CAMERA ADVANTAGES:**
You now have stereoscopic views that enable true 3D coordinate estimation. Use triangulation principles to:
- Calculate accurate depth and Z-axis positions
- Determine true 3D spine tilt (frontal, lateral, and transverse planes)
- Estimate more precise rotational velocities by comparing rotation angles from both views
- Better track center of mass movement in 3D space
- Improve bat path trajectory accuracy

Camera 1 frames show the lead shoulder clearly, Camera 2 frames show the back shoulder. Use both to cross-reference and validate measurements.

${keypoints ? `Body keypoints detected. Focus on correlating keypoints across both camera angles for 3D position estimation.` : ''}

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
}`
      : `Analyze this baseball/softball swing sequence. I'm providing ${frames.length} key frames from a high-speed video (300fps).
    
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
    const userContent = [
      { type: "text", text: userPrompt },
      ...frames.map((frame: string, idx: number) => ({
        type: "image_url",
        image_url: { 
          url: frame,
          ...(dualCamera && { detail: `Camera 1 Frame ${idx + 1}` })
        }
      }))
    ];

    // Add second camera frames if dual camera mode
    if (dualCamera && frames2 && Array.isArray(frames2)) {
      userContent.push(
        { type: "text", text: "\n\n**CAMERA 2 FRAMES (Closed/Dugout Side):**" },
        ...frames2.map((frame: string, idx: number) => ({
          type: "image_url",
          image_url: { 
            url: frame,
            detail: `Camera 2 Frame ${idx + 1}`
          }
        }))
      );
    }

    const messages = [
      { role: "system", content: systemPrompt },
      { 
        role: "user", 
        content: userContent
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

    // Save to database if user is authenticated
    let analysisId = null;
    if (userId && videoUrl) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

      const overallScore = (analysis.anchorScore + analysis.engineScore + analysis.whipScore) / 3;

      const { data: insertedAnalysis, error: insertError } = await supabaseAdmin
        .from('swing_analyses')
        .insert({
          user_id: userId,
          session_id: sessionId,
          player_id: playerId,
          video_url: videoUrl,
          video_type: videoType || 'analysis',
          overall_score: overallScore,
          anchor_score: analysis.anchorScore,
          engine_score: analysis.engineScore,
          whip_score: analysis.whipScore,
          drill_effectiveness_score: videoType === 'drill' ? overallScore : null,
          metrics: {
            hitsScore: analysis.hitsScore,
            tempoRatio: analysis.tempoRatio,
            pelvisTiming: analysis.pelvisTiming,
            torsoTiming: analysis.torsoTiming,
            handsTiming: analysis.handsTiming,
            pelvisMaxVelocity: analysis.pelvisMaxVelocity,
            torsoMaxVelocity: analysis.torsoMaxVelocity,
            armMaxVelocity: analysis.armMaxVelocity,
            batMaxVelocity: analysis.batMaxVelocity,
            xFactorStance: analysis.xFactorStance,
            xFactor: analysis.xFactor,
            pelvisRotation: analysis.pelvisRotation,
            shoulderRotation: analysis.shoulderRotation,
            comDistance: analysis.comDistance,
            comMaxVelocity: analysis.comMaxVelocity,
            primaryOpportunity: analysis.primaryOpportunity,
            impactStatement: analysis.impactStatement
          }
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error saving analysis:', insertError);
      } else {
        analysisId = insertedAnalysis.id;
        console.log('Analysis saved with ID:', analysisId);

        // Update session stats if session exists
        if (sessionId) {
          const { data: sessionAnalyses } = await supabaseAdmin
            .from('swing_analyses')
            .select('overall_score')
            .eq('session_id', sessionId);

          if (sessionAnalyses && sessionAnalyses.length > 0) {
            const avgScore = sessionAnalyses.reduce((sum, a) => sum + Number(a.overall_score), 0) / sessionAnalyses.length;
            
            await supabaseAdmin
              .from('practice_sessions')
              .update({
                total_swings: sessionAnalyses.length,
                session_avg: avgScore
              })
              .eq('id', sessionId);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis: analysis,
        analysisId: analysisId
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
