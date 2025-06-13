
-- Create the brand_deals table for brand collaboration offers
CREATE TABLE public.brand_deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL,
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(10,2) NOT NULL,
  brand_name TEXT NOT NULL,
  brand_logo TEXT,
  requirements TEXT[],
  deliverables TEXT[],
  deadline TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on brand_deals
ALTER TABLE public.brand_deals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for brand_deals
CREATE POLICY "Creators can view deals sent to them" 
  ON public.brand_deals 
  FOR SELECT 
  USING (auth.uid() = creator_id);

CREATE POLICY "Brands can view deals they created" 
  ON public.brand_deals 
  FOR SELECT 
  USING (auth.uid() = brand_id);

CREATE POLICY "Brands can create deals" 
  ON public.brand_deals 
  FOR INSERT 
  WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Creators can update deals sent to them" 
  ON public.brand_deals 
  FOR UPDATE 
  USING (auth.uid() = creator_id);

CREATE POLICY "Brands can update deals they created" 
  ON public.brand_deals 
  FOR UPDATE 
  USING (auth.uid() = brand_id);

-- Create trigger for updating brand_deals updated_at
CREATE TRIGGER brand_deals_updated_at
    BEFORE UPDATE ON public.brand_deals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add missing columns to profiles table for better user data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'creator',
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT;

-- Add missing columns to content_posts table
ALTER TABLE public.content_posts 
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT '{}'::jsonb;
