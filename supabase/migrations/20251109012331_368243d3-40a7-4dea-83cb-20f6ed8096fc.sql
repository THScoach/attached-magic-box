-- Create reboot_reports table to persist reboot analysis data
CREATE TABLE IF NOT EXISTS public.reboot_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  pdf_url TEXT NOT NULL,
  label TEXT NOT NULL,
  upload_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  report_date DATE NOT NULL,
  
  -- Timing metrics
  negative_move_time NUMERIC NOT NULL,
  max_pelvis_turn_time NUMERIC NOT NULL,
  max_shoulder_turn_time NUMERIC NOT NULL,
  max_x_factor_time NUMERIC NOT NULL,
  load_duration NUMERIC NOT NULL,
  fire_duration NUMERIC NOT NULL,
  tempo_ratio NUMERIC NOT NULL,
  kinematic_sequence_gap NUMERIC NOT NULL,
  
  -- Biomechanics metrics
  peak_pelvis_rot_vel NUMERIC,
  peak_shoulder_rot_vel NUMERIC,
  peak_bat_speed NUMERIC,
  x_factor NUMERIC,
  hip_shoulder_separation NUMERIC,
  attack_angle NUMERIC,
  vertical_bat_angle NUMERIC,
  connection_at_impact NUMERIC,
  posture_angle NUMERIC,
  early_connection NUMERIC,
  
  -- Momentum metrics
  height NUMERIC,
  weight NUMERIC,
  peak_com_velocity NUMERIC,
  momentum_direction_angle NUMERIC,
  forward_momentum_pct NUMERIC,
  transfer_efficiency NUMERIC,
  
  -- Power metrics
  rotational_power NUMERIC,
  linear_power NUMERIC,
  total_power NUMERIC,
  energy_transfer_efficiency NUMERIC,
  
  -- Scores
  fire_duration_score NUMERIC NOT NULL,
  tempo_ratio_score NUMERIC NOT NULL,
  body_score NUMERIC NOT NULL,
  archetype TEXT NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reboot_reports ENABLE ROW LEVEL SECURITY;

-- Users can view their own reports
CREATE POLICY "Users can view their own reboot reports"
  ON public.reboot_reports
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own reports
CREATE POLICY "Users can insert their own reboot reports"
  ON public.reboot_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reports
CREATE POLICY "Users can delete their own reboot reports"
  ON public.reboot_reports
  FOR DELETE
  USING (auth.uid() = user_id);

-- Coaches can view reports of their athletes
CREATE POLICY "Coaches can view their athletes' reboot reports"
  ON public.reboot_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_rosters tr
      WHERE tr.coach_id = auth.uid()
        AND tr.athlete_id = reboot_reports.user_id
        AND tr.is_active = true
    )
  );

-- Create index for faster queries
CREATE INDEX idx_reboot_reports_user_id ON public.reboot_reports(user_id);
CREATE INDEX idx_reboot_reports_player_id ON public.reboot_reports(player_id);
CREATE INDEX idx_reboot_reports_report_date ON public.reboot_reports(report_date DESC);