-- Create function to notify coaches when a new Whop athlete is synced
CREATE OR REPLACE FUNCTION public.notify_coaches_new_whop_athlete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only notify if this is a Whop user (has whop_user_id)
  IF NEW.whop_user_id IS NOT NULL THEN
    -- Insert notifications for all coaches
    INSERT INTO public.notifications (user_id, type, title, message)
    SELECT 
      ur.user_id,
      'athlete_synced',
      'New Athlete from Whop',
      'New athlete ' || COALESCE(NEW.whop_username, NEW.email) || ' synced from Whop. Add them using Whop ID: ' || NEW.whop_user_id
    FROM public.user_roles ur
    WHERE ur.role = 'coach'::app_role;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to notify coaches when new profiles with whop_user_id are created
DROP TRIGGER IF EXISTS on_new_whop_athlete ON public.profiles;

CREATE TRIGGER on_new_whop_athlete
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.whop_user_id IS NOT NULL)
  EXECUTE FUNCTION public.notify_coaches_new_whop_athlete();