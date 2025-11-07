-- Update the trigger to also call the email notification function
CREATE OR REPLACE FUNCTION public.notify_coaches_new_whop_athlete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _whop_user_id text;
  _whop_username text;
  _email text;
BEGIN
  -- Only notify if this is a Whop user (has whop_user_id)
  IF NEW.whop_user_id IS NOT NULL THEN
    _whop_user_id := NEW.whop_user_id;
    _whop_username := NEW.whop_username;
    _email := NEW.email;
    
    -- Insert in-app notifications for all coaches
    INSERT INTO public.notifications (user_id, type, title, message)
    SELECT 
      ur.user_id,
      'athlete_synced',
      'New Athlete from Whop',
      'New athlete ' || COALESCE(NEW.whop_username, NEW.email) || ' synced from Whop. Add them using Whop ID: ' || NEW.whop_user_id
    FROM public.user_roles ur
    WHERE ur.role = 'coach'::app_role;
    
    -- Call email notification function asynchronously
    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/notify-coach-whop-athlete-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_role_key')
      ),
      body := jsonb_build_object(
        'profile_id', NEW.id,
        'whop_user_id', _whop_user_id,
        'whop_username', _whop_username,
        'email', _email
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;