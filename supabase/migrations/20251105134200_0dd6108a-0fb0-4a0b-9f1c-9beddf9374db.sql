-- Fix infinite recursion in RLS policies by using security definer functions

-- Create security definer function to check if user is in a challenge
CREATE OR REPLACE FUNCTION public.is_user_in_challenge(_challenge_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM challenge_participants
    WHERE challenge_id = _challenge_id
      AND user_id = _user_id
  )
$$;

-- Create security definer function to check if user is coach of a challenge
CREATE OR REPLACE FUNCTION public.is_coach_of_challenge(_challenge_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM team_challenges
    WHERE id = _challenge_id
      AND coach_id = _user_id
  )
$$;

-- Drop and recreate the problematic policies

-- Fix challenge_participants policies
DROP POLICY IF EXISTS "Athletes can view all participants in challenges they're in" ON challenge_participants;
DROP POLICY IF EXISTS "Coaches can view participants in their challenges" ON challenge_participants;
DROP POLICY IF EXISTS "Coaches can add participants to their challenges" ON challenge_participants;
DROP POLICY IF EXISTS "Coaches can update participants in their challenges" ON challenge_participants;

CREATE POLICY "Athletes can view all participants in challenges they're in" 
ON challenge_participants 
FOR SELECT 
USING (public.is_user_in_challenge(challenge_id, auth.uid()));

CREATE POLICY "Coaches can view participants in their challenges" 
ON challenge_participants 
FOR SELECT 
USING (public.is_coach_of_challenge(challenge_id, auth.uid()));

CREATE POLICY "Coaches can add participants to their challenges" 
ON challenge_participants 
FOR INSERT 
WITH CHECK (public.is_coach_of_challenge(challenge_id, auth.uid()));

CREATE POLICY "Coaches can update participants in their challenges" 
ON challenge_participants 
FOR UPDATE 
USING (public.is_coach_of_challenge(challenge_id, auth.uid()));

-- Fix team_challenges policies
DROP POLICY IF EXISTS "Athletes can view public challenges they participate in" ON team_challenges;

CREATE POLICY "Athletes can view public challenges they participate in" 
ON team_challenges 
FOR SELECT 
USING (is_public = true AND public.is_user_in_challenge(id, auth.uid()));