-- Add new membership tiers
ALTER TYPE membership_tier ADD VALUE IF NOT EXISTS 'challenge';
ALTER TYPE membership_tier ADD VALUE IF NOT EXISTS 'diy';
ALTER TYPE membership_tier ADD VALUE IF NOT EXISTS 'elite';

-- Add swing count tracking for free users
ALTER TABLE user_memberships
ADD COLUMN IF NOT EXISTS swing_count integer DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN user_memberships.swing_count IS 'Tracks number of swings for free tier users (max 2)';

-- Create function to increment swing count
CREATE OR REPLACE FUNCTION public.increment_swing_count(_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_count integer;
BEGIN
  UPDATE user_memberships
  SET swing_count = swing_count + 1
  WHERE user_id = _user_id AND tier = 'free' AND status = 'active'
  RETURNING swing_count INTO new_count;
  
  RETURN COALESCE(new_count, 0);
END;
$$;

-- Create function to check if user can analyze swing
CREATE OR REPLACE FUNCTION public.can_analyze_swing(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_tier membership_tier;
  user_swing_count integer;
BEGIN
  SELECT tier, swing_count INTO user_tier, user_swing_count
  FROM user_memberships
  WHERE user_id = _user_id AND status = 'active'
  LIMIT 1;
  
  -- If no membership found, treat as free with 0 swings
  IF user_tier IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Free tier limited to 2 swings
  IF user_tier = 'free' THEN
    RETURN COALESCE(user_swing_count, 0) < 2;
  END IF;
  
  -- All other tiers have unlimited access
  RETURN TRUE;
END;
$$;