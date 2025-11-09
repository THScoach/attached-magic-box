-- Add new columns for X-Factor angle and arm rotation velocity
ALTER TABLE public.reboot_reports
ADD COLUMN IF NOT EXISTS x_factor_angle NUMERIC,
ADD COLUMN IF NOT EXISTS peak_arm_rot_vel NUMERIC;

-- Add comments for clarity
COMMENT ON COLUMN public.reboot_reports.x_factor_angle IS 'X-Factor separation angle in degrees (absolute value from PDF)';
COMMENT ON COLUMN public.reboot_reports.peak_arm_rot_vel IS 'Peak arm rotational velocity in deg/s from Reboot Motion PDF';