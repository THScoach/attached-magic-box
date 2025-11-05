-- Create goals table
CREATE TABLE IF NOT EXISTS athlete_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  player_id UUID,
  goal_type TEXT NOT NULL, -- 'bat_speed', 'exit_velocity', 'tempo_ratio', 'pillar_score', 'overall_score', 'custom'
  target_metric TEXT NOT NULL,
  current_value NUMERIC NOT NULL,
  target_value NUMERIC NOT NULL,
  unit TEXT, -- 'mph', 'ratio', 'score', 'percentage', etc.
  title TEXT NOT NULL,
  description TEXT,
  specific_details TEXT,
  measurable_criteria TEXT,
  achievable_reasoning TEXT,
  relevant_context TEXT,
  time_bound_deadline TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'abandoned', 'expired'
  priority TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
  baseline_analysis_id UUID REFERENCES swing_analyses(id),
  milestone_checkpoints JSONB, -- [{value: 85, description: "First checkpoint", achieved: false, achieved_at: null}]
  progress_history JSONB DEFAULT '[]'::jsonb, -- [{date: "2025-01-01", value: 80, analysis_id: "..."}]
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  celebration_shown BOOLEAN DEFAULT false
);

-- Create goal progress tracking table
CREATE TABLE IF NOT EXISTS goal_progress_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES athlete_goals(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES swing_analyses(id),
  recorded_value NUMERIC NOT NULL,
  progress_percentage NUMERIC NOT NULL,
  notes TEXT,
  is_milestone BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE athlete_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_progress_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own goals" ON athlete_goals;
DROP POLICY IF EXISTS "Users can insert their own goals" ON athlete_goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON athlete_goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON athlete_goals;
DROP POLICY IF EXISTS "Coaches can view athlete goals" ON athlete_goals;
DROP POLICY IF EXISTS "Users can view their own goal progress" ON goal_progress_entries;
DROP POLICY IF EXISTS "Users can insert their own goal progress" ON goal_progress_entries;
DROP POLICY IF EXISTS "Coaches can view athlete goal progress" ON goal_progress_entries;

-- Goals RLS Policies
CREATE POLICY "Users can view their own goals"
  ON athlete_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
  ON athlete_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
  ON athlete_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
  ON athlete_goals FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view athlete goals"
  ON athlete_goals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_rosters tr
      WHERE tr.coach_id = auth.uid()
        AND tr.athlete_id = athlete_goals.user_id
        AND tr.is_active = true
    )
  );

-- Goal Progress RLS Policies
CREATE POLICY "Users can view their own goal progress"
  ON goal_progress_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM athlete_goals ag
      WHERE ag.id = goal_progress_entries.goal_id
        AND ag.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own goal progress"
  ON goal_progress_entries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM athlete_goals ag
      WHERE ag.id = goal_progress_entries.goal_id
        AND ag.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can view athlete goal progress"
  ON goal_progress_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM athlete_goals ag
      JOIN team_rosters tr ON tr.athlete_id = ag.user_id
      WHERE ag.id = goal_progress_entries.goal_id
        AND tr.coach_id = auth.uid()
        AND tr.is_active = true
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_athlete_goals_user_id ON athlete_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_athlete_goals_status ON athlete_goals(status);
CREATE INDEX IF NOT EXISTS idx_athlete_goals_deadline ON athlete_goals(time_bound_deadline);
CREATE INDEX IF NOT EXISTS idx_goal_progress_goal_id ON goal_progress_entries(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_progress_created_at ON goal_progress_entries(created_at DESC);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_athlete_goals_updated_at ON athlete_goals;
CREATE TRIGGER update_athlete_goals_updated_at
  BEFORE UPDATE ON athlete_goals
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();