-- Create players/athletes table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE,
  age INTEGER,
  handedness TEXT CHECK (handedness IN ('R', 'L', 'S')),
  position TEXT,
  team_name TEXT,
  organization TEXT,
  jersey_number TEXT,
  notes TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Users can view their own players
CREATE POLICY "Users can view their own players"
ON public.players
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own players
CREATE POLICY "Users can create their own players"
ON public.players
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own players
CREATE POLICY "Users can update their own players"
ON public.players
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own players
CREATE POLICY "Users can delete their own players"
ON public.players
FOR DELETE
USING (auth.uid() = user_id);

-- Add player_id to swing_analyses
ALTER TABLE public.swing_analyses
ADD COLUMN player_id UUID REFERENCES public.players(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_players_user_id ON public.players(user_id);
CREATE INDEX idx_players_team ON public.players(team_name);
CREATE INDEX idx_players_organization ON public.players(organization);
CREATE INDEX idx_swing_analyses_player_id ON public.swing_analyses(player_id);

-- Trigger for updated_at
CREATE TRIGGER update_players_updated_at
BEFORE UPDATE ON public.players
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();