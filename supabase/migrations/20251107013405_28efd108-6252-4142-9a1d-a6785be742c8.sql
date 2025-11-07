-- Create function to handle coach signup
CREATE OR REPLACE FUNCTION public.handle_coach_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user_type is 'coach' in metadata
  IF NEW.raw_user_meta_data->>'user_type' = 'coach' THEN
    -- Insert coach role into user_roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'coach'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run after user signup
DROP TRIGGER IF EXISTS on_coach_signup ON auth.users;

CREATE TRIGGER on_coach_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_coach_signup();