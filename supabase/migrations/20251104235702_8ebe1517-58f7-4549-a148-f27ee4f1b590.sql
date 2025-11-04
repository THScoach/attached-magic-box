-- Create parent_guardians table to link parents with athletes
CREATE TABLE IF NOT EXISTS public.parent_guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID NOT NULL,
  athlete_id UUID NOT NULL,
  relationship TEXT NOT NULL CHECK (relationship IN ('parent', 'guardian', 'other')),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parent_user_id, athlete_id)
);

-- Enable RLS
ALTER TABLE public.parent_guardians ENABLE ROW LEVEL SECURITY;

-- Parents can view their own connections
CREATE POLICY "Parents can view their own athlete connections"
  ON public.parent_guardians
  FOR SELECT
  USING (auth.uid() = parent_user_id);

-- Coaches can view parent connections for their athletes
CREATE POLICY "Coaches can view parent connections for their athletes"
  ON public.parent_guardians
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_rosters tr
      WHERE tr.coach_id = auth.uid()
        AND tr.athlete_id = parent_guardians.athlete_id
        AND tr.is_active = true
    )
  );

-- Coaches can create parent connections for their athletes
CREATE POLICY "Coaches can create parent connections"
  ON public.parent_guardians
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_rosters tr
      WHERE tr.coach_id = auth.uid()
        AND tr.athlete_id = parent_guardians.athlete_id
        AND tr.is_active = true
    )
  );

-- Coaches can update parent connections for their athletes
CREATE POLICY "Coaches can update parent connections"
  ON public.parent_guardians
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_rosters tr
      WHERE tr.coach_id = auth.uid()
        AND tr.athlete_id = parent_guardians.athlete_id
        AND tr.is_active = true
    )
  );

-- Coaches can delete parent connections
CREATE POLICY "Coaches can delete parent connections"
  ON public.parent_guardians
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_rosters tr
      WHERE tr.coach_id = auth.uid()
        AND tr.athlete_id = parent_guardians.athlete_id
        AND tr.is_active = true
    )
  );

-- Create parent_coach_messages table for parent-coach communication
CREATE TABLE IF NOT EXISTS public.parent_coach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID NOT NULL,
  athlete_id UUID NOT NULL,
  coach_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  message_content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.parent_coach_messages ENABLE ROW LEVEL SECURITY;

-- Parents can view messages related to their athletes
CREATE POLICY "Parents can view their messages"
  ON public.parent_coach_messages
  FOR SELECT
  USING (
    auth.uid() = parent_user_id OR auth.uid() = coach_id
  );

-- Parents and coaches can send messages
CREATE POLICY "Parents and coaches can send messages"
  ON public.parent_coach_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND (
      auth.uid() = parent_user_id OR 
      (auth.uid() = coach_id AND EXISTS (
        SELECT 1 FROM team_rosters tr
        WHERE tr.coach_id = auth.uid()
          AND tr.athlete_id = parent_coach_messages.athlete_id
          AND tr.is_active = true
      ))
    )
  );

-- Users can update read status on their own messages
CREATE POLICY "Users can update message read status"
  ON public.parent_coach_messages
  FOR UPDATE
  USING (
    auth.uid() = parent_user_id OR auth.uid() = coach_id
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_parent_guardians_parent ON public.parent_guardians(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_parent_guardians_athlete ON public.parent_guardians(athlete_id);
CREATE INDEX IF NOT EXISTS idx_parent_messages_parent ON public.parent_coach_messages(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_parent_messages_athlete ON public.parent_coach_messages(athlete_id);
CREATE INDEX IF NOT EXISTS idx_parent_messages_coach ON public.parent_coach_messages(coach_id);