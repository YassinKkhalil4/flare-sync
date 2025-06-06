
-- Create test_results table for storing test execution results
CREATE TABLE IF NOT EXISTS public.test_results (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    test_id text NOT NULL,
    test_name text NOT NULL,
    category text NOT NULL,
    status text NOT NULL CHECK (status IN ('pending', 'running', 'passed', 'failed')),
    duration integer DEFAULT 0,
    error_message text,
    executed_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- Only admins can read test results
CREATE POLICY "Admin users can view test results" ON public.test_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role LIKE 'admin%'
        )
    );

-- Only admins can insert test results
CREATE POLICY "Admin users can insert test results" ON public.test_results
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role LIKE 'admin%'
        )
    );

-- Add updated_at trigger
CREATE TRIGGER update_test_results_updated_at
    BEFORE UPDATE ON public.test_results
    FOR EACH ROW
    EXECUTE FUNCTION public.update_timestamp();
