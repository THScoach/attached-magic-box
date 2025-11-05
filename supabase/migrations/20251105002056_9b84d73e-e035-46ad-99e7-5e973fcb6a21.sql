-- Create drill_recommendations table if it doesn't exist
CREATE TABLE IF NOT EXISTS drill_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  player_id UUID,
  analysis_id UUID REFERENCES swing_analyses(id),
  recommendations JSONB NOT NULL,
  training_plan_summary TEXT,
  focus_areas TEXT[],
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE drill_recommendations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own drill recommendations" ON drill_recommendations;
DROP POLICY IF EXISTS "Users can insert their own drill recommendations" ON drill_recommendations;
DROP POLICY IF EXISTS "Users can update their own drill recommendations" ON drill_recommendations;
DROP POLICY IF EXISTS "Coaches can view their athletes' drill recommendations" ON drill_recommendations;

-- RLS Policies
CREATE POLICY "Users can view their own drill recommendations"
  ON drill_recommendations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own drill recommendations"
  ON drill_recommendations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drill recommendations"
  ON drill_recommendations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view their athletes' drill recommendations"
  ON drill_recommendations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_rosters tr
      WHERE tr.coach_id = auth.uid()
        AND tr.athlete_id = drill_recommendations.user_id
        AND tr.is_active = true
    )
  );

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_drill_recommendations_user_id ON drill_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_drill_recommendations_analysis_id ON drill_recommendations(analysis_id);
CREATE INDEX IF NOT EXISTS idx_drill_recommendations_created_at ON drill_recommendations(created_at DESC);

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_drill_recommendations_updated_at ON drill_recommendations;
CREATE TRIGGER update_drill_recommendations_updated_at
  BEFORE UPDATE ON drill_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();