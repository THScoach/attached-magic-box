-- Add player physical data and body mass to reboot_reports table
ALTER TABLE reboot_reports
ADD COLUMN IF NOT EXISTS player_height NUMERIC,
ADD COLUMN IF NOT EXISTS player_weight NUMERIC,
ADD COLUMN IF NOT EXISTS body_mass NUMERIC;

COMMENT ON COLUMN reboot_reports.player_height IS 'Player height in inches';
COMMENT ON COLUMN reboot_reports.player_weight IS 'Player weight in lbs';
COMMENT ON COLUMN reboot_reports.body_mass IS 'Calculated body mass in kg (weight * 0.453592)';