-- Allow coaches to create calendar items for themselves
CREATE POLICY "Coaches can create calendar items for themselves"
ON calendar_items
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = coach_id AND auth.uid() = user_id);

-- Create function to auto-create calendar items for new roster athletes
CREATE OR REPLACE FUNCTION public.sync_calendar_items_to_new_athlete()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Copy all future scheduled meetings from coach to new athlete
  INSERT INTO calendar_items (user_id, coach_id, item_type, title, description, scheduled_date, scheduled_time, duration, status, metadata)
  SELECT 
    NEW.athlete_id,
    NEW.coach_id,
    item_type,
    title,
    description,
    scheduled_date,
    scheduled_time,
    duration,
    status,
    metadata
  FROM calendar_items
  WHERE coach_id = NEW.coach_id
    AND user_id = NEW.coach_id
    AND item_type = 'live_meeting'
    AND scheduled_date >= CURRENT_DATE
    AND status = 'scheduled';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically sync calendar items when athlete is added to roster
CREATE TRIGGER sync_calendar_on_roster_add
AFTER INSERT ON team_rosters
FOR EACH ROW
WHEN (NEW.is_active = true)
EXECUTE FUNCTION sync_calendar_items_to_new_athlete();