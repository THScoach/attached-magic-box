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

  // Map Whop user to your system (you may need to adjust this logic)
  const { error } = await supabase
    .from('user_memberships')
    .upsert({
      user_id: user_id, // You'll need to map this to your auth.users.id
      tier: mapPlanToTier(plan_id),
      status: 'active',
      external_id: membership_id,
    });

  if (error) {
    console.error('Error activating membership:', error);
  }
}

async function handleMembershipDeactivated(supabase: any, payload: any) {
  const { membership_id } = payload.data;

  const { error } = await supabase
    .from('user_memberships')
    .update({ status: 'cancelled' })
    .eq('external_id', membership_id);

  if (error) {
    console.error('Error deactivating membership:', error);
  }
}

async function handlePaymentSucceeded(supabase: any, payload: any) {
  console.log('Payment succeeded:', payload.data);
  // Add any payment tracking logic here
}

function mapPlanToTier(planId: string): string {
  // Map your Whop plan IDs to your membership tiers
  // You'll need to update this based on your actual plan IDs
  const planMapping: Record<string, string> = {
    'basic_plan_id': 'free',
    'standard_plan_id': 'basic',
    'pro_plan_id': 'pro',
  };

  return planMapping[planId] || 'free';
}
