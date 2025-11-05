-- Fix function search path mutable warning
-- Add SET search_path to the trigger function

CREATE OR REPLACE FUNCTION public.update_coaching_notes_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;