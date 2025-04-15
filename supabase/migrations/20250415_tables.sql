
-- Create a profiles table to store user profiles
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    role TEXT NOT NULL CHECK (role IN ('creator', 'brand')),
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'pro')),
    avatar_url TEXT,
    stripe_customer_id TEXT,
    subscription_id TEXT,
    subscription_status TEXT,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Create social_profiles table for connected social accounts
CREATE TABLE public.social_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'twitter', 'twitch')),
    username TEXT NOT NULL,
    profile_url TEXT,
    connected BOOLEAN NOT NULL DEFAULT false,
    last_synced TIMESTAMP WITH TIME ZONE,
    access_token TEXT,
    refresh_token TEXT,
    followers INTEGER,
    posts INTEGER,
    engagement DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, platform)
);

-- Enable Row Level Security for social_profiles
ALTER TABLE public.social_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own social profiles
CREATE POLICY "Users can view their own social profiles" 
ON public.social_profiles FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for users to update their own social profiles
CREATE POLICY "Users can update their own social profiles" 
ON public.social_profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policy for serverless functions to insert social profiles
CREATE POLICY "Service role can insert social profiles" 
ON public.social_profiles FOR INSERT 
WITH CHECK (true);

-- Create conversations table for messaging system
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    partner_id TEXT NOT NULL,
    partner_name TEXT NOT NULL,
    partner_avatar TEXT,
    partner_type TEXT NOT NULL CHECK (partner_type IN ('creator', 'brand')),
    last_message TEXT,
    last_message_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own conversations
CREATE POLICY "Users can view their own conversations" 
ON public.conversations FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for users to update their own conversations
CREATE POLICY "Users can update their own conversations" 
ON public.conversations FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policy for users to insert their own conversations
CREATE POLICY "Users can insert their own conversations" 
ON public.conversations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create messages table for messaging system
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    read BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view messages in their conversations
CREATE POLICY "Users can view messages in their conversations" 
ON public.messages FOR SELECT 
USING (
    conversation_id IN (
        SELECT id FROM public.conversations WHERE user_id = auth.uid()
    )
);

-- Create policy for users to insert messages in their conversations
CREATE POLICY "Users can insert messages in their conversations" 
ON public.messages FOR INSERT 
WITH CHECK (
    conversation_id IN (
        SELECT id FROM public.conversations WHERE user_id = auth.uid()
    ) AND user_id = auth.uid()
);

-- Create policy for users to update read status of their messages
CREATE POLICY "Users can update read status of their messages" 
ON public.messages FOR UPDATE 
USING (
    conversation_id IN (
        SELECT id FROM public.conversations WHERE user_id = auth.uid()
    )
);

-- Create brand_deals table for brand deals
CREATE TABLE public.brand_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL,
    brand_logo TEXT,
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    budget DECIMAL NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')) DEFAULT 'pending',
    requirements TEXT[],
    deliverables TEXT[],
    deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security for brand_deals
ALTER TABLE public.brand_deals ENABLE ROW LEVEL SECURITY;

-- Create policy for brands to view deals they created
CREATE POLICY "Brands can view deals they created" 
ON public.brand_deals FOR SELECT 
USING (auth.uid() = brand_id);

-- Create policy for creators to view deals they're involved in
CREATE POLICY "Creators can view deals they're involved in" 
ON public.brand_deals FOR SELECT 
USING (auth.uid() = creator_id);

-- Create policy for brands to insert new deals
CREATE POLICY "Brands can insert new deals" 
ON public.brand_deals FOR INSERT 
WITH CHECK (auth.uid() = brand_id);

-- Create policy for brands to update their deals
CREATE POLICY "Brands can update their deals" 
ON public.brand_deals FOR UPDATE 
USING (auth.uid() = brand_id);

-- Create policy for creators to update status of their deals
CREATE POLICY "Creators can update status of their deals" 
ON public.brand_deals FOR UPDATE 
USING (auth.uid() = creator_id AND 
      (
          NEW.status = 'accepted' OR 
          NEW.status = 'rejected' OR 
          NEW.status = 'completed'
      ) AND
      (
          OLD.status = 'pending' OR
          (OLD.status = 'accepted' AND NEW.status = 'completed')
      )
);

-- Create storage bucket for user content
INSERT INTO storage.buckets (id, name, public) VALUES ('user-content', 'user-content', true);

-- Create policy to allow users to upload their own content
CREATE POLICY "Users can upload their own content"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-content' AND 
  (auth.uid() = owner OR owner IS NULL)
);

-- Create policy to allow public read access to user content
CREATE POLICY "Public can view user content"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-content');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles
CREATE TRIGGER update_profiles_timestamp
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create trigger for social_profiles
CREATE TRIGGER update_social_profiles_timestamp
BEFORE UPDATE ON public.social_profiles
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create trigger for conversations
CREATE TRIGGER update_conversations_timestamp
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create trigger for brand_deals
CREATE TRIGGER update_brand_deals_timestamp
BEFORE UPDATE ON public.brand_deals
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create trigger to create a profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'creator'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for creating profiles on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
