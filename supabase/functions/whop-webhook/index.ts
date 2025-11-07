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
      console.error('[Whop] WHOP_WEBHOOK_SECRET not configured');
      return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.text();
    const payload = JSON.parse(body);
    
    console.log('[Whop] Webhook received:', payload.action || payload.type);
    
    // Verify webhook signature (simple check - adjust based on Whop's docs)
    if (signature && signature !== webhookSecret) {
      console.error('[Whop] Invalid webhook signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different webhook events
    const eventType = payload.action || payload.type;

    switch (eventType) {
      // V5+ format (with app_ prefix)
      case 'app_membership_went_valid':
      // V6+ format (without app_ prefix)
      case 'membership.went_valid':
      case 'membership_went_valid':
      case 'membership_activated':
        await handleMembershipActivated(supabase, payload);
        break;
        
      // V5+ format (with app_ prefix)
      case 'app_membership_went_invalid':
      // V6+ format (without app_ prefix)
      case 'membership.went_invalid':
      case 'membership_went_invalid':
      case 'membership_deactivated':
        await handleMembershipDeactivated(supabase, payload);
        break;
        
      case 'app_payment_succeeded':
      case 'payment.succeeded':
      case 'payment_succeeded':
        await handlePaymentSucceeded(supabase, payload);
        break;
        
      case 'app_payment_failed':
      case 'payment.failed':
      case 'payment_failed':
        await handlePaymentFailed(supabase, payload);
        break;
        
      default:
        console.log('[Whop] Unhandled event type:', eventType);
    }

    return new Response(JSON.stringify({ success: true, received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Whop] Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleMembershipActivated(supabase: any, payload: any) {
  const data = payload.data || payload;
  const { user, product } = data;
  
  const whopUserId = user?.id || data.user_id;
  const whopEmail = user?.email || data.email;
  const whopUsername = user?.username || data.username;
  const productId = product?.id || data.product_id || data.plan_id;
  const membershipId = data.membership?.id || data.membership_id;
  const validUntil = data.membership?.valid_until || data.valid_until;
  
  console.log('[Whop] Activating membership:', { whopUserId, whopEmail, productId, membershipId });
  
  if (!whopUserId && !whopEmail) {
    console.error('[Whop] No user identifier found in payload');
    return;
  }

  // Map product ID to tier
  const tier = mapPlanToTier(productId);
  console.log('[Whop] Mapped product', productId, 'to tier:', tier);

  // Find or create user profile
  let userId: string;
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .or(`email.eq.${whopEmail},whop_user_id.eq.${whopUserId}`)
    .limit(1);

  if (!profiles || profiles.length === 0) {
    // Create new profile for Whop user
    console.log('[Whop] Creating new profile for:', whopEmail);
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        email: whopEmail,
        whop_user_id: whopUserId,
        whop_username: whopUsername,
        first_name: whopUsername || '',
        last_name: '',
      })
      .select('id')
      .single();
    
    if (profileError || !newProfile) {
      console.error('[Whop] Error creating profile:', profileError);
      return;
    }
    
    userId = newProfile.id;
    console.log('[Whop] Created profile with ID:', userId);
  } else {
    userId = profiles[0].id;
  }
  
  // Update profile with whop_user_id if not set
  await supabase
    .from('profiles')
    .update({ whop_user_id: whopUserId })
    .eq('id', userId);

  // Calculate expiration for challenge tier (7 days)
  const expiresAt = tier === 'challenge' 
    ? new Date(validUntil || Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    : null;

  // Upsert membership
  const { error } = await supabase
    .from('user_memberships')
    .upsert({
      user_id: userId,
      tier,
      status: 'active',
      whop_membership_id: membershipId,
      whop_user_id: whopUserId,
      expires_at: expiresAt,
      started_at: new Date().toISOString(),
      swing_count: 0, // Reset swing count on activation
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error('[Whop] Error activating membership:', error);
  } else {
    console.log('[Whop] Successfully activated', tier, 'tier for user', userId);
  }
}

async function handleMembershipDeactivated(supabase: any, payload: any) {
  const data = payload.data || payload;
  const membershipId = data.membership?.id || data.membership_id;
  const whopUserId = data.user?.id || data.user_id;

  console.log('[Whop] Deactivating membership:', { membershipId, whopUserId });

  // Get the current membership
  const { data: membership } = await supabase
    .from('user_memberships')
    .select('tier, user_id')
    .or(`whop_membership_id.eq.${membershipId},whop_user_id.eq.${whopUserId}`)
    .single();

  if (!membership) {
    console.error('[Whop] Membership not found:', membershipId);
    return;
  }

  if (membership.tier === 'challenge') {
    // Challenge expired - revert to free tier
    const { error } = await supabase
      .from('user_memberships')
      .update({ 
        tier: 'free',
        status: 'active',
        cancelled_at: new Date().toISOString(),
        swing_count: 0, // Reset to 0 swings for free tier
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', membership.user_id);

    if (error) {
      console.error('[Whop] Error reverting challenge to free:', error);
    } else {
      console.log('[Whop] Challenge expired, reverted to free tier for user', membership.user_id);
    }
  } else {
    // Other tiers - cancel but keep tier (allow grace period)
    const { error } = await supabase
      .from('user_memberships')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', membership.user_id);

    if (error) {
      console.error('[Whop] Error cancelling membership:', error);
    } else {
      console.log('[Whop] Cancelled membership for user', membership.user_id);
    }
  }
}

async function handlePaymentSucceeded(supabase: any, payload: any) {
  const data = payload.data || payload;
  const amount = data.amount || data.total;
  const userId = data.user?.id || data.user_id;
  
  console.log('[Whop] Payment succeeded for user', userId, '- Amount:', amount);
  
  // You can add payment tracking logic here if needed
  // For now, just log it
}

async function handlePaymentFailed(supabase: any, payload: any) {
  const data = payload.data || payload;
  const userId = data.user?.id || data.user_id;
  
  console.log('[Whop] Payment failed for user', userId);
  
  // You can add payment failure handling here
  // e.g., send notification email, update status, etc.
}

function mapPlanToTier(planId: string): string {
  // Map your Whop product IDs to membership tiers
  // Real product IDs from Whop dashboard
  const planMapping: Record<string, string> = {
    // Challenge (7-Day) - Real product ID
    '297-b6': 'challenge',
    'prod_challenge': 'challenge',
    'prod_7day': 'challenge',
    
    // DIY Platform - Real product ID
    'diy-annual': 'diy',
    'prod_diy': 'diy',
    'prod_diy_annual': 'diy',
    
    // Elite Transformation - Real product ID
    'elite-90-day-transformation': 'elite',
    'prod_elite': 'elite',
    'prod_elite_annual': 'elite',
    
    // Free tier - Real product ID
    'hits-free': 'free',
    
    // Legacy IDs (keep for backwards compatibility)
    'prod_WfvSV2wW8AwTc': 'challenge',
    'prod_kNyobCww4tc2p': 'diy',
    'prod_SqdIUcKJXwmuB': 'elite',
  };

  const tier = planMapping[planId] || 'free';
  
  if (tier === 'free' && planId) {
    console.warn('[Whop] Unknown product ID:', planId, '- defaulting to free tier');
    console.warn('[Whop] Update planMapping in whop-webhook to include this product ID');
  }
  
  return tier;
}
