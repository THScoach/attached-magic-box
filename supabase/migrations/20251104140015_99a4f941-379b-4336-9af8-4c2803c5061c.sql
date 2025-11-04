-- Add throws field to players table for pitching hand
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS throws text 
CHECK (throws IN ('right', 'left', 'both'));

-- Add comment for clarity
COMMENT ON COLUMN public.players.throws IS 'Which hand the player throws with (right, left, or both)';