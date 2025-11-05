-- Enable realtime for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  browser_notifications BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  notify_on_messages BOOLEAN DEFAULT true,
  notify_on_achievements BOOLEAN DEFAULT true,
  notify_on_schedule BOOLEAN DEFAULT true,
  notify_on_reports BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own preferences
CREATE POLICY "Users can manage their own notification preferences"
  ON public.notification_preferences
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON public.notification_preferences(user_id);

-- Add trigger to update updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();