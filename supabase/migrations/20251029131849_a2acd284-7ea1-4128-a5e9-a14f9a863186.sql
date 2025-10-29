-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('coach', 'athlete');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Add is_model flag and height_weight_updated_at to players
ALTER TABLE public.players
ADD COLUMN is_model boolean DEFAULT false,
ADD COLUMN height_weight_updated_at timestamptz DEFAULT now();

COMMENT ON COLUMN public.players.is_model IS 'True if player is a model/demo player, not a real user';
COMMENT ON COLUMN public.players.height_weight_updated_at IS 'Last time height/weight was updated, used for 6-month reminders';

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES public.players(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  read_at timestamptz
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Index for notification queries
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);

-- Update players RLS to allow coaches to manage all their players
DROP POLICY IF EXISTS "Users can view their own players" ON public.players;
DROP POLICY IF EXISTS "Users can create their own players" ON public.players;
DROP POLICY IF EXISTS "Users can update their own players" ON public.players;
DROP POLICY IF EXISTS "Users can delete their own players" ON public.players;

CREATE POLICY "Users can view their own players"
ON public.players
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create players"
ON public.players
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own players"
ON public.players
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own players"
ON public.players
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);