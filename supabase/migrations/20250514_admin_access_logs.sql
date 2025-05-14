
-- Create admin access logs table to track admin actions
CREATE TABLE IF NOT EXISTS public.admin_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('view', 'update', 'delete')),
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  access_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admin_access_logs
ALTER TABLE public.admin_access_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for admin_access_logs
CREATE POLICY "Admins can view all access logs"
ON public.admin_access_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
      AND role = 'admin'
  )
);

-- Create RLS policy for admin_access_logs inserts
CREATE POLICY "Admins can insert access logs"
ON public.admin_access_logs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
      AND role = 'admin'
  )
);
