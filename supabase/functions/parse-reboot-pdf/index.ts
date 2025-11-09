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

      // For now, use the comprehensive prompt approach with simpler model  
      // that doesn't require PDF parsing
      console.log('Preparing data extraction request...');
      // Return graceful error since PDF vision isn't available yet
      console.error('❌ PDF extraction not yet available');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'PDF auto-extraction is temporarily unavailable. Please manually enter your Reboot data or contact support for assistance.',
          details: 'The AI extraction feature requires additional configuration.'
        }),
        { 
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

      /*
      // NOTE: PDF vision extraction is disabled until proper API is available
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

IMPORTANT: Only include attackAngle and peakBatSpeed if they have valid numeric values in the tables. Omit them if "nan" or not present. Omit any other fields where data is not found in tables. Use 0 as placeholder in this example only.
      */
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
