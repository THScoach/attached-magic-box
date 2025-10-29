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
    const { messages, analysisData, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch knowledge base from Supabase
    let knowledgeContext = "";
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      try {
        const knowledgeResponse = await fetch(`${SUPABASE_URL}/rest/v1/knowledge_base?select=*`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
        });
        
        if (knowledgeResponse.ok) {
          const knowledgeData = await knowledgeResponse.json();
          knowledgeContext = "\n\nCoaching Knowledge Base:\n" + 
            knowledgeData.map((item: any) => 
              `[${item.category}] ${item.title}: ${item.content}`
            ).join("\n");
        }
      } catch (e) {
        console.error("Failed to fetch knowledge base:", e);
      }
    }

    // Build system prompt based on mode
    let systemPrompt = '';
    
    if (context?.mode === 'drill_feedback') {
      systemPrompt = `You are Coach Rick, gathering feedback after a training drill. Your goal is to:
1. Ask the player how the drill felt (e.g., "How did that drill feel for you?")
2. Follow up with 2-3 specific questions about their experience:
   - Did any particular part of the movement feel different?
   - What was challenging about the drill?
   - Did you notice any changes in your timing or rhythm?
3. Be conversational, encouraging, and empathetic
4. After getting good feedback (3-4 exchanges), wrap up naturally with encouragement like "Great feedback! Keep up the good work. See you next time!"
5. Keep responses SHORT (2-3 sentences max)

Keep the conversation focused and natural. Don't ask more than 3-4 questions total.`;
    } else {
      systemPrompt = `You are Coach Rick, an experienced baseball hitting coach with 20+ years of experience. You analyze swing mechanics using the H.I.T.S. Score methodology which evaluates three pillars:

1. ANCHOR - Stability & Ground Force: How well the athlete maintains balance and generates power from the ground
2. ENGINE - Tempo & Sequence: The timing and sequencing of body movements during the swing
3. WHIP - Release & Acceleration: The speed and efficiency of bat acceleration through the zone

You are supportive, knowledgeable, and provide actionable feedback. Keep your responses conversational and encouraging while being technically accurate.${knowledgeContext}`;
    }

    if (analysisData && !context?.mode) {
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
        stream: context?.mode === 'drill_feedback' ? false : true,
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

    // For drill feedback, return JSON instead of streaming
    if (context?.mode === 'drill_feedback') {
      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || '';
      return new Response(
        JSON.stringify({ response: reply }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
