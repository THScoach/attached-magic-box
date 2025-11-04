-- Create team challenges table
CREATE TABLE public.team_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('most_swings', 'highest_score', 'most_improved', 'consistency', 'specific_metric')),
  metric_target TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  prizes JSONB DEFAULT '[]'::JSONB,
  rules TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenge participants table
CREATE TABLE public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.team_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  player_id UUID REFERENCES public.players(id),
  team_name TEXT,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_score NUMERIC DEFAULT 0,
  current_rank INTEGER,
  baseline_score NUMERIC,
  swings_completed INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE,
  UNIQUE(challenge_id, user_id)
);

-- Create challenge leaderboard view
CREATE OR REPLACE VIEW challenge_leaderboard AS
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

-- Enable RLS
ALTER TABLE public.team_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- Challenges policies
CREATE POLICY "Coaches can create challenges"
  ON public.team_challenges
  FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update their challenges"
  ON public.team_challenges
  FOR UPDATE
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can delete their challenges"
  ON public.team_challenges
  FOR DELETE
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can view their challenges"
  ON public.team_challenges
  FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Athletes can view public challenges they participate in"
  ON public.team_challenges
  FOR SELECT
  USING (
    is_public = true AND EXISTS (
      SELECT 1 FROM challenge_participants cp
      WHERE cp.challenge_id = team_challenges.id
        AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Athletes can view challenges from their coach"
  ON public.team_challenges
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_rosters tr
      WHERE tr.coach_id = team_challenges.coach_id
        AND tr.athlete_id = auth.uid()
        AND tr.is_active = true
    )
  );

-- Participants policies
CREATE POLICY "Coaches can add participants to their challenges"
  ON public.challenge_participants
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_challenges tc
      WHERE tc.id = challenge_id
        AND tc.coach_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can update participants in their challenges"
  ON public.challenge_participants
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_challenges tc
      WHERE tc.id = challenge_id
        AND tc.coach_id = auth.uid()
    )
  );

CREATE POLICY "Athletes can view their own participation"
  ON public.challenge_participants
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Athletes can view all participants in challenges they're in"
  ON public.challenge_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM challenge_participants cp2
      WHERE cp2.challenge_id = challenge_participants.challenge_id
        AND cp2.user_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can view participants in their challenges"
  ON public.challenge_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_challenges tc
      WHERE tc.id = challenge_id
        AND tc.coach_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_team_challenges_coach ON public.team_challenges(coach_id);
CREATE INDEX idx_team_challenges_status ON public.team_challenges(status);
CREATE INDEX idx_team_challenges_dates ON public.team_challenges(start_date, end_date);
CREATE INDEX idx_challenge_participants_challenge ON public.challenge_participants(challenge_id);
CREATE INDEX idx_challenge_participants_user ON public.challenge_participants(user_id);
CREATE INDEX idx_challenge_participants_score ON public.challenge_participants(challenge_id, current_score DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_team_challenges_updated_at
  BEFORE UPDATE ON public.team_challenges
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Function to update challenge status based on dates
CREATE OR REPLACE FUNCTION update_challenge_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE team_challenges
  SET status = 'active'
  WHERE status = 'upcoming'
    AND start_date <= now()
    AND end_date > now();
    
  UPDATE team_challenges
  SET status = 'completed'
  WHERE status = 'active'
    AND end_date <= now();
END;
$$;

-- Function to update participant scores from swing analyses
CREATE OR REPLACE FUNCTION update_challenge_participant_score(
  _challenge_id UUID,
  _user_id UUID,
  _player_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  challenge_record RECORD;
  new_score NUMERIC;
  swing_count INTEGER;
BEGIN
  SELECT * INTO challenge_record
  FROM team_challenges
  WHERE id = _challenge_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Calculate score based on challenge type
  CASE challenge_record.challenge_type
    WHEN 'most_swings' THEN
      SELECT COUNT(*), 0 INTO swing_count, new_score
      FROM swing_analyses
      WHERE user_id = _user_id
        AND (_player_id IS NULL OR player_id = _player_id)
        AND created_at BETWEEN challenge_record.start_date AND challenge_record.end_date;
      new_score := swing_count;
      
    WHEN 'highest_score' THEN
      SELECT COUNT(*), COALESCE(MAX(overall_score), 0) INTO swing_count, new_score
      FROM swing_analyses
      WHERE user_id = _user_id
        AND (_player_id IS NULL OR player_id = _player_id)
        AND created_at BETWEEN challenge_record.start_date AND challenge_record.end_date;
        
    WHEN 'most_improved' THEN
      WITH baseline AS (
        SELECT AVG(overall_score) as avg_score
        FROM swing_analyses
        WHERE user_id = _user_id
          AND (_player_id IS NULL OR player_id = _player_id)
          AND created_at < challenge_record.start_date
        LIMIT 10
      ),
      current AS (
        SELECT AVG(overall_score) as avg_score
        FROM swing_analyses
        WHERE user_id = _user_id
          AND (_player_id IS NULL OR player_id = _player_id)
          AND created_at BETWEEN challenge_record.start_date AND challenge_record.end_date
      )
      SELECT 
        COALESCE(current.avg_score, 0) - COALESCE(baseline.avg_score, 0),
        (SELECT COUNT(*) FROM swing_analyses WHERE user_id = _user_id AND created_at BETWEEN challenge_record.start_date AND challenge_record.end_date)
      INTO new_score, swing_count
      FROM baseline, current;
      
    WHEN 'consistency' THEN
      WITH scores AS (
        SELECT overall_score
        FROM swing_analyses
        WHERE user_id = _user_id
          AND (_player_id IS NULL OR player_id = _player_id)
          AND created_at BETWEEN challenge_record.start_date AND challenge_record.end_date
      )
      SELECT 
        100 - COALESCE(STDDEV(overall_score), 0),
        COUNT(*)
      INTO new_score, swing_count
      FROM scores;
      
    ELSE
      new_score := 0;
      swing_count := 0;
  END CASE;
  
  -- Update participant record
  UPDATE challenge_participants
  SET 
    current_score = new_score,
    swings_completed = swing_count,
    last_activity = now()
  WHERE challenge_id = _challenge_id
    AND user_id = _user_id;
    
  -- Update ranks
  WITH ranked AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (ORDER BY current_score DESC) as new_rank
    FROM challenge_participants
    WHERE challenge_id = _challenge_id
  )
  UPDATE challenge_participants cp
  SET current_rank = ranked.new_rank
  FROM ranked
  WHERE cp.id = ranked.id;
END;
$$;