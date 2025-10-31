-- Create table for Coach Rick messages
CREATE TABLE IF NOT EXISTS public.coach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('motivation', 'accountability', 'micro_tip')),
  trigger_reason TEXT,
  message_content TEXT NOT NULL,
  cta_text TEXT,
  cta_action TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster queries
CREATE INDEX idx_coach_messages_user_id ON public.coach_messages(user_id);
CREATE INDEX idx_coach_messages_created_at ON public.coach_messages(created_at DESC);
CREATE INDEX idx_coach_messages_is_read ON public.coach_messages(is_read) WHERE is_read = false;

-- Enable RLS
ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own coach messages"
  ON public.coach_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own coach messages"
  ON public.coach_messages FOR UPDATE
  USING (auth.uid() = user_id);

-- Table for message preferences
CREATE TABLE IF NOT EXISTS public.coach_message_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  muted_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coach_message_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own preferences"
  ON public.coach_message_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Table for tracking last user activity
CREATE TABLE IF NOT EXISTS public.user_activity_tracking (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_swing_upload TIMESTAMP WITH TIME ZONE,
  last_task_completion TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_activity_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own activity"
  ON public.user_activity_tracking FOR SELECT
  USING (auth.uid() = user_id);

-- Enable realtime for coach messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.coach_messages;