-- Create practice_sessions table to group swings
CREATE TABLE IF NOT EXISTS public.practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  session_avg DECIMAL(5,2),
  total_swings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create swing_analyses table to store all swing results
CREATE TABLE IF NOT EXISTS public.swing_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  video_url TEXT,
  overall_score DECIMAL(5,2) NOT NULL,
  anchor_score DECIMAL(5,2) NOT NULL,
  engine_score DECIMAL(5,2) NOT NULL,
  whip_score DECIMAL(5,2) NOT NULL,
  metrics JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swing_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for practice_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.practice_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON public.practice_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.practice_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for swing_analyses
CREATE POLICY "Users can view their own analyses"
  ON public.swing_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analyses"
  ON public.swing_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enable Realtime for live session updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.practice_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.swing_analyses;

-- Add trigger for updated_at
CREATE TRIGGER handle_practice_sessions_updated_at
  BEFORE UPDATE ON public.practice_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_practice_sessions_user_id ON public.practice_sessions(user_id);
CREATE INDEX idx_practice_sessions_started_at ON public.practice_sessions(started_at DESC);
CREATE INDEX idx_swing_analyses_session_id ON public.swing_analyses(session_id);
CREATE INDEX idx_swing_analyses_user_id ON public.swing_analyses(user_id);
CREATE INDEX idx_swing_analyses_created_at ON public.swing_analyses(created_at DESC);