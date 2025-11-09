-- Create HitTrax sessions table
CREATE TABLE IF NOT EXISTS public.hitrax_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  player_id UUID,
  session_date DATE NOT NULL,
  total_swings INTEGER NOT NULL DEFAULT 0,
  total_hits INTEGER NOT NULL DEFAULT 0,
  avg_exit_velo NUMERIC,
  max_exit_velo NUMERIC,
  ev90 NUMERIC,
  avg_launch_angle NUMERIC,
  barrel_rate NUMERIC,
  hard_hit_rate NUMERIC,
  sweet_spot_rate NUMERIC,
  home_runs INTEGER DEFAULT 0,
  line_drive_rate NUMERIC,
  fly_ball_rate NUMERIC,
  ground_ball_rate NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create HitTrax swings table (individual swings)
CREATE TABLE IF NOT EXISTS public.hitrax_swings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.hitrax_sessions(id) ON DELETE CASCADE,
  pitch_number INTEGER NOT NULL,
  at_bat INTEGER,
  exit_velo NUMERIC,
  launch_angle NUMERIC,
  distance NUMERIC,
  result TEXT,
  hit_type TEXT,
  horiz_angle NUMERIC,
  spray_chart_x NUMERIC,
  spray_chart_z NUMERIC,
  points INTEGER,
  is_barrel BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hitrax_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hitrax_swings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hitrax_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.hitrax_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON public.hitrax_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.hitrax_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON public.hitrax_sessions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view their athletes' sessions"
  ON public.hitrax_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_rosters tr
      WHERE tr.coach_id = auth.uid()
        AND tr.athlete_id = hitrax_sessions.user_id
        AND tr.is_active = true
    )
  );

-- RLS Policies for hitrax_swings
CREATE POLICY "Users can view swings from their sessions"
  ON public.hitrax_swings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hitrax_sessions hs
      WHERE hs.id = hitrax_swings.session_id
        AND hs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert swings to their sessions"
  ON public.hitrax_swings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM hitrax_sessions hs
      WHERE hs.id = hitrax_swings.session_id
        AND hs.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can view swings from their athletes' sessions"
  ON public.hitrax_swings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM hitrax_sessions hs
      JOIN team_rosters tr ON tr.athlete_id = hs.user_id
      WHERE hs.id = hitrax_swings.session_id
        AND tr.coach_id = auth.uid()
        AND tr.is_active = true
    )
  );

-- Create indexes for performance
CREATE INDEX idx_hitrax_sessions_user_id ON public.hitrax_sessions(user_id);
CREATE INDEX idx_hitrax_sessions_player_id ON public.hitrax_sessions(player_id);
CREATE INDEX idx_hitrax_sessions_date ON public.hitrax_sessions(session_date DESC);
CREATE INDEX idx_hitrax_swings_session_id ON public.hitrax_swings(session_id);