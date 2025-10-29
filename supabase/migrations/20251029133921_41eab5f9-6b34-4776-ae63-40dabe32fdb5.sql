-- Create membership tiers enum
CREATE TYPE public.membership_tier AS ENUM ('free', 'challenge', 'diy', 'elite');

-- Create user memberships table
CREATE TABLE public.user_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier public.membership_tier NOT NULL DEFAULT 'free',
  whop_membership_id TEXT,
  whop_user_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create whop webhook events table for audit trail
CREATE TABLE public.whop_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  whop_membership_id TEXT,
  whop_user_id TEXT,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create membership features table to track what each tier gets
CREATE TABLE public.membership_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier public.membership_tier NOT NULL,
  feature_key TEXT NOT NULL,
  feature_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tier, feature_key)
);

-- Enable RLS
ALTER TABLE public.user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whop_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_memberships
CREATE POLICY "Users can view their own membership"
  ON public.user_memberships
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all memberships"
  ON public.user_memberships
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for whop_webhook_events (admin only)
CREATE POLICY "Service role can manage webhook events"
  ON public.whop_webhook_events
  FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for membership_features (public read)
CREATE POLICY "Anyone can view membership features"
  ON public.membership_features
  FOR SELECT
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_membership_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add trigger for updated_at
CREATE TRIGGER update_user_memberships_updated_at
  BEFORE UPDATE ON public.user_memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_membership_updated_at();

-- Insert default membership features
INSERT INTO public.membership_features (tier, feature_key, feature_value) VALUES
  -- Free tier
  ('free', 'max_analyses', '{"limit": 2, "period": "lifetime"}'),
  ('free', 'velocity_tracking', '{"enabled": true}'),
  ('free', 'educational_content', '{"enabled": true}'),
  ('free', 'coach_access', '{"enabled": false}'),
  
  -- Challenge tier ($97)
  ('challenge', 'max_analyses', '{"limit": 999, "period": "challenge"}'),
  ('challenge', 'grandiose_diagnosis', '{"enabled": true}'),
  ('challenge', 'training_sessions', '{"count": 3, "per_week": true}'),
  ('challenge', 'coaching_calls', '{"count": 2, "duration": "15-20min"}'),
  ('challenge', 'video_feedback', '{"uploads": 2, "turnaround": "24hrs"}'),
  ('challenge', 'community_access', '{"enabled": true}'),
  ('challenge', 'duration_days', '{"days": 7}'),
  
  -- DIY Platform ($37/mo or $297/yr)
  ('diy', 'max_analyses', '{"limit": 999, "period": "unlimited"}'),
  ('diy', 'grandiose_diagnosis', '{"enabled": true}'),
  ('diy', 'automated_analysis', '{"enabled": true}'),
  ('diy', 'progress_dashboard', '{"enabled": true}'),
  ('diy', 'training_library', '{"videos": "87+"}'),
  ('diy', 'group_calls', '{"frequency": "monthly"}'),
  ('diy', 'community_access', '{"enabled": true}'),
  
  -- Elite tier ($2,997)
  ('elite', 'max_analyses', '{"limit": 999, "period": "unlimited"}'),
  ('elite', 'everything_in_diy', '{"enabled": true}'),
  ('elite', 'one_on_one_calls', '{"frequency": "bi-weekly"}'),
  ('elite', 'custom_training_plan', '{"duration": "90days"}'),
  ('elite', 'priority_feedback', '{"turnaround": "24hrs"}'),
  ('elite', 'in_person_lessons', '{"count": 2, "per_month": true}'),
  ('elite', 'private_channel', '{"enabled": true}'),
  ('elite', 'guarantee', '{"type": "3mph_or_refund_plus_1000"}');

-- Create function to check user membership tier
CREATE OR REPLACE FUNCTION public.has_membership_tier(_user_id UUID, _tier public.membership_tier)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_memberships
    WHERE user_id = _user_id
      AND tier = _tier
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Create function to get user membership tier
CREATE OR REPLACE FUNCTION public.get_user_membership_tier(_user_id UUID)
RETURNS public.membership_tier
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tier
  FROM public.user_memberships
  WHERE user_id = _user_id
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1
$$;