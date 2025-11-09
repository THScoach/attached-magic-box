-- Add RLS policy to allow coaches to insert reboot reports for their athletes
CREATE POLICY "Coaches can insert reports for their athletes"
ON reboot_reports
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM team_rosters tr
    WHERE tr.coach_id = auth.uid()
    AND tr.athlete_id = reboot_reports.user_id
    AND tr.is_active = true
  )
);