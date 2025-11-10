-- Add standard deviation and consistency metrics to hitrax_sessions table
ALTER TABLE hitrax_sessions
ADD COLUMN IF NOT EXISTS exit_velo_std_dev numeric,
ADD COLUMN IF NOT EXISTS launch_angle_std_dev numeric,
ADD COLUMN IF NOT EXISTS exit_velo_consistency_grade text,
ADD COLUMN IF NOT EXISTS launch_angle_consistency_grade text,
ADD COLUMN IF NOT EXISTS barrel_count integer,
ADD COLUMN IF NOT EXISTS avg_launch_angle numeric,
ADD COLUMN IF NOT EXISTS max_exit_velo numeric;

COMMENT ON COLUMN hitrax_sessions.exit_velo_std_dev IS 'Exit velocity standard deviation - measures consistency';
COMMENT ON COLUMN hitrax_sessions.launch_angle_std_dev IS 'Launch angle standard deviation - measures swing path consistency';
COMMENT ON COLUMN hitrax_sessions.exit_velo_consistency_grade IS 'Grade: A+ (<5), B (5-8), C (>8)';
COMMENT ON COLUMN hitrax_sessions.launch_angle_consistency_grade IS 'Grade: A+ (<10), B (10-15), C (>15)';
COMMENT ON COLUMN hitrax_sessions.barrel_count IS 'Number of barrels (8-50° LA + 98+ mph EV)';
COMMENT ON COLUMN hitrax_sessions.avg_launch_angle IS 'Average launch angle across all swings';
COMMENT ON COLUMN hitrax_sessions.max_exit_velo IS 'Maximum exit velocity in session';