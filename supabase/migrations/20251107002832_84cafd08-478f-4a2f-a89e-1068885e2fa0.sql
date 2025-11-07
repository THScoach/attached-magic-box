-- Add Whop user tracking fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS whop_user_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS whop_username TEXT;

-- Add Whop membership tracking fields to user_memberships
ALTER TABLE user_memberships
ADD COLUMN IF NOT EXISTS whop_membership_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS whop_product_id TEXT,
ADD COLUMN IF NOT EXISTS whop_plan_id TEXT;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_whop_user_id ON profiles(whop_user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_whop_id ON user_memberships(whop_membership_id);

-- Update RLS policies to allow coach access to athletes via whop_user_id
-- This ensures coaches can see athlete data synced from Whop
COMMENT ON COLUMN profiles.whop_user_id IS 'Whop user ID for athletes using the app inside Whop iframe';
COMMENT ON COLUMN user_memberships.whop_membership_id IS 'Whop membership ID for tracking subscription status';