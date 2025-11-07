# Whop Webhook Setup Guide

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────────┐
│   Whop App      │         │  Whop Webhook    │         │  Supabase Database  │
│   (Athletes)    │────────▶│  Sync Endpoint   │────────▶│  (All Data)         │
└─────────────────┘         └──────────────────┘         └─────────────────────┘
                                                                     │
                                                                     ▼
                                                          ┌─────────────────────┐
                                                          │  Coach Dashboard    │
                                                          │  (Outside Whop)     │
                                                          └─────────────────────┘
```

## Setup Steps

### 1. Configure Whop Webhook Secret

The `WHOP_WEBHOOK_SECRET` is already configured in your Supabase secrets.

### 2. Deploy Webhook Endpoint

The webhook endpoint is automatically deployed at:
```
https://goiwiofbmszghvyvhyll.supabase.co/functions/v1/whop-webhook
```

### 3. Configure Webhook in Whop Dashboard

1. Go to your Whop app dashboard
2. Navigate to **Settings** → **Webhooks**
3. Add a new webhook with:
   - **URL**: `https://goiwiofbmszghvyvhyll.supabase.co/functions/v1/whop-webhook`
   - **Secret**: Use the value from `WHOP_WEBHOOK_SECRET`
   - **Events**: Subscribe to:
     - `membership.went_valid`
     - `membership.updated`
     - `membership.went_invalid`

### 4. Database Schema Updates Needed

Run this migration to add Whop sync fields:

```sql
-- Add Whop user ID to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS whop_user_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS whop_username TEXT;

-- Add Whop membership tracking to user_memberships
ALTER TABLE user_memberships
ADD COLUMN IF NOT EXISTS whop_membership_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS whop_product_id TEXT,
ADD COLUMN IF NOT EXISTS whop_plan_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_whop_user_id ON profiles(whop_user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_whop_id ON user_memberships(whop_membership_id);
```

### 5. Product ID Mapping

Update the webhook function with your actual Whop product IDs:

```typescript
// In whop-webhook/index.ts
const productId = membership.product_id;
const planId = membership.plan_id;

if (productId === 'prod_YOUR_ELITE_ID' || planId === 'plan_YOUR_ELITE_ID') {
  tier = 'elite';
} else if (productId === 'prod_YOUR_PRO_ID' || planId === 'plan_YOUR_PRO_ID') {
  tier = 'pro';
} else if (productId === 'prod_YOUR_STARTER_ID' || planId === 'plan_YOUR_STARTER_ID') {
  tier = 'starter';
}
```

## How It Works

### Athlete Flow (Inside Whop)
1. Athlete subscribes to HITS via Whop
2. Whop sends `membership.went_valid` webhook
3. Webhook creates profile in Supabase with `whop_user_id`
4. Athlete uses app in Whop iframe
5. All swing analyses save to Supabase with their `user_id` (Whop ID)

### Coach Flow (Outside Whop)
1. Coach logs in via Supabase auth at `/coach-dashboard`
2. Coach adds athletes to roster using their email or Whop user ID
3. `team_rosters` table links coach → athlete
4. Coach dashboard queries athlete data from Supabase
5. All athlete swing data appears in coach's dashboard

## Data Sync Events

| Whop Event | Action |
|------------|--------|
| `membership.went_valid` | Create profile + activate membership |
| `membership.updated` | Update tier/plan/expiry |
| `membership.went_invalid` | Deactivate membership |

## Testing

1. **Test webhook locally**:
   ```bash
   curl -X POST https://goiwiofbmszghvyvhyll.supabase.co/functions/v1/whop-webhook \
     -H "Content-Type: application/json" \
     -H "x-whop-signature: your-secret" \
     -d '{"action":"membership.went_valid","data":{"user":{"id":"test-123","email":"test@example.com","username":"testuser"},"membership":{"id":"mem-123","product_id":"prod_starter","plan_id":"plan_starter","valid":true}}}'
   ```

2. **Verify in Supabase**:
   - Check `profiles` table for new user
   - Check `user_memberships` table for membership record

3. **Test coach access**:
   - Log in as coach at `/coach-dashboard`
   - Add test athlete to roster
   - Verify athlete's data appears

## Security Notes

- Webhook validates signature using `WHOP_WEBHOOK_SECRET`
- All athlete data secured with RLS policies
- Coaches can only access athletes in their `team_rosters`
- Whop user IDs stored separately from Supabase auth IDs

## Next Steps

1. ✅ Deploy webhook endpoint (automatic)
2. ⏳ Run database migration to add Whop fields
3. ⏳ Configure webhook in Whop dashboard
4. ⏳ Update product ID mappings in webhook function
5. ⏳ Test end-to-end flow
