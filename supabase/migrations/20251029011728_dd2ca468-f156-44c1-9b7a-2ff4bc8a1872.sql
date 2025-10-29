-- Create a storage bucket for swing analysis videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('swing-videos', 'swing-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload videos (for demo purposes)
CREATE POLICY "Anyone can upload swing videos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'swing-videos');

-- Allow anyone to view swing videos
CREATE POLICY "Anyone can view swing videos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'swing-videos');