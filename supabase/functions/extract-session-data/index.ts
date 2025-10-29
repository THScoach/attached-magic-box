import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { imageUrl, dataSource } = await req.json();
    
    console.log('Extracting data from screenshot:', { imageUrl, dataSource });

    // Use Lovable AI to extract metrics from the screenshot
    const aiResponse = await fetch('https://api.lovable.app/v1/ai/chat-completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: `You are a sports analytics data extractor. Extract ALL visible metrics from ${dataSource} session screenshots and return them as structured JSON. Include: exit velocity, launch angle, distance, bat speed, attack angle, peak hand speed, time to contact, on-plane efficiency, connection at impact, rotation, power, bat vertical angle, swing length, plane score, and any other metrics visible in the image. Return ONLY valid JSON with no markdown formatting.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract all metrics from this ${dataSource} session screenshot. Return as JSON with metric names as keys and values with units.`
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_completion_tokens: 2000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', errorText);
      throw new Error(`AI extraction failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const extractedText = aiData.choices[0].message.content;
    
    console.log('AI extracted text:', extractedText);
    
    // Parse the JSON response, removing any markdown formatting
    let extractedMetrics;
    try {
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedMetrics = JSON.parse(jsonMatch[0]);
      } else {
        extractedMetrics = JSON.parse(extractedText);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', extractedText);
      throw new Error('Failed to parse extracted metrics');
    }

    console.log('Successfully extracted metrics:', extractedMetrics);

    return new Response(
      JSON.stringify({ 
        success: true, 
        metrics: extractedMetrics 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in extract-session-data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
