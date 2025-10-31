-- Create content library table for admin uploaded content
CREATE TABLE IF NOT EXISTS public.content_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'document')),
  video_url TEXT,
  document_url TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;

-- Admins can manage all content
CREATE POLICY "Admins can manage content library"
  ON public.content_library
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Athletes can view active content
CREATE POLICY "Athletes can view active content"
  ON public.content_library
  FOR SELECT
  USING (is_active = true);

-- Trigger for updated_at
CREATE TRIGGER update_content_library_updated_at
  BEFORE UPDATE ON public.content_library
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('library-documents', 'library-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents
CREATE POLICY "Admins can upload documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'library-documents' 
    AND has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can update documents"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'library-documents' 
    AND has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can delete documents"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'library-documents' 
    AND has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Authenticated users can view documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'library-documents' 
    AND auth.role() = 'authenticated'
  );