-- Drop and recreate the view without security definer
DROP VIEW IF EXISTS challenge_leaderboard;

CREATE VIEW challenge_leaderboard AS
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
    THEN ROUND(((cp.current_score - cp.baseline_score) / cp.baseline_score * 100)::NUMERIC, 2)
    ELSE 0
  END as improvement_percentage,
  p.first_name,
  p.last_name,
  pr.first_name as user_first_name,
  pr.last_name as user_last_name,
  ROW_NUMBER() OVER (PARTITION BY cp.challenge_id ORDER BY cp.current_score DESC) as rank
FROM challenge_participants cp
LEFT JOIN players p ON cp.player_id = p.id
LEFT JOIN profiles pr ON cp.user_id = pr.id;