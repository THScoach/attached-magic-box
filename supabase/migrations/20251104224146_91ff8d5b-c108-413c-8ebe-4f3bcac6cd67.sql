-- Add 4B scoring columns to swing_analyses
ALTER TABLE swing_analyses 
ADD COLUMN IF NOT EXISTS bat_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS body_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS ball_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS brain_score NUMERIC DEFAULT 0;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_swing_analyses_4b_scores ON swing_analyses(bat_score, body_score, ball_score, brain_score);