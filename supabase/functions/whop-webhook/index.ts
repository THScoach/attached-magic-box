import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('x-whop-signature');
    const webhookSecret = Deno.env.get('WHOP_WEBHOOK_SECRET');

    if (!webhookSecret) {
      console.error('WHOP_WEBHOOK_SECRET not configured');
      return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify webhook signature
    const body = await req.text();
    
    // Simple signature verification (you may need to adjust based on Whop's actual signature method)
    // This is a placeholder - check Whop's documentation for exact signature verification
    if (signature !== webhookSecret) {
      console.error('Invalid webhook signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = JSON.parse(body);
    console.log('Webhook received:', payload);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different webhook events
    const eventType = payload.action;

    switch (eventType) {
      case 'membership_activated':
        await handleMembershipActivated(supabase, payload);
        break;
      case 'membership_deactivated':
        await handleMembershipDeactivated(supabase, payload);
        break;
      case 'payment_succeeded':
        await handlePaymentSucceeded(supabase, payload);
        break;
      default:
        console.log('Unhandled event type:', eventType);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleMembershipActivated(supabase: any, payload: any) {
  const { user_id, membership_id, plan_id } = payload.data;
  const tier = mapPlanToTier(plan_id);

  // Calculate expiration for challenge tier (7 days)
  const expiresAt = tier === 'challenge' 
    ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { error } = await supabase
    .from('user_memberships')
    .upsert({
      user_id: user_id, // You'll need to map this to your auth.users.id
      tier,
      status: 'active',
      whop_membership_id: membership_id,
      whop_user_id: user_id,
      expires_at: expiresAt,
      started_at: new Date().toISOString(),
      swing_count: 0, // Reset swing count on activation
    });

  if (error) {
    console.error('Error activating membership:', error);
  }
}

async function handleMembershipDeactivated(supabase: any, payload: any) {
  const { membership_id, user_id } = payload.data;

  // Get the current membership to check if it's challenge tier
  const { data: membership } = await supabase
    .from('user_memberships')
    .select('tier')
    .eq('whop_membership_id', membership_id)
    .single();

  if (membership?.tier === 'challenge') {
    // Challenge expired - revert to free tier
    const { error } = await supabase
      .from('user_memberships')
      .update({ 
        tier: 'free',
        status: 'active',
        cancelled_at: new Date().toISOString(),
        swing_count: 0 // Reset to 0 swings for free tier
      })
      .eq('whop_membership_id', membership_id);

    if (error) {
      console.error('Error reverting challenge to free:', error);
    }
  } else {
    // Other tiers just cancel
    const { error } = await supabase
      .from('user_memberships')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('whop_membership_id', membership_id);

    if (error) {
      console.error('Error deactivating membership:', error);
    }
  }
}

async function handlePaymentSucceeded(supabase: any, payload: any) {
  console.log('Payment succeeded:', payload.data);
  // Add any payment tracking logic here
}

function mapPlanToTier(planId: string): string {
  // Map your Whop plan IDs to your membership tiers
  // Update these IDs with your actual Whop plan IDs
  const planMapping: Record<string, string> = {
    'prod_Wkwv5hjyghOXC': 'free',      // Free (2 swings)
    'prod_7day_challenge': 'challenge',  // 7-Day Challenge
    'prod_kNyobCww4tc2p': 'diy',       // DIY Platform
    'elite_plan_id': 'elite',          // Elite Transformation
  };

  return planMapping[planId] || 'free';
}
