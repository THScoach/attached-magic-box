-- Add comprehensive Reboot Motion metrics from PDF
ALTER TABLE public.reboot_reports
-- Arm/Hand metrics
ADD COLUMN IF NOT EXISTS peak_arm_rot_vel_std_dev NUMERIC,
-- Consistency metrics (standard deviations)
ADD COLUMN IF NOT EXISTS peak_pelvis_rot_vel_std_dev NUMERIC,
ADD COLUMN IF NOT EXISTS peak_shoulder_rot_vel_std_dev NUMERIC,
-- Direction/rotation angles at key events
ADD COLUMN IF NOT EXISTS pelvis_direction_stance NUMERIC,
ADD COLUMN IF NOT EXISTS pelvis_direction_neg_move NUMERIC,
ADD COLUMN IF NOT EXISTS pelvis_direction_max_pelvis NUMERIC,
ADD COLUMN IF NOT EXISTS pelvis_direction_impact NUMERIC,
ADD COLUMN IF NOT EXISTS shoulder_direction_stance NUMERIC,
ADD COLUMN IF NOT EXISTS shoulder_direction_neg_move NUMERIC,
ADD COLUMN IF NOT EXISTS shoulder_direction_max_shoulder NUMERIC,
ADD COLUMN IF NOT EXISTS shoulder_direction_impact NUMERIC,
-- X-Factor progression
ADD COLUMN IF NOT EXISTS x_factor_stance NUMERIC,
ADD COLUMN IF NOT EXISTS x_factor_neg_move NUMERIC,
ADD COLUMN IF NOT EXISTS x_factor_max_pelvis NUMERIC,
ADD COLUMN IF NOT EXISTS x_factor_impact NUMERIC,
-- MLB comparison data
ADD COLUMN IF NOT EXISTS mlb_avg_max_pelvis_turn NUMERIC,
ADD COLUMN IF NOT EXISTS mlb_avg_max_shoulder_turn NUMERIC,
ADD COLUMN IF NOT EXISTS mlb_avg_x_factor NUMERIC,
-- Posture metrics
ADD COLUMN IF NOT EXISTS frontal_tilt_foot_down NUMERIC,
ADD COLUMN IF NOT EXISTS frontal_tilt_max_hand_velo NUMERIC,
ADD COLUMN IF NOT EXISTS lateral_tilt_foot_down NUMERIC,
ADD COLUMN IF NOT EXISTS lateral_tilt_max_hand_velo NUMERIC,
-- COM position metrics
ADD COLUMN IF NOT EXISTS com_dist_neg_move NUMERIC,
ADD COLUMN IF NOT EXISTS com_dist_foot_down NUMERIC,
ADD COLUMN IF NOT EXISTS com_dist_max_forward NUMERIC,
ADD COLUMN IF NOT EXISTS stride_length_meters NUMERIC,
ADD COLUMN IF NOT EXISTS stride_length_pct_height NUMERIC,
-- COM velocity details
ADD COLUMN IF NOT EXISTS min_com_velocity NUMERIC,
ADD COLUMN IF NOT EXISTS com_avg_accel_rate NUMERIC,
ADD COLUMN IF NOT EXISTS com_avg_decel_rate NUMERIC;

-- Add comments for clarity
COMMENT ON COLUMN public.reboot_reports.peak_arm_rot_vel_std_dev IS 'Standard deviation of arm rotation velocity (consistency metric)';
COMMENT ON COLUMN public.reboot_reports.peak_pelvis_rot_vel_std_dev IS 'Standard deviation of pelvis rotation velocity (consistency metric)';
COMMENT ON COLUMN public.reboot_reports.peak_shoulder_rot_vel_std_dev IS 'Standard deviation of shoulder rotation velocity (consistency metric)';
COMMENT ON COLUMN public.reboot_reports.pelvis_direction_stance IS 'Pelvis direction angle at stance (degrees)';
COMMENT ON COLUMN public.reboot_reports.pelvis_direction_impact IS 'Pelvis direction angle at impact (degrees)';
COMMENT ON COLUMN public.reboot_reports.x_factor_stance IS 'X-Factor separation at stance (degrees)';
COMMENT ON COLUMN public.reboot_reports.x_factor_impact IS 'X-Factor separation at impact (degrees)';
COMMENT ON COLUMN public.reboot_reports.mlb_avg_max_pelvis_turn IS 'MLB average for max pelvis turn (for comparison)';
COMMENT ON COLUMN public.reboot_reports.frontal_tilt_foot_down IS 'Spine angle - frontal plane at foot down (degrees)';
COMMENT ON COLUMN public.reboot_reports.lateral_tilt_foot_down IS 'Spine angle - lateral plane at foot down (degrees)';
COMMENT ON COLUMN public.reboot_reports.com_dist_neg_move IS 'COM distance at negative move (% forward)';
COMMENT ON COLUMN public.reboot_reports.stride_length_meters IS 'Stride length in meters';
COMMENT ON COLUMN public.reboot_reports.min_com_velocity IS 'Minimum COM velocity (negative = backward movement)';
COMMENT ON COLUMN public.reboot_reports.com_avg_accel_rate IS 'Average COM acceleration rate (m/s²)';
COMMENT ON COLUMN public.reboot_reports.com_avg_decel_rate IS 'Average COM deceleration rate (m/s²) - bracing';