-- Add practice reminders settings to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS practice_reminders_enabled BOOLEAN DEFAULT true;

-- Add reminder tracking to calendar items
ALTER TABLE calendar_items
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

-- Create index for efficient reminder queries
CREATE INDEX IF NOT EXISTS idx_calendar_items_reminder_lookup 
ON calendar_items(scheduled_date, reminder_sent) 
WHERE completed_at IS NULL AND reminder_sent = false;