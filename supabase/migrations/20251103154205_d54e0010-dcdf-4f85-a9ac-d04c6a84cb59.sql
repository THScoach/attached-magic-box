-- Add metadata column to leads table for storing IP address and other bot detection data
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;