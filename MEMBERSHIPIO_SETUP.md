# Membership.io Integration Setup

## What's Been Created

1. **Webhook Endpoint**: `https://goiwiofbmszghvyvhyll.supabase.co/functions/v1/membershipio-webhook`
2. **Database Column**: `user_memberships.membershipio_id` for tracking Membership.io subscription IDs
3. **Automatic Tier Syncing**: Webhooks will sync membership status to HITS automatically

## Setup Steps (Do This TODAY)

### Step 1: Get Webhook URL
Your webhook URL is:
```
https://goiwiofbmszghvyvhyll.supabase.co/functions/v1/membershipio-webhook
```

### Step 2: Configure in Membership.io
1. Go to your Membership.io dashboard
2. Navigate to Settings → Webhooks (or Account Settings)
3. Create a new webhook with the URL above
4. Select these events:
   - `member.subscribed` (when someone subscribes)
   - `member.unsubscribed` (when someone cancels)
   - `subscription.created`
   - `subscription.cancelled`
   - `subscription.updated`

5. Copy the webhook signing secret they provide

### Step 3: Add Webhook Secret to Lovable
I'll prepare to add the webhook secret now. This will encrypt it securely.

### Step 4: Map Your Membership.io Plan Names to HITS Tiers

**IMPORTANT**: Open `supabase/functions/membershipio-webhook/index.ts` and update the `mapPlanToTier()` function to match YOUR actual Membership.io plan names.

Current mapping (you need to update this):
```typescript
function mapPlanToTier(planName: string): string {
  const plan = planName.toLowerCase();
  
  // UPDATE THESE to match your actual Membership.io plan names
  if (plan.includes('elite') || plan.includes('premium')) {
    return 'elite';
  } else if (plan.includes('diy') || plan.includes('pro')) {
    return 'diy';
  } else if (plan.includes('challenge') || plan.includes('basic')) {
    return 'challenge';
  }
  
  return 'free';
}
```

### Step 5: Test the Integration
1. Create a test subscription in Membership.io
2. Check the webhook logs in Membership.io dashboard
3. Verify the user's tier updates in HITS

## How It Works

### User Flow
1. User signs up in HITS (creates account with email)
2. User goes to Membership.io and subscribes (using same email)
3. Membership.io sends webhook → HITS
4. HITS finds user by email and updates their tier
5. User now has access to tier-specific features in HITS

### Webhook Events Handled
- **member.subscribed**: Activates membership, sets tier
- **member.unsubscribed**: Reverts to free tier
- **subscription.updated**: Updates tier if plan changes

## Next Steps (After Today's Setup)

1. **Content Integration**: Embed Membership.io content via iframes in HITS
2. **Coach Rick AI**: Use your Four Bs content as knowledge base for AI responses
3. **Single Sign-On**: Auto-authenticate users between HITS and Membership.io

## Removing Whop

Once Membership.io is working and you've migrated your users:
1. We'll remove the Whop webhook function
2. Remove Whop-specific code from tier access logic
3. Clean up any Whop references

## Questions?
- What are your exact Membership.io plan names? (So I can update the mapping)
- Do you want to keep Whop running alongside for now, or switch completely?
