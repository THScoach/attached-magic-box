-- Drop the RLS policy that depends on team_rosters
DROP POLICY IF EXISTS "Coaches can insert reports for their athletes" ON reboot_reports;