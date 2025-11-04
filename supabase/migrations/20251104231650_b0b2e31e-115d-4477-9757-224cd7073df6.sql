-- Create coaching notes table for private coach observations
CREATE TABLE IF NOT EXISTS public.coaching_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL,
  player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  analysis_id UUID REFERENCES public.swing_analyses(id) ON DELETE SET NULL,
  note_content TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'general' CHECK (note_type IN ('general', 'swing_analysis', 'progress', 'concern', 'strength', 'goal')),
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_coaching_notes_coach_athlete ON public.coaching_notes(coach_id, athlete_id);
CREATE INDEX idx_coaching_notes_analysis ON public.coaching_notes(analysis_id) WHERE analysis_id IS NOT NULL;

-- Enable RLS
ALTER TABLE public.coaching_notes ENABLE ROW LEVEL SECURITY;

-- Coaches can create notes for their athletes
CREATE POLICY "Coaches can create notes for their athletes"
ON public.coaching_notes
FOR INSERT
WITH CHECK (
  auth.uid() = coach_id 
  AND EXISTS (
    SELECT 1 FROM team_rosters tr
    WHERE tr.coach_id = auth.uid()
    AND tr.athlete_id = coaching_notes.athlete_id
    AND tr.is_active = true
  )
);

-- Coaches can view their own notes
CREATE POLICY "Coaches can view their own notes"
ON public.coaching_notes
FOR SELECT
USING (auth.uid() = coach_id);

-- Coaches can update their own notes
CREATE POLICY "Coaches can update their own notes"
ON public.coaching_notes
FOR UPDATE
USING (auth.uid() = coach_id);

-- Coaches can delete their own notes
CREATE POLICY "Coaches can delete their own notes"
ON public.coaching_notes
FOR DELETE
USING (auth.uid() = coach_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_coaching_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_coaching_notes_updated_at
BEFORE UPDATE ON public.coaching_notes
FOR EACH ROW
EXECUTE FUNCTION update_coaching_notes_updated_at();