import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TimingData {
  negativeMoveTime: number;
  maxPelvisTurnTime: number;
  maxShoulderTurnTime: number;
  maxXFactorTime: number;
}

interface ExtractedData extends TimingData {
  reportDate?: string;
  // Core biomechanics
  xFactorAngle?: number;
  xFactorMaxXFactor?: number; // The true X-Factor separation at Max X Factor
  peakPelvisRotVel?: number;
  peakShoulderRotVel?: number;
  peakArmRotVel?: number;
  attackAngle?: number;
  peakBatSpeed?: number;
  // Consistency metrics (std deviations)
  peakPelvisRotVelStdDev?: number;
  peakShoulderRotVelStdDev?: number;
  peakArmRotVelStdDev?: number;
  // MLB velocity comparisons
  mlbAvgPelvisRotVel?: number;
  mlbAvgShoulderRotVel?: number;
  mlbAvgArmRotVel?: number;
  mlbAvgBatSpeed?: number;
  // Direction/rotation at key events
  pelvisDirectionStance?: number;
  pelvisDirectionNegMove?: number;
  pelvisDirectionMaxPelvis?: number;
  pelvisDirectionImpact?: number;
  shoulderDirectionStance?: number;
  shoulderDirectionNegMove?: number;
  shoulderDirectionMaxShoulder?: number;
  shoulderDirectionImpact?: number;
  // X-Factor progression
  xFactorStance?: number;
  xFactorNegMove?: number;
  xFactorMaxPelvis?: number;
  xFactorImpact?: number;
  // MLB comparisons
  mlbAvgMaxPelvisTurn?: number;
  mlbAvgMaxShoulderTurn?: number;
  mlbAvgXFactor?: number;
  // Posture
  frontalTiltFootDown?: number;
  frontalTiltMaxHandVelo?: number;
  lateralTiltFootDown?: number;
  lateralTiltMaxHandVelo?: number;
  // COM position
  comDistNegMove?: number;
  comDistFootDown?: number;
  comDistMaxForward?: number;
  strideLengthMeters?: number;
  strideLengthPctHeight?: number;
  // COM velocity
  peakCOMVelocity?: number;
  minCOMVelocity?: number;
  comAvgAccelRate?: number;
  comAvgDecelRate?: number;
  // Power
  rotationalPower?: number;
  linearPower?: number;
  totalPower?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { filePath, extractTiming } = await req.json();

    if (!filePath) {
      throw new Error('filePath is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Download the PDF from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('swing-videos')
      .download(filePath.replace('swing-videos/', ''));

    if (downloadError) throw downloadError;

    console.log('PDF downloaded successfully, size:', fileData.size);

    // If timing extraction requested, use Lovable AI to extract from PDF
    if (extractTiming) {
      console.log('Starting timing extraction...');
      
      // Check if API key is available
      const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
      if (!lovableApiKey) {
        console.error('❌ LOVABLE_API_KEY not found in environment');
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'AI extraction not configured. Please contact support.'
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const arrayBuffer = await fileData.arrayBuffer();
      
      // Convert to base64 in chunks to avoid call stack overflow
      const bytes = new Uint8Array(arrayBuffer);
      const chunkSize = 8192;
      let binary = '';
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      const base64 = btoa(binary);
      console.log('PDF converted to base64, length:', base64.length);

      // Use Lovable AI to extract timing data AND report date from the PDF
      console.log('Calling Lovable AI API...');
      const aiResponse = await fetch('https://api.lovable.dev/v1/ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{
            role: 'user',
            content: [{
              type: 'text',
              text: `You are a data extraction specialist analyzing a Reboot Motion PDF swing report. Your job is to extract EXACT numerical values from the TABLES ONLY - never estimate from graphs.

**CRITICAL INSTRUCTIONS:**
1. Extract from TABLES ONLY, not graphs or charts
2. Use absolute values for all angular measurements (remove negative signs)
3. If a value is not in a table, omit it from the response
4. Return ONLY valid JSON with no markdown formatting
5. For bat speed or attack angle, if the value is "nan" or not available, omit it completely

**PAGE 1 - KINEMATIC SEQUENCE TABLE**

Find the "Kinematic Sequence" table with columns:
- Event
- Avg Time Before Impact (sec)
- Max Angular Velocity - Avg (deg/s)
- Max Angular Velocity - Std Dev (deg/s)
- Max Angular Velocity - MLB Avg (deg/s)

Extract these EXACT values from the table rows:

Row "Pelvis":
- peakPelvisRotVel: [Max Angular Velocity - Avg column]
- peakPelvisRotVelStdDev: [Std Dev column]
- mlbAvgPelvisRotVel: [MLB Avg column]
- maxPelvisTurnTime: [Avg Time Before Impact column, in seconds]

Row "Upper Torso" or "Torso":
- peakShoulderRotVel: [Max Angular Velocity - Avg column]
- peakShoulderRotVelStdDev: [Std Dev column]
- mlbAvgShoulderRotVel: [MLB Avg column]
- maxShoulderTurnTime: [Avg Time Before Impact column, in seconds]

Row "Arm" or "Lead Arm":
- peakArmRotVel: [Max Angular Velocity - Avg column]
- peakArmRotVelStdDev: [Std Dev column]
- mlbAvgArmRotVel: [MLB Avg column]

Row "Bat":
- peakBatSpeed: [Max Angular Velocity - Avg column] (ONLY include if valid number, NOT "nan")
- mlbAvgBatSpeed: [MLB Avg column] (ONLY include if valid number, NOT "nan")

**PAGE 2 - TORSO DIRECTIONS AND ROTATIONS TABLE**

Find table with columns: Event | Stance | Negative Move | Max Pelvis Turn | Max Shoulder Turn | Max X Factor | Impact | Avg Time Before Impact

Row "Pelvis Direction (deg)":
- pelvisDirectionStance: [Stance column, ABSOLUTE VALUE]
- pelvisDirectionNegMove: [Negative Move column, ABSOLUTE VALUE]
- pelvisDirectionMaxPelvis: [Max Pelvis Turn column, ABSOLUTE VALUE]
- pelvisDirectionImpact: [Impact column, ABSOLUTE VALUE]

Row "Shoulder Direction (deg)":
- shoulderDirectionStance: [Stance column, ABSOLUTE VALUE]
- shoulderDirectionNegMove: [Negative Move column, ABSOLUTE VALUE]
- shoulderDirectionMaxShoulder: [Max Shoulder Turn column, ABSOLUTE VALUE]
- shoulderDirectionImpact: [Impact column, ABSOLUTE VALUE]

Row "X Factor at" (degrees):
- xFactorStance: [Stance column, ABSOLUTE VALUE]
- xFactorNegMove: [Negative Move column, ABSOLUTE VALUE]
- xFactorMaxPelvis: [Max Pelvis Turn column, ABSOLUTE VALUE]
- xFactorMaxXFactor: [Max X Factor column, ABSOLUTE VALUE] - THIS IS THE TRUE X-FACTOR SEPARATION
- xFactorImpact: [Impact column, ABSOLUTE VALUE]

Row "Negative Move" in time column:
- negativeMoveTime: [Avg Time Before Impact column]

Row "Max X Factor" in time column:
- maxXFactorTime: [Avg Time Before Impact column]

**PAGE 2 - MLB AVERAGES TABLE**

Find a table or section labeled "MLB Averages" or "MLB Mean" with these values:
- mlbAvgMaxPelvisTurn: [Max Pelvis Turn value, ABSOLUTE]
- mlbAvgMaxShoulderTurn: [Max Shoulder Turn value, ABSOLUTE]
- mlbAvgXFactor: [Max X Factor or X-Factor value, ABSOLUTE]

**PAGE 3 - POSITION METRIC AVERAGES TABLE**

Find table with "Position Metric Averages" section:
- comDistNegMove: [COM Dist. - Negative Move, as percentage]
- comDistFootDown: [COM Dist. - Foot Down, as percentage]
- comDistMaxForward: [COM Dist. - Max Forward, as percentage]
- strideLengthMeters: [Stride Length in meters]
- strideLengthPctHeight: [Stride_length (% Height)]

**PAGE 3 - VELOCITY METRIC AVERAGES TABLE**

Find table with "Velocity Metric Averages" section:
- peakCOMVelocity: [Max COM Velocity in m/s]
- minCOMVelocity: [Min COM Velocity in m/s, can be negative]
- comAvgAccelRate: [COM Avg Accel Rate in m/s²]
- comAvgDecelRate: [COM Avg Decel Rate in m/s², usually negative]

**PAGE 3 - SWING POSTURE (if available)**
- frontalTiltFootDown: [Frontal Plane Tilt - Foot Down, ABSOLUTE]
- frontalTiltMaxHandVelo: [Frontal Plane Tilt - Max Hand Velo, ABSOLUTE]
- lateralTiltFootDown: [Lateral Plane Tilt - Foot Down]
- lateralTiltMaxHandVelo: [Lateral Plane Tilt - Max Hand Velo]

**BAT PATH METRICS (if available)**
- attackAngle: [Attack Angle in degrees] (ONLY include if valid number exists in table, NOT "nan")

**REPORT DATE**
Look for date in format MM/DD/YYYY in header:
- reportDate: "YYYY-MM-DD"

**RESPONSE FORMAT:**
Return ONLY this JSON structure with NO markdown code blocks:
{
  "negativeMoveTime": 0.000,
  "maxPelvisTurnTime": 0.000,
  "maxShoulderTurnTime": 0.000,
  "maxXFactorTime": 0.000,
  "xFactorMaxXFactor": 0.0,
  "peakPelvisRotVel": 0.0,
  "peakShoulderRotVel": 0.0,
  "peakArmRotVel": 0.0,
  "peakPelvisRotVelStdDev": 0.0,
  "peakShoulderRotVelStdDev": 0.0,
  "peakArmRotVelStdDev": 0.0,
  "mlbAvgPelvisRotVel": 0.0,
  "mlbAvgShoulderRotVel": 0.0,
  "mlbAvgArmRotVel": 0.0,
  "pelvisDirectionStance": 0.0,
  "pelvisDirectionNegMove": 0.0,
  "pelvisDirectionMaxPelvis": 0.0,
  "pelvisDirectionImpact": 0.0,
  "shoulderDirectionStance": 0.0,
  "shoulderDirectionNegMove": 0.0,
  "shoulderDirectionMaxShoulder": 0.0,
  "shoulderDirectionImpact": 0.0,
  "xFactorStance": 0.0,
  "xFactorNegMove": 0.0,
  "xFactorMaxPelvis": 0.0,
  "xFactorImpact": 0.0,
  "mlbAvgMaxPelvisTurn": 0.0,
  "mlbAvgMaxShoulderTurn": 0.0,
  "mlbAvgXFactor": 0.0,
  "comDistNegMove": 0.0,
  "comDistFootDown": 0.0,
  "comDistMaxForward": 0.0,
  "strideLengthMeters": 0.0,
  "strideLengthPctHeight": 0.0,
  "peakCOMVelocity": 0.0,
  "minCOMVelocity": 0.0,
  "comAvgAccelRate": 0.0,
  "comAvgDecelRate": 0.0,
  "frontalTiltFootDown": 0.0,
  "frontalTiltMaxHandVelo": 0.0,
  "lateralTiltFootDown": 0.0,
  "lateralTiltMaxHandVelo": 0.0,
  "reportDate": "2025-01-01"
}

IMPORTANT: Only include attackAngle and peakBatSpeed if they have valid numeric values in the tables. Omit them if "nan" or not present. Omit any other fields where data is not found in tables. Use 0 as placeholder in this example only.`
            }, {
              type: 'image_url',
              image_url: {
                url: `data:application/pdf;base64,${base64}`
              }
            }]
          }],
          max_tokens: 1000
        })
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('❌ AI API error response:', errorText);
        console.error('❌ AI API status:', aiResponse.status);
        
        // Return error instead of placeholder
        return new Response(
          JSON.stringify({ 
            success: false,
            error: `AI extraction failed (Status ${aiResponse.status}). Please try again or contact support.`,
            details: errorText
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const aiResult = await aiResponse.json();
      console.log('✅ AI response received, status:', aiResponse.status);
      const content = aiResult.choices[0]?.message?.content || '{}';
      console.log('📄 AI content length:', content.length);
      console.log('📄 First 500 chars:', content.substring(0, 500));
      
      // Parse extracted timing data and report date
      let extractedData: ExtractedData;
      try {
        // Try to extract JSON from markdown code blocks or plain text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        extractedData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
        console.log('✅ Successfully parsed extracted data');
        console.log('📊 Data keys found:', Object.keys(extractedData).join(', '));
        
        // Ensure we have a valid report date
        if (!extractedData.reportDate || !extractedData.reportDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          extractedData.reportDate = new Date().toISOString().split('T')[0];
          console.warn('Invalid or missing report date, using today:', extractedData.reportDate);
        }
      } catch (parseError) {
        // Return error instead of placeholder
        console.error('❌ Parse error:', parseError);
        console.error('❌ Raw content:', content);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Failed to parse PDF data. The PDF format may not be supported.',
            details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Calculate derived metrics
      const loadDuration = (extractedData.negativeMoveTime || 0) - (extractedData.maxPelvisTurnTime || 0);
      const fireDuration = extractedData.maxPelvisTurnTime || 0;
      const tempoRatio = fireDuration > 0 ? loadDuration / fireDuration : 0;
      
      const pelvisShoulderGap = (extractedData.maxShoulderTurnTime || 0) - (extractedData.maxPelvisTurnTime || 0);
      
      const weightShift = (extractedData.comDistMaxForward || 0) - (extractedData.comDistNegMove || 0);
      
      const bracingEfficiency = (extractedData.comAvgAccelRate && extractedData.comAvgDecelRate) 
        ? Math.abs(extractedData.comAvgDecelRate) / extractedData.comAvgAccelRate 
        : 0;
      
      const pelvisConsistency = (extractedData.peakPelvisRotVel && extractedData.peakPelvisRotVelStdDev)
        ? ((1 - extractedData.peakPelvisRotVelStdDev / extractedData.peakPelvisRotVel) * 100)
        : 0;
        
      const shoulderConsistency = (extractedData.peakShoulderRotVel && extractedData.peakShoulderRotVelStdDev)
        ? ((1 - extractedData.peakShoulderRotVelStdDev / extractedData.peakShoulderRotVel) * 100)
        : 0;
        
      const armConsistency = (extractedData.peakArmRotVel && extractedData.peakArmRotVelStdDev)
        ? ((1 - extractedData.peakArmRotVelStdDev / extractedData.peakArmRotVel) * 100)
        : 0;
        
      const overallConsistency = (pelvisConsistency + shoulderConsistency + armConsistency) / 3;
      
      const totalPelvisRotation = Math.abs((extractedData.pelvisDirectionStance || 0) - (extractedData.pelvisDirectionImpact || 0));
      const totalShoulderRotation = Math.abs((extractedData.shoulderDirectionStance || 0) - (extractedData.shoulderDirectionImpact || 0));

      return new Response(
        JSON.stringify({ 
          success: true,
          timing: {
            negativeMoveTime: extractedData.negativeMoveTime,
            maxPelvisTurnTime: extractedData.maxPelvisTurnTime,
            maxShoulderTurnTime: extractedData.maxShoulderTurnTime,
            maxXFactorTime: extractedData.maxXFactorTime,
            loadDuration,
            fireDuration,
            tempoRatio,
            pelvisShoulderGap
          },
          biomechanics: {
            xFactorAngle: extractedData.xFactorMaxXFactor || extractedData.xFactorAngle,
            peakPelvisRotVel: extractedData.peakPelvisRotVel,
            peakShoulderRotVel: extractedData.peakShoulderRotVel,
            peakArmRotVel: extractedData.peakArmRotVel,
            // Only include if present in PDF
            ...(extractedData.attackAngle !== undefined && extractedData.attackAngle !== null && { attackAngle: extractedData.attackAngle }),
            ...(extractedData.peakBatSpeed !== undefined && extractedData.peakBatSpeed !== null && { peakBatSpeed: extractedData.peakBatSpeed })
          },
          consistency: {
            peakPelvisRotVelStdDev: extractedData.peakPelvisRotVelStdDev,
            peakShoulderRotVelStdDev: extractedData.peakShoulderRotVelStdDev,
            peakArmRotVelStdDev: extractedData.peakArmRotVelStdDev,
            pelvisConsistency,
            shoulderConsistency,
            armConsistency,
            overallConsistency
          },
          rotation: {
            pelvisDirectionStance: extractedData.pelvisDirectionStance,
            pelvisDirectionNegMove: extractedData.pelvisDirectionNegMove,
            pelvisDirectionMaxPelvis: extractedData.pelvisDirectionMaxPelvis,
            pelvisDirectionImpact: extractedData.pelvisDirectionImpact,
            shoulderDirectionStance: extractedData.shoulderDirectionStance,
            shoulderDirectionNegMove: extractedData.shoulderDirectionNegMove,
            shoulderDirectionMaxShoulder: extractedData.shoulderDirectionMaxShoulder,
            shoulderDirectionImpact: extractedData.shoulderDirectionImpact,
            totalPelvisRotation,
            totalShoulderRotation
          },
          xFactorProgression: {
            xFactorStance: extractedData.xFactorStance,
            xFactorNegMove: extractedData.xFactorNegMove,
            xFactorMaxPelvis: extractedData.xFactorMaxPelvis,
            xFactorImpact: extractedData.xFactorImpact
          },
          mlbComparison: {
            mlbAvgPelvisRotVel: extractedData.mlbAvgPelvisRotVel,
            mlbAvgShoulderRotVel: extractedData.mlbAvgShoulderRotVel,
            mlbAvgArmRotVel: extractedData.mlbAvgArmRotVel,
            mlbAvgMaxPelvisTurn: extractedData.mlbAvgMaxPelvisTurn,
            mlbAvgMaxShoulderTurn: extractedData.mlbAvgMaxShoulderTurn,
            mlbAvgXFactor: extractedData.mlbAvgXFactor
          },
          posture: {
            frontalTiltFootDown: extractedData.frontalTiltFootDown,
            frontalTiltMaxHandVelo: extractedData.frontalTiltMaxHandVelo,
            lateralTiltFootDown: extractedData.lateralTiltFootDown,
            lateralTiltMaxHandVelo: extractedData.lateralTiltMaxHandVelo
          },
          comPosition: {
            comDistNegMove: extractedData.comDistNegMove,
            comDistFootDown: extractedData.comDistFootDown,
            comDistMaxForward: extractedData.comDistMaxForward,
            strideLengthMeters: extractedData.strideLengthMeters,
            strideLengthPctHeight: extractedData.strideLengthPctHeight,
            weightShift
          },
          comVelocity: {
            peakCOMVelocity: extractedData.peakCOMVelocity,
            minCOMVelocity: extractedData.minCOMVelocity,
            comAvgAccelRate: extractedData.comAvgAccelRate,
            comAvgDecelRate: extractedData.comAvgDecelRate,
            bracingEfficiency
          },
          power: {
            rotationalPower: extractedData.rotationalPower,
            linearPower: extractedData.linearPower,
            totalPower: extractedData.totalPower
          },
          reportDate: extractedData.reportDate,
          rawAiResponse: content
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // If extractTiming is false, return error - we only support timing extraction now
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'extractTiming must be true. Legacy metrics extraction is no longer supported.'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error parsing Reboot PDF:', error);
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
