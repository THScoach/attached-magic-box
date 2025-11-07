-- Update RLS policy to allow coaches to view calendar items they created
DROP POLICY IF EXISTS "Coaches can view their athletes' calendar items" ON calendar_items;

CREATE POLICY "Coaches can view calendar items they created" 
ON calendar_items 
FOR SELECT 
USING (
  auth.uid() = coach_id OR
  (EXISTS (
    SELECT 1 FROM team_rosters tr
    WHERE tr.coach_id = auth.uid() 
      AND tr.athlete_id = calendar_items.user_id 
      AND tr.is_active = true
  ))
);