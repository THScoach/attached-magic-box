-- Drop the view that was flagged for security issues
DROP VIEW IF EXISTS public.progress_trends;

-- Instead of a view, we'll query the swing_analyses table directly from the frontend
-- This avoids security definer issues and gives us more flexibility