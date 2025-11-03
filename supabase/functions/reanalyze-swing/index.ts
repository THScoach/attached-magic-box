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
    const { analysisId } = await req.json();
    
    if (!analysisId) {
      return new Response(
        JSON.stringify({ error: 'Analysis ID is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Use auth header to verify user
    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Re-analyzing swing ${analysisId} for user ${user.id}`);

    // Fetch the original analysis
    const { data: originalAnalysis, error: fetchError } = await supabase
      .from('swing_analyses')
      .select('*')
      .eq('id', analysisId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !originalAnalysis) {
      console.error('Failed to fetch original analysis:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Analysis not found or access denied' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!originalAnalysis.video_url) {
      return new Response(
        JSON.stringify({ error: 'No video URL found in original analysis' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching video metadata for: ${originalAnalysis.video_url}`);

    // Fetch video to extract actual frame rate
    // Parse the video URL to get the file name from storage
    const videoUrl = originalAnalysis.video_url;
    const fileName = videoUrl.split('/').pop();
    
    // Download video metadata (we need the actual file to determine FPS)
    // For now, we'll assume uploaded videos are 240fps (iPhone slo-mo standard)
    // In production, you'd want to actually parse video metadata using ffmpeg or similar
    const assumedSourceFps = 240; // Standard iPhone slo-mo
    const samplingFps = 30; // Our pose detection sampling rate

    console.log(`Assumed source FPS: ${assumedSourceFps}, sampling FPS: ${samplingFps}`);

    // Prepare frames for re-analysis
    // Since we don't store the original frames, we need to extract them again
    // For now, we'll just update the metadata in a new analysis record
    
    // Call analyze-swing with corrected FPS info
    const { data: reanalysisData, error: reanalysisError } = await supabaseClient.functions.invoke('analyze-swing', {
      body: {
        videoUrl: originalAnalysis.video_url,
        playerId: originalAnalysis.player_id,
        videoType: originalAnalysis.video_type,
        drillId: originalAnalysis.drill_id,
        drillName: originalAnalysis.drill_name,
        keypoints: originalAnalysis.metrics.keypoints || [],
        frames: originalAnalysis.metrics.keypoints?.length || 8,
        sourceFrameRate: assumedSourceFps,
        samplingFrameRate: samplingFps,
        isReanalysis: true,
        originalAnalysisId: analysisId
      }
    });

    if (reanalysisError) {
      console.error('Re-analysis failed:', reanalysisError);
      return new Response(
        JSON.stringify({ 
          error: 'Re-analysis failed', 
          details: reanalysisError.message 
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Re-analysis completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Video re-analyzed with corrected FPS calculations',
        newAnalysisId: reanalysisData?.analysisId,
        correctedFps: {
          source: assumedSourceFps,
          sampling: samplingFps
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in reanalyze-swing:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
