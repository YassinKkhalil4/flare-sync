
-- Create the post_analytics table for tracking engagement metrics
CREATE TABLE public.post_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.content_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add missing columns to scheduled_posts table
ALTER TABLE public.scheduled_posts 
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS post_id UUID REFERENCES public.content_posts(id),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media-files',
  'media-files',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
);

-- Enable RLS on post_analytics
ALTER TABLE public.post_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for post_analytics
CREATE POLICY "Users can view their own post analytics" 
  ON public.post_analytics 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own post analytics" 
  ON public.post_analytics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own post analytics" 
  ON public.post_analytics 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create storage policies for media files
CREATE POLICY "Authenticated users can upload media files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media-files' AND auth.role() = 'authenticated');

CREATE POLICY "Public can view media files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media-files');

CREATE POLICY "Users can update their own media files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'media-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own media files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create trigger for updating post_analytics updated_at
CREATE OR REPLACE FUNCTION update_post_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_analytics_updated_at
    BEFORE UPDATE ON public.post_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_post_analytics_updated_at();
