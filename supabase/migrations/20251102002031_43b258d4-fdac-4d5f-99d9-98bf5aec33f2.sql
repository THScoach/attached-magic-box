-- Create calendar_items table for storing various scheduled items
CREATE TABLE IF NOT EXISTS public.calendar_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  player_id UUID,
  coach_id UUID,
  item_type TEXT NOT NULL, -- 'program', 'assessment', 'habit', 'coaching', 'tracking', 'form', 'tools', 'communication', 'event'
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  duration INTEGER, -- in minutes
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'missed'
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb, -- for storing type-specific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calendar_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own calendar items
CREATE POLICY "Users can view their own calendar items"
ON public.calendar_items
FOR SELECT
USING (auth.uid() = user_id);

-- Coaches can view their athletes' calendar items
CREATE POLICY "Coaches can view their athletes' calendar items"
ON public.calendar_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_rosters tr
    WHERE tr.coach_id = auth.uid()
    AND tr.athlete_id = calendar_items.user_id
    AND tr.is_active = true
  )
);

-- Coaches can create calendar items for their athletes
CREATE POLICY "Coaches can create calendar items for athletes"
ON public.calendar_items
FOR INSERT
WITH CHECK (
  auth.uid() = coach_id
  AND EXISTS (
    SELECT 1 FROM team_rosters tr
    WHERE tr.coach_id = auth.uid()
    AND tr.athlete_id = calendar_items.user_id
    AND tr.is_active = true
  )
);

-- Coaches can update calendar items for their athletes
CREATE POLICY "Coaches can update their athletes' calendar items"
ON public.calendar_items
FOR UPDATE
USING (
  auth.uid() = coach_id
  OR (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM team_rosters tr
      WHERE tr.coach_id = calendar_items.coach_id
      AND tr.athlete_id = auth.uid()
      AND tr.is_active = true
    )
  )
);

-- Users can update their own calendar items (mark complete, etc.)
CREATE POLICY "Users can update their own calendar items"
ON public.calendar_items
FOR UPDATE
USING (auth.uid() = user_id);

-- Coaches can delete calendar items for their athletes
CREATE POLICY "Coaches can delete their athletes' calendar items"
ON public.calendar_items
FOR DELETE
USING (auth.uid() = coach_id);

-- Create index for better query performance
CREATE INDEX idx_calendar_items_user_date ON public.calendar_items(user_id, scheduled_date);
CREATE INDEX idx_calendar_items_player_date ON public.calendar_items(player_id, scheduled_date);
CREATE INDEX idx_calendar_items_coach ON public.calendar_items(coach_id);

-- Add trigger for updated_at
CREATE TRIGGER update_calendar_items_updated_at
  BEFORE UPDATE ON public.calendar_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();