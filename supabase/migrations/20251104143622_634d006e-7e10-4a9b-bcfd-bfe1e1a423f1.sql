-- Fix function search path security issue (drop trigger first)
DROP TRIGGER IF EXISTS on_user_login ON auth.users;
DROP FUNCTION IF EXISTS update_user_last_active();

CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET last_active_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at)
  EXECUTE FUNCTION update_user_last_active();