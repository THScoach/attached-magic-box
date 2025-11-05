-- Add 'live_action' to allowed video_type values in swing_analyses table
-- Current allowed values: 'analysis', 'drill', 'practice'
-- Adding 'live_action' to support game footage uploads

-- Drop the existing check constraint
ALTER TABLE swing_analyses 
DROP CONSTRAINT IF EXISTS swing_analyses_video_type_check;

-- Recreate with updated allowed values including 'live_action'
ALTER TABLE swing_analyses
ADD CONSTRAINT swing_analyses_video_type_check 
CHECK (video_type IN ('analysis', 'drill', 'practice', 'live_action'));