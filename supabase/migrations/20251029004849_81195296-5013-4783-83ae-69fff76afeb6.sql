-- Create updated_at function first
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create knowledge_base table for coaching articles and tips
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create drills table
CREATE TABLE public.drills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  pillar TEXT NOT NULL CHECK (pillar IN ('ANCHOR', 'ENGINE', 'WHIP')),
  difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5),
  duration INTEGER NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drills ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view knowledge base"
  ON public.knowledge_base
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view drills"
  ON public.drills
  FOR SELECT
  USING (true);

-- Authenticated users can manage (for admin)
CREATE POLICY "Authenticated users can manage knowledge"
  ON public.knowledge_base
  FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage drills"
  ON public.drills
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Create triggers
CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_drills_updated_at
  BEFORE UPDATE ON public.drills
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data
INSERT INTO public.knowledge_base (title, content, category, tags) VALUES
  ('Understanding Ground Force', 'Ground force is the foundation of power in baseball hitting. A strong anchor means: 1) Wide, stable base 2) Weight transfer from back to front 3) Rotation through the legs 4) Consistent contact with ground throughout swing.', 'biomechanics', ARRAY['anchor', 'power', 'foundation']),
  ('Tempo and Timing', 'The ideal tempo ratio is between 1.5:1 and 2.5:1. This represents the load phase vs acceleration phase. Too quick = loss of power, too slow = timing issues.', 'technique', ARRAY['engine', 'timing', 'tempo']),
  ('Bat Speed Development', 'Bat speed comes from sequential acceleration: hips → torso → hands → bat. Energy leaks occur when this sequence is disrupted. Focus on connected rotation.', 'biomechanics', ARRAY['whip', 'bat-speed', 'sequencing']);

INSERT INTO public.drills (name, pillar, difficulty, duration, description, instructions) VALUES
  ('Medicine Ball Rotational Throws', 'ENGINE', 3, 15, 'Develop rotational power and hip-torso separation', 'Stand sideways to wall. Load and explosively rotate, throwing 8-10lb medicine ball into wall. Focus on hip-first movement. 3 sets of 10 each side.'),
  ('One-Leg Balance Swings', 'ANCHOR', 2, 10, 'Improve stability and weight transfer', 'Take soft toss while balanced on front leg only. Forces proper weight shift and stable base. Start with 20 swings, progress to 50.'),
  ('Bat Speed Trainer - Overload/Underload', 'WHIP', 4, 20, 'Increase bat speed through varied resistance', 'Alternate between heavy (overload) and light (underload) bats. 10 swings heavy, 10 swings light, 10 swings game bat. 3 rounds.');