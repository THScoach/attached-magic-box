-- Fix security definer view issue
DROP VIEW IF EXISTS drill_effectiveness;

CREATE OR REPLACE VIEW drill_effectiveness 
WITH (security_invoker = true)
AS
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