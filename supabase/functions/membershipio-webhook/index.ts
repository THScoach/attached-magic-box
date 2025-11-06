import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Membership.io webhook received");
    
    const webhookSecret = Deno.env.get('MEMBERSHIPIO_WEBHOOK_SECRET');
    const payload = await req.json();
    
    console.log("Webhook payload:", JSON.stringify(payload, null, 2));

    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      const signature = req.headers.get('x-membershipio-signature');
      if (!signature) {
        console.error("Missing webhook signature");
        return new Response(JSON.stringify({ error: 'Missing signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      // TODO: Implement signature verification once Membership.io provides signature method
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle different webhook event types
    const eventType = payload.event || payload.type;
    console.log("Event type:", eventType);

    switch (eventType) {
      case 'member.subscribed':
      case 'subscription.created':
        await handleMembershipActivated(supabase, payload);
        break;
      
      case 'member.unsubscribed':
      case 'subscription.cancelled':
        await handleMembershipDeactivated(supabase, payload);
        break;
      
      case 'member.updated':
      case 'subscription.updated':
        await handleMembershipUpdated(supabase, payload);
        break;
      
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleMembershipActivated(supabase: any, payload: any) {
  console.log("Handling membership activation");
  
  const email = payload.member?.email || payload.user?.email || payload.email;
  const membershipId = payload.membership?.id || payload.subscription?.id;
  const planName = payload.membership?.plan || payload.subscription?.plan || payload.plan;
  
  if (!email) {
    console.error("No email in webhook payload");
    return;
  }

  // Find user by email
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .single();

  if (!profile) {
    console.log(`No profile found for email: ${email}`);
    return;
  }

  // Map Membership.io plan to HITS tier
  const tier = mapPlanToTier(planName);
  
  // Upsert membership
  const { error } = await supabase
    .from('user_memberships')
    .upsert({
      user_id: profile.id,
      tier: tier,
      status: 'active',
      membershipio_id: membershipId,
      expires_at: null, // Membership.io handles expiry
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error("Error upserting membership:", error);
  } else {
    console.log(`Activated ${tier} membership for user ${profile.id}`);
  }
}

async function handleMembershipDeactivated(supabase: any, payload: any) {
  console.log("Handling membership deactivation");
  
  const email = payload.member?.email || payload.user?.email || payload.email;
  
  if (!email) {
    console.error("No email in webhook payload");
    return;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (!profile) {
    console.log(`No profile found for email: ${email}`);
    return;
  }

  // Set to free tier
  const { error } = await supabase
    .from('user_memberships')
    .update({
      tier: 'free',
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', profile.id);

  if (error) {
    console.error("Error deactivating membership:", error);
  } else {
    console.log(`Deactivated membership for user ${profile.id}`);
  }
}

async function handleMembershipUpdated(supabase: any, payload: any) {
  console.log("Handling membership update");
  
  const email = payload.member?.email || payload.user?.email || payload.email;
  const planName = payload.membership?.plan || payload.subscription?.plan || payload.plan;
  
  if (!email) {
    console.error("No email in webhook payload");
    return;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (!profile) {
    console.log(`No profile found for email: ${email}`);
    return;
  }

  const tier = mapPlanToTier(planName);
  
  const { error } = await supabase
    .from('user_memberships')
    .update({
      tier: tier,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', profile.id);

  if (error) {
    console.error("Error updating membership:", error);
  } else {
    console.log(`Updated membership to ${tier} for user ${profile.id}`);
  }
}

function mapPlanToTier(planName: string): string {
  if (!planName) return 'free';
  
  const plan = planName.toLowerCase();
  
  // Map your Membership.io plan names to HITS tiers
  // UPDATE THESE based on your actual Membership.io plan names
  if (plan.includes('elite') || plan.includes('premium')) {
    return 'elite';
  } else if (plan.includes('diy') || plan.includes('pro')) {
    return 'diy';
  } else if (plan.includes('challenge') || plan.includes('basic')) {
    return 'challenge';
  }
  
  return 'free';
}
