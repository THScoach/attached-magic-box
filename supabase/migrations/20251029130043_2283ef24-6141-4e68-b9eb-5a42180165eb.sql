-- Add video type and drill feedback to swing_analyses
ALTER TABLE public.swing_analyses 
ADD COLUMN video_type TEXT NOT NULL DEFAULT 'analysis' CHECK (video_type IN ('analysis', 'drill')),
ADD COLUMN drill_feedback JSONB DEFAULT NULL,
ADD COLUMN drill_effectiveness_score NUMERIC DEFAULT NULL;

-- Create drill feedback notes table
CREATE TABLE public.drill_feedback_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id UUID NOT NULL REFERENCES swing_analyses(id) ON DELETE CASCADE,
  conversation JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.drill_feedback_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own drill feedback"
ON public.drill_feedback_notes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own drill feedback"
ON public.drill_feedback_notes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own drill feedback"
ON public.drill_feedback_notes FOR UPDATE
USING (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_drill_feedback_notes_user_id ON public.drill_feedback_notes(user_id);
CREATE INDEX idx_drill_feedback_notes_analysis_id ON public.drill_feedback_notes(analysis_id);

-- Trigger for updated_at
CREATE TRIGGER update_drill_feedback_notes_updated_at
BEFORE UPDATE ON public.drill_feedback_notes
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();