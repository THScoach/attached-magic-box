import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, analysisData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt with analysis context if available
    let systemPrompt = `You are Coach Rick, an experienced baseball hitting coach with 20+ years of experience. You analyze swing mechanics using the H.I.T.S. Score methodology which evaluates three pillars:

1. ANCHOR - Stability & Ground Force: How well the athlete maintains balance and generates power from the ground
2. ENGINE - Tempo & Sequence: The timing and sequencing of body movements during the swing
3. WHIP - Release & Acceleration: The speed and efficiency of bat acceleration through the zone

You are supportive, knowledgeable, and provide actionable feedback. Keep your responses conversational and encouraging while being technically accurate.`;

    if (analysisData) {
      systemPrompt += `\n\nThe athlete's current swing analysis shows:
- Overall H.I.T.S. Score: ${analysisData.hitsScore}/100
- ANCHOR Score: ${analysisData.anchorScore}/100
- ENGINE Score: ${analysisData.engineScore}/100
- WHIP Score: ${analysisData.whipScore}/100
- Tempo Ratio: ${analysisData.tempoRatio}:1
- Primary Opportunity: ${analysisData.primaryOpportunity}
- Impact: ${analysisData.impactStatement}

Use this analysis to provide specific, personalized coaching advice.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("coach-rick-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
