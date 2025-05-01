
-- Add onboarded field to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT false;
