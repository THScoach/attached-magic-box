-- Remove SECURITY DEFINER from views and recreate them properly
-- This fixes the security scan error about views with SECURITY DEFINER

-- Drop and recreate drill_effectiveness view without SECURITY DEFINER
DROP VIEW IF EXISTS public.drill_effectiveness;

CREATE OR REPLACE VIEW public.drill_effectiveness AS
SELECT 
  d.id AS drill_id,
  d.name AS drill_name,
  d.pillar,
  d.difficulty,
  COUNT(sa.id) AS total_uses,
  AVG(sa.overall_score) AS avg_overall_score,
  AVG(sa.anchor_score) AS avg_anchor_score,
  AVG(sa.engine_score) AS avg_engine_score,
  AVG(sa.whip_score) AS avg_whip_score,
  AVG((sa.metrics->>'bat_speed')::double precision) AS avg_bat_speed,
  AVG((sa.metrics->>'fire_sequence_score')::double precision) AS avg_fire_sequence,
  MIN(sa.created_at) AS first_used,
  MAX(sa.created_at) AS last_used
FROM drills d
LEFT JOIN swing_analyses sa ON sa.drill_id = d.id
GROUP BY d.id, d.name, d.pillar, d.difficulty;

-- Drop and recreate challenge_leaderboard view without SECURITY DEFINER  
DROP VIEW IF EXISTS public.challenge_leaderboard;

CREATE OR REPLACE VIEW public.challenge_leaderboard AS
SELECT 
  cp.challenge_id,
  cp.user_id,
  cp.player_id,
  cp.team_name,
  cp.current_score,
  cp.swings_completed,
  cp.baseline_score,
  CASE 
    WHEN cp.baseline_score IS NOT NULL AND cp.baseline_score > 0 
    THEN ROUND(((cp.current_score - cp.baseline_score) / cp.baseline_score) * 100, 2)
    ELSE 0
  END AS improvement_percentage,
  p.first_name,
  p.last_name,
  pr.first_name AS user_first_name,
  pr.last_name AS user_last_name,
  ROW_NUMBER() OVER (PARTITION BY cp.challenge_id ORDER BY cp.current_score DESC) AS rank
FROM challenge_participants cp
LEFT JOIN players p ON cp.player_id = p.id
LEFT JOIN profiles pr ON cp.user_id = pr.id;