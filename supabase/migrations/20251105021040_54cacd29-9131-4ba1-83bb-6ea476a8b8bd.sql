-- Fix security issues: Restrict access to profiles and user_memberships tables

-- First, ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on profiles if any (to start fresh)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Coaches can view their athletes' profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create secure RLS policies for profiles table
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Coaches can view their athletes' profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM team_rosters tr
    WHERE tr.coach_id = auth.uid()
      AND tr.athlete_id = profiles.id
      AND tr.is_active = true
  )
);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Now secure the user_memberships table
ALTER TABLE public.user_memberships ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on user_memberships if any
DROP POLICY IF EXISTS "Users can view their own membership" ON public.user_memberships;
DROP POLICY IF EXISTS "Users can insert their own membership" ON public.user_memberships;
DROP POLICY IF EXISTS "Users can update their own membership" ON public.user_memberships;
DROP POLICY IF EXISTS "Admins can view all memberships" ON public.user_memberships;
DROP POLICY IF EXISTS "Public memberships are viewable by everyone" ON public.user_memberships;

-- Create secure RLS policies for user_memberships table
CREATE POLICY "Users can view their own membership"
ON public.user_memberships
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own membership"
ON public.user_memberships
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own membership"
ON public.user_memberships
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow admins to view all memberships (using the has_role function)
CREATE POLICY "Admins can view all memberships"
ON public.user_memberships
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));