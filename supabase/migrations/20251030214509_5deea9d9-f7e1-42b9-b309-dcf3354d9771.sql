-- Create promo_codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seats_allocated INTEGER NOT NULL DEFAULT 1,
  seats_used INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create promo_redemptions table for audit trail
CREATE TABLE IF NOT EXISTS public.promo_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(promo_code_id, athlete_id)
);

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;

-- Promo codes policies
CREATE POLICY "Coaches can manage their own promo codes"
  ON public.promo_codes
  FOR ALL
  USING (auth.uid() = coach_id);

CREATE POLICY "Anyone can view active non-expired promo codes"
  ON public.promo_codes
  FOR SELECT
  USING (is_active = true AND expires_at > now());

-- Promo redemptions policies
CREATE POLICY "Coaches can view redemptions of their codes"
  ON public.promo_redemptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.promo_codes
      WHERE promo_codes.id = promo_redemptions.promo_code_id
      AND promo_codes.coach_id = auth.uid()
    )
  );

CREATE POLICY "Athletes can create redemptions"
  ON public.promo_redemptions
  FOR INSERT
  WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "Athletes can view their own redemptions"
  ON public.promo_redemptions
  FOR SELECT
  USING (auth.uid() = athlete_id);

-- Add updated_at trigger
CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON public.promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();