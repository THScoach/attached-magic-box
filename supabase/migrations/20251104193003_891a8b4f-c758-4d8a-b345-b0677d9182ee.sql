-- Create practice journal entries table
CREATE TABLE public.practice_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  player_id UUID REFERENCES public.players(id),
  session_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  entry_type TEXT NOT NULL DEFAULT 'general' CHECK (entry_type IN ('general', 'pre_session', 'post_session', 'drill_notes')),
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'frustrated', 'tired')),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  focus_level INTEGER CHECK (focus_level >= 1 AND focus_level <= 5),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  voice_recorded BOOLEAN DEFAULT false,
  related_analysis_id UUID REFERENCES public.swing_analyses(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.practice_journal ENABLE ROW LEVEL SECURITY;

-- Users can view their own journal entries
CREATE POLICY "Users can view their own journal entries"
  ON public.practice_journal
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own journal entries
CREATE POLICY "Users can create their own journal entries"
  ON public.practice_journal
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own journal entries
CREATE POLICY "Users can update their own journal entries"
  ON public.practice_journal
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own journal entries
CREATE POLICY "Users can delete their own journal entries"
  ON public.practice_journal
  FOR DELETE
  USING (auth.uid() = user_id);

-- Coaches can view their athletes' journal entries
CREATE POLICY "Coaches can view their athletes' journal entries"
  ON public.practice_journal
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_rosters tr
      WHERE tr.coach_id = auth.uid()
        AND tr.athlete_id = practice_journal.user_id
        AND tr.is_active = true
    )
  );

-- Create index for performance
CREATE INDEX idx_practice_journal_user_date ON public.practice_journal(user_id, session_date DESC);
CREATE INDEX idx_practice_journal_player ON public.practice_journal(player_id) WHERE player_id IS NOT NULL;

-- Create updated_at trigger
CREATE TRIGGER update_practice_journal_updated_at
  BEFORE UPDATE ON public.practice_journal
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();