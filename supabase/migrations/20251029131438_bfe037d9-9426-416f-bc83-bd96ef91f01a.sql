-- Add height and weight columns to players table
ALTER TABLE public.players
ADD COLUMN height numeric,
ADD COLUMN weight numeric;

COMMENT ON COLUMN public.players.height IS 'Player height in inches';
COMMENT ON COLUMN public.players.weight IS 'Player weight in pounds';