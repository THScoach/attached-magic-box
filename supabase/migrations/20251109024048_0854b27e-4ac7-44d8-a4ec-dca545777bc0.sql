-- Add calculated metrics columns to reboot_reports table

-- Timing calculations
ALTER TABLE reboot_reports ADD COLUMN IF NOT EXISTS load_duration DECIMAL;
ALTER TABLE reboot_reports ADD COLUMN IF NOT EXISTS fire_duration DECIMAL;
ALTER TABLE reboot_reports ADD COLUMN IF NOT EXISTS tempo_ratio DECIMAL;
ALTER TABLE reboot_reports ADD COLUMN IF NOT EXISTS pelvis_shoulder_gap DECIMAL;

-- Consistency calculations
ALTER TABLE reboot_reports ADD COLUMN IF NOT EXISTS pelvis_consistency DECIMAL;
ALTER TABLE reboot_reports ADD COLUMN IF NOT EXISTS shoulder_consistency DECIMAL;
ALTER TABLE reboot_reports ADD COLUMN IF NOT EXISTS arm_consistency DECIMAL;
ALTER TABLE reboot_reports ADD COLUMN IF NOT EXISTS overall_consistency DECIMAL;

-- Rotation calculations
ALTER TABLE reboot_reports ADD COLUMN IF NOT EXISTS total_pelvis_rotation DECIMAL;
ALTER TABLE reboot_reports ADD COLUMN IF NOT EXISTS total_shoulder_rotation DECIMAL;

-- COM calculations
ALTER TABLE reboot_reports ADD COLUMN IF NOT EXISTS weight_shift DECIMAL;
ALTER TABLE reboot_reports ADD COLUMN IF NOT EXISTS bracing_efficiency DECIMAL;

-- MLB velocity comparisons
ALTER TABLE reboot_reports ADD COLUMN IF NOT EXISTS mlb_avg_pelvis_rot_vel DECIMAL;
ALTER TABLE reboot_reports ADD COLUMN IF NOT EXISTS mlb_avg_shoulder_rot_vel DECIMAL;
ALTER TABLE reboot_reports ADD COLUMN IF NOT EXISTS mlb_avg_arm_rot_vel DECIMAL;

-- Add comment
COMMENT ON COLUMN reboot_reports.tempo_ratio IS 'Load duration / Fire duration - optimal 2.0-3.5 for practice swings';
COMMENT ON COLUMN reboot_reports.bracing_efficiency IS 'Deceleration rate / Acceleration rate - measures front side bracing quality';
COMMENT ON COLUMN reboot_reports.overall_consistency IS 'Average of pelvis, shoulder, and arm consistency percentages';