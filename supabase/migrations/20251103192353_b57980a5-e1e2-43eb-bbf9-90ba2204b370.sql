
-- Allow "practice" as a valid video_type in swing_analyses table
ALTER TABLE swing_analyses 
DROP CONSTRAINT IF EXISTS swing_analyses_video_type_check;

ALTER TABLE swing_analyses 
ADD CONSTRAINT swing_analyses_video_type_check 
CHECK (video_type IN ('analysis', 'drill', 'practice'));
