-- Fix function search_path warnings by recreating with CASCADE
DROP TRIGGER IF EXISTS admin_settings_updated_at ON admin_settings;
DROP FUNCTION IF EXISTS update_admin_settings_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_settings_updated_at();