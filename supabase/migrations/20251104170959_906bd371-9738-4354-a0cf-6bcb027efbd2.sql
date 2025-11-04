-- Create table for BAT metrics (bat speed, attack angle, time in zone)
CREATE TABLE IF NOT EXISTS public.bat_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  player_id UUID,
  analysis_id UUID REFERENCES swing_analyses(id),
  bat_speed NUMERIC NOT NULL,
  attack_angle NUMERIC NOT NULL,
  time_in_zone NUMERIC NOT NULL,
  bat_speed_grade NUMERIC,
  attack_angle_grade NUMERIC,
  time_in_zone_grade NUMERIC,
  personal_best NUMERIC,
  level TEXT DEFAULT 'highSchool',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for BODY metrics (kinematic sequence, power, tempo)
CREATE TABLE IF NOT EXISTS public.body_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  player_id UUID,
  analysis_id UUID REFERENCES swing_analyses(id),
  legs_peak_velocity NUMERIC NOT NULL,
  core_peak_velocity NUMERIC NOT NULL,
  arms_peak_velocity NUMERIC NOT NULL,
  bat_peak_velocity NUMERIC NOT NULL,
  sequence_efficiency NUMERIC NOT NULL,
  sequence_grade NUMERIC,
  legs_power NUMERIC NOT NULL,
  core_power NUMERIC NOT NULL,
  arms_power NUMERIC NOT NULL,
  power_grade NUMERIC,
  load_time NUMERIC NOT NULL,
  launch_time NUMERIC NOT NULL,
  tempo_ratio NUMERIC NOT NULL,
  tempo_grade NUMERIC,
  is_correct_sequence BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for BALL metrics (exit velocity, launch angle, hard hit %)
CREATE TABLE IF NOT EXISTS public.ball_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  player_id UUID,
  analysis_id UUID REFERENCES swing_analyses(id),
  exit_velocity NUMERIC NOT NULL,
  exit_velocity_grade NUMERIC,
  fly_ball_percentage NUMERIC,
  line_drive_percentage NUMERIC,
  ground_ball_percentage NUMERIC,
  launch_angle_grade NUMERIC,
  hard_hit_percentage NUMERIC,
  hard_hit_count INTEGER,
  total_swings INTEGER,
  hard_hit_grade NUMERIC,
  level TEXT DEFAULT 'highSchool',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for BRAIN metrics (reaction time, swing decisions, focus)
CREATE TABLE IF NOT EXISTS public.brain_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  player_id UUID,
  analysis_id UUID REFERENCES swing_analyses(id),
  reaction_time NUMERIC NOT NULL,
  reaction_time_grade NUMERIC,
  good_swings_percentage NUMERIC,
  good_takes_percentage NUMERIC,
  chase_rate NUMERIC,
  swing_decision_grade NUMERIC,
  total_pitches INTEGER,
  focus_score NUMERIC,
  focus_grade NUMERIC,
  consistency_rating NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bat_metrics_user_id ON public.bat_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_bat_metrics_player_id ON public.bat_metrics(player_id);
CREATE INDEX IF NOT EXISTS idx_bat_metrics_created_at ON public.bat_metrics(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_body_metrics_user_id ON public.body_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_body_metrics_player_id ON public.body_metrics(player_id);
CREATE INDEX IF NOT EXISTS idx_body_metrics_created_at ON public.body_metrics(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ball_metrics_user_id ON public.ball_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_ball_metrics_player_id ON public.ball_metrics(player_id);
CREATE INDEX IF NOT EXISTS idx_ball_metrics_created_at ON public.ball_metrics(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_brain_metrics_user_id ON public.brain_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_brain_metrics_player_id ON public.brain_metrics(player_id);
CREATE INDEX IF NOT EXISTS idx_brain_metrics_created_at ON public.brain_metrics(created_at DESC);

-- Enable RLS on all tables
ALTER TABLE public.bat_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ball_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bat_metrics
CREATE POLICY "Users can view their own bat metrics"
  ON public.bat_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bat metrics"
  ON public.bat_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches can view their athletes' bat metrics"
  ON public.bat_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_rosters tr
      WHERE tr.coach_id = auth.uid()
        AND tr.athlete_id = bat_metrics.user_id
        AND tr.is_active = true
    )
  );

-- RLS Policies for body_metrics
CREATE POLICY "Users can view their own body metrics"
  ON public.body_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own body metrics"
  ON public.body_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches can view their athletes' body metrics"
  ON public.body_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_rosters tr
      WHERE tr.coach_id = auth.uid()
        AND tr.athlete_id = body_metrics.user_id
        AND tr.is_active = true
    )
  );

-- RLS Policies for ball_metrics
CREATE POLICY "Users can view their own ball metrics"
  ON public.ball_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ball metrics"
  ON public.ball_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches can view their athletes' ball metrics"
  ON public.ball_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_rosters tr
      WHERE tr.coach_id = auth.uid()
        AND tr.athlete_id = ball_metrics.user_id
        AND tr.is_active = true
    )
  );

-- RLS Policies for brain_metrics
CREATE POLICY "Users can view their own brain metrics"
  ON public.brain_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brain metrics"
  ON public.brain_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches can view their athletes' brain metrics"
  ON public.brain_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_rosters tr
      WHERE tr.coach_id = auth.uid()
        AND tr.athlete_id = brain_metrics.user_id
        AND tr.is_active = true
    )
  );

-- Update user_gamification table to track practice days
ALTER TABLE public.user_gamification 
ADD COLUMN IF NOT EXISTS practice_days JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.user_gamification.practice_days IS 'Array of ISO date strings when user practiced (for calendar visualization)';

-- Create a view for progress trends
CREATE OR REPLACE VIEW public.progress_trends AS
SELECT 
  sa.user_id,
  sa.player_id,
  DATE(sa.created_at) as date,
  ROUND(AVG(sa.overall_score)::numeric, 1) as avg_hits_score,
  ROUND(AVG(sa.anchor_score)::numeric, 1) as avg_anchor,
  ROUND(AVG(sa.engine_score)::numeric, 1) as avg_engine,
  ROUND(AVG(sa.whip_score)::numeric, 1) as avg_whip,
  COUNT(*) as swing_count
FROM swing_analyses sa
WHERE sa.created_at >= now() - interval '90 days'
GROUP BY sa.user_id, sa.player_id, DATE(sa.created_at)
ORDER BY DATE(sa.created_at) DESC;