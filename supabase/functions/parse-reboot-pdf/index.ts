import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as pdfjs from "https://esm.sh/pdfjs-dist@3.11.174/build/pdf.mjs";

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
  xFactorAngle?: number;
  xFactorMaxXFactor?: number;
  peakPelvisRotVel?: number;
  peakShoulderRotVel?: number;
  peakArmRotVel?: number;
  attackAngle?: number;
  peakBatSpeed?: number;
  peakPelvisRotVelStdDev?: number;
  peakShoulderRotVelStdDev?: number;
  peakArmRotVelStdDev?: number;
  mlbAvgPelvisRotVel?: number;
  mlbAvgShoulderRotVel?: number;
  mlbAvgArmRotVel?: number;
  mlbAvgBatSpeed?: number;
  pelvisDirectionStance?: number;
  pelvisDirectionNegMove?: number;
  pelvisDirectionMaxPelvis?: number;
  pelvisDirectionImpact?: number;
  shoulderDirectionStance?: number;
  shoulderDirectionNegMove?: number;
  shoulderDirectionMaxShoulder?: number;
  shoulderDirectionImpact?: number;
  xFactorStance?: number;
  xFactorNegMove?: number;
  xFactorMaxPelvis?: number;
  xFactorImpact?: number;
  mlbAvgMaxPelvisTurn?: number;
  mlbAvgMaxShoulderTurn?: number;
  mlbAvgXFactor?: number;
  frontalTiltFootDown?: number;
  frontalTiltMaxHandVelo?: number;
  lateralTiltFootDown?: number;
  lateralTiltMaxHandVelo?: number;
  comDistNegMove?: number;
  comDistFootDown?: number;
  comDistMaxForward?: number;
  strideLengthMeters?: number;
  strideLengthPctHeight?: number;
  peakCOMVelocity?: number;
  minCOMVelocity?: number;
  comAvgAccelRate?: number;
  comAvgDecelRate?: number;
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

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('swing-videos')
      .download(filePath.replace('swing-videos/', ''));

    if (downloadError) throw downloadError;

    console.log('PDF downloaded successfully, size:', fileData.size);

    if (extractTiming) {
      console.log('Starting timing extraction...');
      
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

      // Extract text from PDF using pdfjs
      console.log('Extracting text from PDF...');
      const arrayBuffer = await fileData.arrayBuffer();
      
      let pdfText = '';
      try {
        // Load PDF document
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        console.log(`✅ PDF loaded, ${pdf.numPages} pages`);
        
        // Extract text from all pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          pdfText += pageText + '\n';
        }
        
        console.log('✅ PDF text extracted, length:', pdfText.length);
        console.log('📄 First 500 chars:', pdfText.substring(0, 500));
      } catch (pdfError) {
        console.error('❌ PDF parsing error:', pdfError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Failed to extract text from PDF. The file may be corrupted or unsupported.',
            details: pdfError instanceof Error ? pdfError.message : 'PDF parsing failed'
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Use Lovable AI to extract structured data from the text
      console.log('Calling Lovable AI API...');
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{
            role: 'user',
            content: `You are a data extraction specialist analyzing Reboot Motion swing report text. Extract EXACT numerical values from TABLES ONLY.

**TEXT FROM PDF:**
${pdfText}

**INSTRUCTIONS:**
1. Extract from TABLES ONLY, not graphs
2. Use absolute values for angular measurements (remove negative signs)
3. Return ONLY valid JSON with no markdown
4. Omit fields if value is "nan" or not in tables

**EXTRACT:**
- negativeMoveTime, maxPelvisTurnTime, maxShoulderTurnTime, maxXFactorTime (seconds)
- peakPelvisRotVel, peakShoulderRotVel, peakArmRotVel (deg/s) + StdDev + MLB Avg
- pelvisDirection/shoulderDirection at: Stance, NegMove, MaxPelvis/MaxShoulder, Impact (degrees, absolute)
- xFactor at: Stance, NegMove, MaxPelvis, MaxXFactor, Impact (degrees, absolute)
- MLB averages: MaxPelvisTurn, MaxShoulderTurn, XFactor (degrees, absolute)
- COM: DistNegMove, DistFootDown, DistMaxForward (%), strideLengthMeters, strideLengthPctHeight
- COM velocity: peak, min (m/s), avgAccelRate, avgDecelRate (m/s²)
- Posture: frontalTilt/lateralTilt at FootDown/MaxHandVelo (degrees)
- attackAngle, peakBatSpeed (only if valid numbers, not "nan")
- reportDate: "YYYY-MM-DD" from header

**RESPONSE FORMAT:**
{"negativeMoveTime":0.0,"maxPelvisTurnTime":0.0,"maxShoulderTurnTime":0.0,"maxXFactorTime":0.0,"xFactorMaxXFactor":0.0,"peakPelvisRotVel":0.0,"peakShoulderRotVel":0.0,"peakArmRotVel":0.0,"peakPelvisRotVelStdDev":0.0,"peakShoulderRotVelStdDev":0.0,"peakArmRotVelStdDev":0.0,"mlbAvgPelvisRotVel":0.0,"mlbAvgShoulderRotVel":0.0,"mlbAvgArmRotVel":0.0,"pelvisDirectionStance":0.0,"pelvisDirectionNegMove":0.0,"pelvisDirectionMaxPelvis":0.0,"pelvisDirectionImpact":0.0,"shoulderDirectionStance":0.0,"shoulderDirectionNegMove":0.0,"shoulderDirectionMaxShoulder":0.0,"shoulderDirectionImpact":0.0,"xFactorStance":0.0,"xFactorNegMove":0.0,"xFactorMaxPelvis":0.0,"xFactorImpact":0.0,"mlbAvgMaxPelvisTurn":0.0,"mlbAvgMaxShoulderTurn":0.0,"mlbAvgXFactor":0.0,"comDistNegMove":0.0,"comDistFootDown":0.0,"comDistMaxForward":0.0,"strideLengthMeters":0.0,"strideLengthPctHeight":0.0,"peakCOMVelocity":0.0,"minCOMVelocity":0.0,"comAvgAccelRate":0.0,"comAvgDecelRate":0.0,"frontalTiltFootDown":0.0,"frontalTiltMaxHandVelo":0.0,"lateralTiltFootDown":0.0,"lateralTiltMaxHandVelo":0.0,"reportDate":"2025-01-01"}`
          }],
          max_tokens: 2000
        })
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('❌ AI API error:', aiResponse.status, errorText);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: `AI extraction failed (Status ${aiResponse.status}).`,
            details: errorText
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const aiResult = await aiResponse.json();
      console.log('✅ AI response received');
      const content = aiResult.choices[0]?.message?.content || '{}';
      console.log('📄 AI content:', content.substring(0, 500));
      
      let extractedData: ExtractedData;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        extractedData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
        console.log('✅ Parsed data keys:', Object.keys(extractedData).join(', '));
        
        if (!extractedData.reportDate || !extractedData.reportDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          extractedData.reportDate = new Date().toISOString().split('T')[0];
        }
      } catch (parseError) {
        console.error('❌ Parse error:', parseError);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: 'Failed to parse AI response.',
            details: parseError instanceof Error ? parseError.message : 'Parse error'
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
        ? Math.abs(extractedData.comAvgDecelRate) / extractedData.comAvgAccelRate : 0;
      const pelvisConsistency = (extractedData.peakPelvisRotVel && extractedData.peakPelvisRotVelStdDev)
        ? ((1 - extractedData.peakPelvisRotVelStdDev / extractedData.peakPelvisRotVel) * 100) : 0;
      const shoulderConsistency = (extractedData.peakShoulderRotVel && extractedData.peakShoulderRotVelStdDev)
        ? ((1 - extractedData.peakShoulderRotVelStdDev / extractedData.peakShoulderRotVel) * 100) : 0;
      const armConsistency = (extractedData.peakArmRotVel && extractedData.peakArmRotVelStdDev)
        ? ((1 - extractedData.peakArmRotVelStdDev / extractedData.peakArmRotVel) * 100) : 0;
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

    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'extractTiming must be true.'
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
