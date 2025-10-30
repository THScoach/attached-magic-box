-- Phase 1: Activity Scheduler, GRIT Score Engine, Live Coaching, Teams Engine

-- 1. TEAM ROSTERS TABLE
CREATE TABLE IF NOT EXISTS public.team_rosters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_name TEXT,
  seats_purchased INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(coach_id, athlete_id)
);

ALTER TABLE public.team_rosters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view their roster"
ON public.team_rosters FOR SELECT
USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can manage their roster"
ON public.team_rosters FOR ALL
USING (auth.uid() = coach_id);

CREATE POLICY "Athletes can view their team assignments"
ON public.team_rosters FOR SELECT
USING (auth.uid() = athlete_id);

-- 2. SCHEDULED TASKS TABLE
CREATE TABLE IF NOT EXISTS public.scheduled_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_tier membership_tier NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('swing_upload', 'drill_block', 'live_coaching', 'check_in_form')),
  title TEXT NOT NULL,
  description TEXT,
  recurrence TEXT NOT NULL CHECK (recurrence IN ('daily', 'weekly', 'monthly')),
  due_day_of_week INTEGER CHECK (due_day_of_week BETWEEN 0 AND 6),
  due_time TIME,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.scheduled_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tasks"
ON public.scheduled_tasks FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage tasks"
ON public.scheduled_tasks FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. TASK COMPLETIONS TABLE
CREATE TABLE IF NOT EXISTS public.task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.scheduled_tasks(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'late', 'missed')),
  notes TEXT,
  submission_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, task_id, scheduled_date)
);

ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own task completions"
ON public.task_completions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own task completions"
ON public.task_completions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task completions"
ON public.task_completions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view their athletes' task completions"
ON public.task_completions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.team_rosters tr
    WHERE tr.coach_id = auth.uid()
    AND tr.athlete_id = task_completions.user_id
    AND tr.is_active = true
  )
);

-- 4. GRIT SCORES TABLE
CREATE TABLE IF NOT EXISTS public.grit_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  current_score NUMERIC DEFAULT 0 CHECK (current_score >= 0 AND current_score <= 100),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_tasks_assigned INTEGER DEFAULT 0,
  total_tasks_completed INTEGER DEFAULT 0,
  total_tasks_on_time INTEGER DEFAULT 0,
  last_completion_date DATE,
  streak_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create unique index for user/player combination (handles NULL player_id properly)
CREATE UNIQUE INDEX IF NOT EXISTS idx_grit_scores_user_player
ON public.grit_scores (user_id, COALESCE(player_id, '00000000-0000-0000-0000-000000000000'::UUID));

ALTER TABLE public.grit_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own GRIT scores"
ON public.grit_scores FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own GRIT scores"
ON public.grit_scores FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Coaches can view their athletes' GRIT scores"
ON public.grit_scores FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.team_rosters tr
    WHERE tr.coach_id = auth.uid()
    AND tr.athlete_id = grit_scores.user_id
    AND tr.is_active = true
  )
);

-- 5. LIVE COACHING SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.live_coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date DATE NOT NULL,
  session_time TIME NOT NULL DEFAULT '19:00:00',
  timezone TEXT DEFAULT 'America/Chicago',
  title TEXT NOT NULL,
  description TEXT,
  live_link TEXT,
  replay_url TEXT,
  replay_notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  submission_deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(session_date)
);

ALTER TABLE public.live_coaching_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view coaching sessions"
ON public.live_coaching_sessions FOR SELECT
USING (true);

CREATE POLICY "Admins can manage coaching sessions"
ON public.live_coaching_sessions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. SESSION SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.session_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.live_coaching_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES public.swing_analyses(id) ON DELETE SET NULL,
  feel_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_on_time BOOLEAN DEFAULT true,
  UNIQUE(session_id, user_id)
);

ALTER TABLE public.session_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own submissions"
ON public.session_submissions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own submissions"
ON public.session_submissions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches can view their athletes' submissions"
ON public.session_submissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.team_rosters tr
    WHERE tr.coach_id = auth.uid()
    AND tr.athlete_id = session_submissions.user_id
    AND tr.is_active = true
  )
);

-- 7. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_task_completions_user_date ON public.task_completions(user_id, scheduled_date DESC);
CREATE INDEX IF NOT EXISTS idx_task_completions_status ON public.task_completions(status);
CREATE INDEX IF NOT EXISTS idx_grit_scores_user ON public.grit_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_team_rosters_coach ON public.team_rosters(coach_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_team_rosters_athlete ON public.team_rosters(athlete_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_live_coaching_date ON public.live_coaching_sessions(session_date DESC);

-- 8. FUNCTION TO UPDATE GRIT SCORE
CREATE OR REPLACE FUNCTION public.update_grit_score(_user_id UUID, _player_id UUID DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_assigned INTEGER;
  total_completed INTEGER;
  total_on_time INTEGER;
  completion_pct NUMERIC;
  on_time_pct NUMERIC;
  new_grit NUMERIC;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status IN ('completed', 'late')),
    COUNT(*) FILTER (WHERE status = 'completed')
  INTO total_assigned, total_completed, total_on_time
  FROM task_completions
  WHERE user_id = _user_id
  AND (_player_id IS NULL OR player_id = _player_id);
  
  IF total_assigned > 0 THEN
    completion_pct := (total_completed::NUMERIC / total_assigned::NUMERIC) * 100;
    on_time_pct := (total_on_time::NUMERIC / total_assigned::NUMERIC) * 100;
    new_grit := ROUND((completion_pct * on_time_pct) / 100, 0);
  ELSE
    new_grit := 0;
  END IF;
  
  INSERT INTO grit_scores (
    user_id,
    player_id,
    current_score,
    total_tasks_assigned,
    total_tasks_completed,
    total_tasks_on_time
  )
  VALUES (
    _user_id,
    _player_id,
    new_grit,
    total_assigned,
    total_completed,
    total_on_time
  )
  ON CONFLICT ON CONSTRAINT idx_grit_scores_user_player
  DO UPDATE SET
    current_score = new_grit,
    total_tasks_assigned = total_assigned,
    total_tasks_completed = total_completed,
    total_tasks_on_time = total_on_time,
    updated_at = now();
END;
$$;

-- 9. TRIGGER TO UPDATE GRIT ON TASK COMPLETION
CREATE OR REPLACE FUNCTION public.handle_task_completion_grit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM update_grit_score(NEW.user_id, NEW.player_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_grit_on_completion ON public.task_completions;
CREATE TRIGGER update_grit_on_completion
AFTER INSERT OR UPDATE ON public.task_completions
FOR EACH ROW
EXECUTE FUNCTION public.handle_task_completion_grit();

-- 10. FUNCTION TO UPDATE STREAK
CREATE OR REPLACE FUNCTION public.update_streak(_user_id UUID, _player_id UUID DEFAULT NULL, _completed_on_time BOOLEAN DEFAULT true)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_grit_record RECORD;
  new_streak INTEGER;
BEGIN
  SELECT * INTO current_grit_record
  FROM grit_scores
  WHERE user_id = _user_id
  AND COALESCE(player_id, '00000000-0000-0000-0000-000000000000'::UUID) = COALESCE(_player_id, '00000000-0000-0000-0000-000000000000'::UUID);
  
  IF current_grit_record IS NULL THEN
    IF _completed_on_time THEN
      new_streak := 1;
    ELSE
      new_streak := 0;
    END IF;
    
    INSERT INTO grit_scores (user_id, player_id, current_streak, longest_streak, last_completion_date)
    VALUES (_user_id, _player_id, new_streak, new_streak, CURRENT_DATE);
  ELSE
    IF _completed_on_time THEN
      IF current_grit_record.last_completion_date = CURRENT_DATE - INTERVAL '1 day' OR
         current_grit_record.last_completion_date = CURRENT_DATE THEN
        new_streak := current_grit_record.current_streak + 1;
      ELSE
        new_streak := 1;
      END IF;
    ELSE
      new_streak := 0;
    END IF;
    
    UPDATE grit_scores
    SET 
      current_streak = new_streak,
      longest_streak = GREATEST(longest_streak, new_streak),
      last_completion_date = CURRENT_DATE,
      streak_updated_at = now()
    WHERE user_id = _user_id
    AND COALESCE(player_id, '00000000-0000-0000-0000-000000000000'::UUID) = COALESCE(_player_id, '00000000-0000-0000-0000-000000000000'::UUID);
  END IF;
END;
$$;