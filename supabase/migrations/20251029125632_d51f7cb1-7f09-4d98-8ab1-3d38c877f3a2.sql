-- Create training programs table (4-week programs tied to analyses)
CREATE TABLE public.training_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id UUID NOT NULL REFERENCES swing_analyses(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL GENERATED ALWAYS AS (start_date + INTERVAL '28 days') STORED,
  is_active BOOLEAN NOT NULL DEFAULT true,
  focus_pillar TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create program check-ins table (daily completions)
CREATE TABLE public.program_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  drills_completed TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(program_id, checkin_date)
);

-- Create gamification tracking table
CREATE TABLE public.user_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_checkins INTEGER NOT NULL DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  last_checkin_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;

-- RLS Policies for training_programs
CREATE POLICY "Users can view their own programs"
ON public.training_programs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own programs"
ON public.training_programs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own programs"
ON public.training_programs FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for program_checkins
CREATE POLICY "Users can view their own checkins"
ON public.program_checkins FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own checkins"
ON public.program_checkins FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checkins"
ON public.program_checkins FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for user_gamification
CREATE POLICY "Users can view their own gamification"
ON public.user_gamification FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own gamification"
ON public.user_gamification FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gamification"
ON public.user_gamification FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_training_programs_user_id ON public.training_programs(user_id);
CREATE INDEX idx_training_programs_analysis_id ON public.training_programs(analysis_id);
CREATE INDEX idx_program_checkins_program_id ON public.program_checkins(program_id);
CREATE INDEX idx_program_checkins_user_id ON public.program_checkins(user_id);

-- Trigger for updated_at
CREATE TRIGGER update_training_programs_updated_at
BEFORE UPDATE ON public.training_programs
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_gamification_updated_at
BEFORE UPDATE ON public.user_gamification
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();