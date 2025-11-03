-- Add video tagging fields to swing_analyses table
ALTER TABLE swing_analyses 
ADD COLUMN IF NOT EXISTS video_type TEXT CHECK (video_type IN ('practice', 'drill', 'live_action')),
ADD COLUMN IF NOT EXISTS drill_id UUID REFERENCES drills(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS drill_name TEXT;

-- Create index for drill analysis queries
CREATE INDEX IF NOT EXISTS idx_swing_analyses_drill_id ON swing_analyses(drill_id);
CREATE INDEX IF NOT EXISTS idx_swing_analyses_video_type ON swing_analyses(video_type);

-- Create a view for drill effectiveness analysis
CREATE OR REPLACE VIEW drill_effectiveness AS
SELECT 
  d.id as drill_id,
  d.name as drill_name,
  d.pillar,
  d.difficulty,
  COUNT(sa.id) as total_uses,
  AVG(sa.overall_score) as avg_overall_score,
  AVG(sa.anchor_score) as avg_anchor_score,
  AVG(sa.engine_score) as avg_engine_score,
  AVG(sa.whip_score) as avg_whip_score,
  AVG(CAST(sa.metrics->>'bat_speed' AS FLOAT)) as avg_bat_speed,
  AVG(CAST(sa.metrics->>'fire_sequence_score' AS FLOAT)) as avg_fire_sequence,
  MIN(sa.created_at) as first_used,
  MAX(sa.created_at) as last_used
FROM drills d
LEFT JOIN swing_analyses sa ON sa.drill_id = d.id
GROUP BY d.id, d.name, d.pillar, d.difficulty;

COMMENT ON VIEW drill_effectiveness IS 'Tracks drill effectiveness based on swing analysis metrics over time';