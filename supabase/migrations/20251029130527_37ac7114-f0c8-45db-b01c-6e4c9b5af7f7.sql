-- Update players table: change age to birth_date and split name
ALTER TABLE public.players 
DROP COLUMN age,
ADD COLUMN first_name TEXT NOT NULL DEFAULT '',
ADD COLUMN last_name TEXT NOT NULL DEFAULT '';

-- Copy existing name data to first_name temporarily
UPDATE public.players SET first_name = name;

-- Drop old name column
ALTER TABLE public.players DROP COLUMN name;

-- Update drills table to support both video uploads and links
ALTER TABLE public.drills
ADD COLUMN video_type TEXT CHECK (video_type IN ('upload', 'link', 'none')) DEFAULT 'none',
ADD COLUMN instructions_video_url TEXT,
ALTER COLUMN video_url DROP NOT NULL;

-- Add metadata for AI drill matching
ALTER TABLE public.drills
ADD COLUMN target_area TEXT, -- e.g., "Lower body stability", "Hip rotation", etc.
ADD COLUMN equipment_needed TEXT[], -- e.g., ["Bat", "Tee", "Medicine ball"]
ADD COLUMN skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced'));

-- Create indexes for better filtering
CREATE INDEX idx_players_last_name ON public.players(last_name);
CREATE INDEX idx_players_birth_date ON public.players(birth_date);
CREATE INDEX idx_drills_target_area ON public.drills(target_area);
CREATE INDEX idx_drills_skill_level ON public.drills(skill_level);