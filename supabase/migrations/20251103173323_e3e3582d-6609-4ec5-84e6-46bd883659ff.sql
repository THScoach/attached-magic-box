-- Add whop_user_id to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'whop_user_id') THEN
    ALTER TABLE profiles ADD COLUMN whop_user_id TEXT;
    CREATE INDEX IF NOT EXISTS idx_profiles_whop_user_id ON profiles(whop_user_id);
  END IF;
END $$;