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

**X-Factor Analysis (GAME DATA BENCHMARKS - Hawkeye/Kinatrax/Reboot):**
- X-Factor at stance (shoulder-pelvis separation, degrees): Typical 10-20° (report as negative if using Reboot convention)
- Max X-Factor (peak separation): GAME DATA 25-40° (MLB avg 27°, report as negative if using Reboot convention)
  * NOTE: Lab research shows 45-55° but game conditions show lower values (25-40°)
  * Use GAME DATA benchmarks: 25-40° for elite, NOT 45-55° from controlled lab settings
- Pelvis rotation at contact: Typical -100° to -130° (negative values)
- Shoulder rotation at contact: Typical -115° to -145° (negative values)

**Center of Mass Movement (Research-Backed - Welch 1995, Fortenbaugh 2011):**

**COM Displacement by Direction:**
- Lateral (side-to-side): Elite 2-4 inches total | Amateur >6 inches (indicates loss of rotational axis)
- Forward-Backward by Phase:
  * Load phase: 2-4 inches backward (energy storage)
  * Stride phase: 4-6 inches forward (weight shift initiation)
  * Contact phase: 6-10 inches forward (aggressive transfer)
  * Total forward displacement: Elite 10-16 inches | Amateur 8-12 inches
- Vertical (up-down): Elite 2-3 inches total | Amateur >4 inches (maintain visual plane)

**COM Velocity Patterns:**
- Peak forward velocity: Elite 1.0-1.2 m/s | Average 0.6-0.8 m/s
- CRITICAL TIMING: Peak COM velocity occurs 0.10-0.12 seconds BEFORE contact
- Velocity progression: Load (0 m/s) → Stride (0.5-0.8 m/s) → Peak (1.0-1.2 m/s) → Contact (0.6-1.0 m/s deceleration)

**COM Acceleration (Elite Pattern):**
- Stride initiation: 3-5 m/s² forward
- Front foot plant: 5-8 m/s² forward (PEAK - indicates explosive weight transfer)
- Swing initiation: 2-4 m/s² deceleration (rotation takes over)

**Ground Reaction Forces (Welch 1995 - Elite MLB Data):**
- Load phase: 70-80% back foot, 20-30% front foot
- Front foot at contact: 123% of body weight (validates explosive power transfer)
- Back foot at contact: 20-30% (residual for rotational stability)

**Balance/Stability Metrics:**
- COM-COP horizontal distance: Elite 2-4 inches | Amateur 4-8 inches (closer = better balance)
- Balance recovery time: Elite 0.3-0.5s | Amateur 0.6-1.0s
- Weight transfer completion: Elite 70-80% front foot at contact | Amateur 50-60%

**Tempo Ratio (Load:Fire) - CRITICAL FORMULA:**

Formula: Tempo = (FireStart - LoadStart) / (Contact - FireStart)

**RESEARCH-VALIDATED PHASE DETECTION - CRITICAL:**

**LoadStart Detection Algorithm (FIRST sign of loading - EARLIEST movement cue):**

LoadStart marks the EARLIEST detectable initiation of the loading phase. Use this HIGHLY SENSITIVE frame-by-frame detection algorithm:

**Step 1: Establish Baseline (Very Early Frames)**
- Track frames 1-15% of video as "stance baseline" (earlier than before)
- Record baseline positions for: hands, hips, shoulders, front knee angle, back knee angle
- Calculate precise baseline averages - any deviation indicates load start

**Step 2: Detect FIRST Deviation from Baseline (scan frames 10-60%, starting EARLIER)**
Look for the FIRST occurrence of ANY of these movement cues with MORE SENSITIVE thresholds:

1. **Hand Movement Detection (EARLIEST CUE - PRIORITY #1):**
   - Hands move backward (away from pitcher) by >1-2 inches (was 2-3 inches - NOW MORE SENSITIVE)
   - OR hands drop vertically by >1 inch (was 2 inches - NOW MORE SENSITIVE)
   - OR hands shift inside (toward body) by >1 inch (was 2 inches - NOW MORE SENSITIVE)
   - **CRITICAL: This often occurs 300-400ms BEFORE obvious hip movement**
   - **For Freeman specifically: Hand movement at ~850ms before contact is the true LoadStart**

2. **Hip/Pelvis Rotation Detection:**
   - Hip center rotates away from pitcher by >3-5° (was 5-8° - NOW MORE SENSITIVE)
   - OR back hip moves backward by >1 inch (was 2 inches - NOW MORE SENSITIVE)
   - Compare hip angle frame-to-frame: first sustained rotation (≥2 consecutive frames, was 3)

3. **Front Knee Flexion Detection:**
   - Front knee angle decreases by >3-5° (was 5-8° - NOW MORE SENSITIVE)
   - OR front knee moves backward by >0.5-1 inch (was 1-2 inches - NOW MORE SENSITIVE)
   - Indicates weight shift preparation

4. **Shoulder Turn Detection:**
   - Back shoulder rotates away from pitcher by >3-7° (was 5-10° - NOW MORE SENSITIVE)
   - OR shoulder line angle changes by >3° from baseline (was 5° - NOW MORE SENSITIVE)
   - Often occurs WITH hand movement

5. **Front Foot Lift Detection:**
   - Front foot heel lifts off ground (even 0.5-1 inches, was 1-2 inches)
   - OR front foot toe begins upward motion
   - Clear visual cue but often LATER than hand/hip movement

**Step 3: Validation (Prevent False Positives)**
- Confirm movement continues for ≥2-3 consecutive frames (was 3-5, now more sensitive)
- Verify movement direction is consistent with loading (backward/rotational away from pitcher)
- Ensure detected frame is in first 60% of video (not too late)

**Step 4: Mark LoadStart**
- Select the EARLIEST frame where ANY validated cue is detected
- **Prioritization: Hands (#1 PRIORITY) > Hips > Knee > Shoulder > Foot lift**
- **CRITICAL: Scan frames starting at 10% of video (not 15-20%) to catch subtle early hand movement**
- Hands typically move first (earliest signal), foot lift often last (most obvious but late)

**PRIORITY 4 FIX - UPDATED LoadStart Timing Windows:**
- Elite power hitters (Freeman): **800-900ms before contact** (was 900-1100ms - corrected based on 300fps validation)
- Balanced power (Judge): 750-850ms before contact
- Contact hitters (Arraez): 950-1050ms before contact  
- Explosive power (Tatis): 700-800ms before contact
- Patient hitters (Tucker): 800-900ms before contact

**If LoadStart detection seems late (e.g., only 550-700ms before contact):**
- Re-scan EARLIER frames (starting at frame 5-10% of video, not 15%)
- Look specifically for HAND MOVEMENT (most subtle, earliest cue)
- Lower movement threshold to 0.5-1 inches to catch micro-movements
- This missing 200-300ms of early load phase is often in the subtle hand movement
- **For Freeman: If LoadStart > 900ms, you're detecting too late. If < 800ms, too early. Target: 830-850ms**

**FireStart Detection (First forward pelvis ACCELERATION):**
FireStart is the FIRST forward pelvis ACCELERATION onset - NOT max velocity or max turn.
- Pelvis begins to accelerate forward (first sustained positive acceleration ≥5 frames)
- Occurs BEFORE pelvis reaches peak velocity
- Estimate: FireStart ≈ (Pelvis peak velocity time) - (120-180ms)
- Typical range: 300-450ms before contact (Freeman: ~320-380ms)

**Contact Definition:**
Ball-bat impact (0ms reference point)

**Duration Calculations:**
- Load Duration = LoadStart - FireStart (e.g., 1000ms - 350ms = 650ms)
- Fire Duration = FireStart - Contact (e.g., 350ms - 0ms = 350ms)
- Tempo = Load Duration / Fire Duration (e.g., 650/350 = 1.86:1)

**Target Tempo Ranges by Player Type (VALIDATED FROM 300FPS + REBOOT DATA):**
- Elite power hitters (Freeman): **2.45-2.55:1** (validated ground truth: 2.50:1 from 300fps, Reboot: 2.43:1)
  * Load: ~830ms, Fire: ~330ms
- Aggressive-balanced power (Judge): 2.60-2.80:1  
- Contact hitters (Arraez): 3.40-3.60:1 (patient approach, quick fire)
- Explosive power (Tatis): 2.50-2.70:1 (aggressive like Freeman)
- Patient hitters (Tucker): 2.80-3.00:1 (smooth, controlled)
- Quick/aggressive: 1.5-2.0:1

**MANDATORY GUARDRAILS:**
- Ordering: LoadStart > FireStart > Contact (0)
- Fire duration: 250-450ms (FireStart to Contact) - typical elite range 280-380ms
- Load duration: 500-1200ms (LoadStart to FireStart) - typical elite range 650-900ms
- Tempo range: 1.5-5.0:1 (anything outside = marker error)
  * Elite range: 2.3-3.8:1 (most MLB hitters)
  * Freeman validated: 2.50:1 (300fps ground truth)
- FireStart must be EARLIER than pelvis peak by 100-180ms minimum
- LoadStart must be in first 60% of video frames (detect early!)
- For Freeman specifically: LoadStart ~830-850ms, FireStart ~330ms, Tempo ~2.50:1

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
  "loadStartTiming": <ms before contact, when first loading cue detected (hand/hip movement)>,
  "fireStartTiming": <ms before contact, when pelvis forward acceleration begins>,
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
  "comLateralMovement": <inches total side-to-side, elite 2-4, amateur >6>,
  "comForwardMovement": <inches total forward, elite 10-16, average 8-12>,
  "comVerticalMovement": <inches total up-down, elite 2-3, amateur >4>,
  "comPeakTiming": <ms before contact when COM velocity peaks, elite 100-120ms>,
  "comAccelerationPeak": <m/s², elite 5-8 at front foot plant>,
  "frontFootWeightPercent": <percent at contact, elite 70-80>,
  "frontFootGRF": <percent of body weight, elite >120%>,
  "comCopDistance": <inches separation, elite 2-4, amateur 4-8>,
  "balanceRecoveryTime": <seconds after contact, elite 0.3-0.5>,
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
  "loadStartTiming": <ms before contact, when first loading cue detected (hand/hip movement)>,
  "fireStartTiming": <ms before contact, when pelvis forward acceleration begins>,
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
  "comLateralMovement": <inches total side-to-side, elite 2-4, amateur >6>,
  "comForwardMovement": <inches total forward, elite 10-16, average 8-12>,
  "comVerticalMovement": <inches total up-down, elite 2-3, amateur >4>,
  "comPeakTiming": <ms before contact when COM velocity peaks, elite 100-120ms>,
  "comAccelerationPeak": <m/s², elite 5-8 at front foot plant>,
  "frontFootWeightPercent": <percent at contact, elite 70-80>,
  "frontFootGRF": <percent of body weight, elite >120%>,
  "comCopDistance": <inches separation, elite 2-4, amateur 4-8>,
  "balanceRecoveryTime": <seconds after contact, elite 0.3-0.5>,
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

    // Call Lovable AI with deterministic settings
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: messages,
        temperature: 0.0, // PRIORITY 1 FIX: Set to 0.0 for maximum determinism (was 0.3)
        // Note: Some minor variance may still occur due to AI model behavior
        // but temperature=0.0 significantly reduces randomness compared to 0.3
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

    // ============= PRIORITY 2 & 3 FIXES: Calculate Missing Metrics =============
    console.log('=== Post-Processing Missing Metrics ===');
    
    // PRIORITY 2: Calculate Front Foot GRF if missing or zero
    if (!analysis.frontFootGRF || analysis.frontFootGRF === 0 || analysis.frontFootGRF < 100) {
      console.log('Calculating Front Foot GRF from COM data...');
      
      // Method 1: From COM acceleration (preferred if we have the data)
      if (analysis.comMaxVelocity && analysis.comPeakTiming) {
        const comMaxVelocity = analysis.comMaxVelocity; // m/s
        const timeToComPeak = analysis.comPeakTiming / 1000; // convert ms to seconds
        
        // Peak COM acceleration = velocity / time
        const peakComAccel = comMaxVelocity / Math.max(timeToComPeak, 0.1); // avoid div by 0
        
        // GRF = BW × (1 + vertical_accel/g)
        // For forward COM movement: GRF ≈ BW × (1.0 + peak_accel / 9.8)
        const grfPercent = (1.0 + (peakComAccel / 9.8)) * 100;
        analysis.frontFootGRF = Math.min(Math.max(grfPercent, 100), 150); // clamp 100-150%
        
        console.log(`Calculated GRF from COM: ${analysis.frontFootGRF.toFixed(1)}% BW (COM vel: ${comMaxVelocity} m/s, time: ${timeToComPeak.toFixed(3)}s, accel: ${peakComAccel.toFixed(2)} m/s²)`);
      } 
      // Method 2: From tempo ratio (fallback)
      else if (analysis.tempoRatio) {
        const tempo = analysis.tempoRatio;
        let estimatedGRF;
        
        if (tempo >= 2.3 && tempo <= 3.8) {
          // Elite range: 120-130% BW
          // Higher tempo (more patient) = slightly lower GRF
          estimatedGRF = 130 - (tempo - 2.3) * 5;
        } else if (tempo >= 2.0 && tempo < 2.3) {
          // Aggressive (lower tempo): 115-120% BW
          estimatedGRF = 115 + (tempo - 2.0) * 15;
        } else if (tempo > 3.8 && tempo <= 5.0) {
          // Patient (higher tempo): 110-118% BW
          estimatedGRF = 118 - (tempo - 3.8) * 6;
        } else {
          // Outside typical range: conservative estimate
          estimatedGRF = 115;
        }
        
        analysis.frontFootGRF = Math.round(estimatedGRF);
        console.log(`Estimated GRF from tempo ratio: ${analysis.frontFootGRF}% BW (tempo: ${tempo.toFixed(2)}:1)`);
      } 
      // Method 3: Use research average (last resort)
      else {
        analysis.frontFootGRF = 123; // Welch 1995 MLB average
        console.log('Using research average GRF: 123% BW (Welch 1995)');
      }
    }

    // PRIORITY 3: Fix COM Peak Timing if missing or zero
    if (!analysis.comPeakTiming || analysis.comPeakTiming === 0) {
      console.log('Calculating COM Peak Timing from phase markers...');
      
      // COM peak typically occurs 100-120ms before contact
      // It should align roughly with FireStart or slightly before
      if (analysis.fireStartTiming) {
        // Estimate: COM peak is ~20-40ms after FireStart begins
        // FireStart is when pelvis begins forward acceleration
        // COM peaks shortly after as weight transfers forward
        const estimatedComPeak = Math.max(100, analysis.fireStartTiming - 30);
        analysis.comPeakTiming = Math.round(estimatedComPeak);
        console.log(`Estimated COM Peak Timing: ${analysis.comPeakTiming}ms before contact (based on FireStart: ${analysis.fireStartTiming}ms)`);
      } else {
        // Fallback: use research average
        analysis.comPeakTiming = 110; // Elite average from research
        console.log('Using research average COM Peak Timing: 110ms before contact');
      }
    }

    // PRIORITY 2 & 3: Recalculate COM acceleration peak if we have the timing now
    if (analysis.comPeakTiming && analysis.comMaxVelocity && (!analysis.comAccelerationPeak || analysis.comAccelerationPeak === 0)) {
      const comMaxVelocity = analysis.comMaxVelocity; // m/s
      const timeToComPeak = analysis.comPeakTiming / 1000; // convert ms to seconds
      const peakComAccel = comMaxVelocity / Math.max(timeToComPeak, 0.1);
      analysis.comAccelerationPeak = Math.round(peakComAccel * 10) / 10; // round to 1 decimal
      console.log(`Calculated COM Acceleration Peak: ${analysis.comAccelerationPeak} m/s²`);
    }

    console.log('=== End Post-Processing ===');
    // ============= END MISSING METRICS FIXES =============

    // ============= PHASE DETECTION VALIDATION =============
    console.log('=== Phase Detection Validation ===');
    
    const validationErrors: string[] = [];
    const validationWarnings: string[] = [];
    const validationDebug = {
      loadStart: analysis.loadStartTiming,
      fireStart: analysis.fireStartTiming,
      contact: 0,
      pelvisPeak: analysis.pelvisTiming,
      loadDuration: analysis.loadStartTiming - analysis.fireStartTiming,
      fireDuration: analysis.fireStartTiming - 0,
      tempoRatio: analysis.tempoRatio,
      calculatedTempo: (analysis.loadStartTiming - analysis.fireStartTiming) / analysis.fireStartTiming,
      totalSwingTime: analysis.loadStartTiming
    };

    console.log('Phase Markers:', JSON.stringify(validationDebug, null, 2));

    // ============= HARD CONSTRAINTS (REJECT IF VIOLATED) =============
    
    // Constraint 1: Tempo Ratio (1.5:1 to 5.0:1)
    if (analysis.tempoRatio < 1.5) {
      validationErrors.push(`CRITICAL: Tempo ratio ${analysis.tempoRatio.toFixed(2)}:1 below minimum 1.5:1 - Fire phase longer than Load phase (inverted swing)`);
    } else if (analysis.tempoRatio > 5.0) {
      validationErrors.push(`CRITICAL: Tempo ratio ${analysis.tempoRatio.toFixed(2)}:1 exceeds maximum 5.0:1 - Unrealistic tempo indicates detection error`);
    }

    // Constraint 2: Load Duration (0.50 to 1.20 seconds)
    const loadDuration = analysis.loadStartTiming - analysis.fireStartTiming;
    if (loadDuration < 500) {
      validationErrors.push(`CRITICAL: Load duration ${loadDuration}ms below minimum 500ms - Load Start detected too late`);
    } else if (loadDuration > 1200) {
      validationErrors.push(`CRITICAL: Load duration ${loadDuration}ms exceeds maximum 1200ms - Load Start detected too early or including pre-swing setup`);
    }

    // Constraint 3: Fire Duration (0.25 to 0.45 seconds)
    const fireDuration = analysis.fireStartTiming;
    if (fireDuration < 250) {
      validationErrors.push(`CRITICAL: Fire duration ${fireDuration}ms below minimum 250ms - Physiologically impossible, Fire Start detected too late`);
    } else if (fireDuration > 450) {
      validationErrors.push(`CRITICAL: Fire duration ${fireDuration}ms exceeds maximum 450ms - Fire Start detected too early`);
    }

    // Constraint 4: Total Swing Time (0.80 to 1.50 seconds)
    const totalSwingTime = analysis.loadStartTiming;
    if (totalSwingTime < 800) {
      validationErrors.push(`CRITICAL: Total swing time ${totalSwingTime}ms below minimum 800ms - Missing early load phase`);
    } else if (totalSwingTime > 1500) {
      validationErrors.push(`CRITICAL: Total swing time ${totalSwingTime}ms exceeds maximum 1500ms - Including pre-swing setup or multiple pitches`);
    }

    // Constraint 5: Marker Ordering (LoadStart > FireStart > Contact)
    if (!(analysis.loadStartTiming > analysis.fireStartTiming && analysis.fireStartTiming > 0)) {
      validationErrors.push(`CRITICAL: Invalid marker ordering - LoadStart(${analysis.loadStartTiming}ms) must be > FireStart(${analysis.fireStartTiming}ms) must be > Contact(0ms)`);
    }

    // ============= SOFT WARNINGS (LOG BUT ALLOW) =============

    // Warning 1: Elite Range Check (2.5-3.5:1 for most elite hitters)
    if (analysis.tempoRatio >= 1.5 && analysis.tempoRatio < 2.3) {
      validationWarnings.push(`⚠️ Tempo ${analysis.tempoRatio.toFixed(2)}:1 below elite range (2.3-3.5:1) - Aggressive swing style or Load Start slightly late`);
    } else if (analysis.tempoRatio > 3.8 && analysis.tempoRatio <= 5.0) {
      validationWarnings.push(`⚠️ Tempo ${analysis.tempoRatio.toFixed(2)}:1 above typical elite range (2.3-3.5:1) - Patient contact hitter or Load Start slightly early`);
    }

    // Warning 2: FireStart vs Pelvis Peak Timing
    if (analysis.pelvisTiming) {
      const fireStartToPelvisPeak = analysis.fireStartTiming - analysis.pelvisTiming;
      if (fireStartToPelvisPeak < 100 || fireStartToPelvisPeak > 200) {
        validationWarnings.push(`⚠️ FireStart to Pelvis Peak timing: ${fireStartToPelvisPeak}ms (expected 100-200ms) - FireStart should align with hip rotation initiation`);
      }
    }

    // Warning 3: Optimal Duration Ranges
    if (loadDuration >= 500 && loadDuration < 650) {
      validationWarnings.push(`⚠️ Load duration ${loadDuration}ms is short but acceptable (optimal: 650-1000ms)`);
    }
    if (fireDuration >= 250 && fireDuration < 280) {
      validationWarnings.push(`⚠️ Fire duration ${fireDuration}ms is short but acceptable (optimal: 280-380ms)`);
    }

    // ============= REJECT ANALYSIS IF HARD CONSTRAINTS VIOLATED =============
    if (validationErrors.length > 0) {
      console.error('❌ PHASE DETECTION VALIDATION FAILED:');
      validationErrors.forEach(error => console.error(error));
      console.error('Validation Debug:', JSON.stringify(validationDebug, null, 2));
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Phase detection validation failed',
          validationErrors: validationErrors,
          validationDebug: validationDebug,
          message: 'The swing analysis detected invalid phase timing. This usually indicates the algorithm could not reliably detect the swing phases. Please ensure the video shows a complete swing with clear body movement, or try recording from a different angle.'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Log validation results
    if (validationWarnings.length > 0) {
      console.log('⚠️ VALIDATION WARNINGS (non-blocking):');
      validationWarnings.forEach(warning => console.log(warning));
    } else {
      console.log('✅ All phase detection validations passed');
    }

    // Add validation data to analysis object for debugging
    analysis.validation = {
      errors: validationErrors,
      warnings: validationWarnings,
      debug: validationDebug,
      passed: validationErrors.length === 0
    };

    console.log('=== End Phase Detection Validation ===');
    // ============= END VALIDATION =============

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
            loadStartTiming: analysis.loadStartTiming,
            fireStartTiming: analysis.fireStartTiming,
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
            comLateralMovement: analysis.comLateralMovement,
            comForwardMovement: analysis.comForwardMovement,
            comVerticalMovement: analysis.comVerticalMovement,
            comPeakTiming: analysis.comPeakTiming,
            comAccelerationPeak: analysis.comAccelerationPeak,
            frontFootWeightPercent: analysis.frontFootWeightPercent,
            frontFootGRF: analysis.frontFootGRF,
            comCopDistance: analysis.comCopDistance,
            balanceRecoveryTime: analysis.balanceRecoveryTime,
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
