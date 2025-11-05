-- Add coach_notes table for private coach observations (already exists as coaching_notes, but ensure it's properly structured)
-- Note: coaching_notes table already exists, no changes needed

-- Ensure we have proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_coaching_notes_athlete_coach ON coaching_notes(athlete_id, coach_id);
CREATE INDEX IF NOT EXISTS idx_team_rosters_coach ON team_rosters(coach_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_swing_analyses_user_created ON swing_analyses(user_id, created_at DESC);

-- Create admin_settings table for organization branding and preferences
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_name text,
  organization_logo_url text,
  primary_color text DEFAULT '#FFD700',
  secondary_color text DEFAULT '#FF6B35',
  email_notifications jsonb DEFAULT '{"new_uploads": true, "weekly_summary": true, "grade_declines": true, "daily_digest": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage their own settings"
  ON admin_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_settings_updated_at();