
-- Enable RLS on all tables that don't have it yet and create comprehensive policies
-- This version handles existing policies by using IF NOT EXISTS or DROP IF EXISTS

-- Enable RLS on tables that don't have it
ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_captions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_plan_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_approval_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer functions (replace if exists)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role LIKE 'admin%'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop existing policies if they exist and recreate them
-- Profiles table policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- Content posts policies
DROP POLICY IF EXISTS "Users can view own content posts" ON public.content_posts;
DROP POLICY IF EXISTS "Users can create own content posts" ON public.content_posts;
DROP POLICY IF EXISTS "Users can update own content posts" ON public.content_posts;
DROP POLICY IF EXISTS "Users can delete own content posts" ON public.content_posts;
DROP POLICY IF EXISTS "Admins can view all content posts" ON public.content_posts;

CREATE POLICY "Users can view own content posts" ON public.content_posts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own content posts" ON public.content_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own content posts" ON public.content_posts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own content posts" ON public.content_posts
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all content posts" ON public.content_posts
  FOR ALL USING (public.is_admin());

-- Social profiles policies
DROP POLICY IF EXISTS "Users can view own social profiles" ON public.social_profiles;
DROP POLICY IF EXISTS "Users can update own social profiles" ON public.social_profiles;
DROP POLICY IF EXISTS "Users can insert own social profiles" ON public.social_profiles;
DROP POLICY IF EXISTS "Users can manage own social profiles" ON public.social_profiles;
DROP POLICY IF EXISTS "Admins can view all social profiles" ON public.social_profiles;

CREATE POLICY "Users can view own social profiles" ON public.social_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own social profiles" ON public.social_profiles
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all social profiles" ON public.social_profiles
  FOR SELECT USING (public.is_admin());

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Notification preferences policies
CREATE POLICY "Users can view own notification preferences" ON public.notification_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notification preferences" ON public.notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can create notification preferences" ON public.notification_preferences
  FOR INSERT WITH CHECK (true);

-- Messages policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can update read status of their messages" ON public.messages;

CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create messages in their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_id = auth.uid()
    ) AND user_id = auth.uid()
  );

-- Conversations policies
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON public.conversations;

CREATE POLICY "Users can view own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own conversations" ON public.conversations
  FOR ALL USING (auth.uid() = user_id);

-- Brand deals policies
DROP POLICY IF EXISTS "Brands can view deals they created" ON public.brand_deals;
DROP POLICY IF EXISTS "Creators can view deals they're involved in" ON public.brand_deals;
DROP POLICY IF EXISTS "Brands can insert new deals" ON public.brand_deals;
DROP POLICY IF EXISTS "Brands can update their deals" ON public.brand_deals;
DROP POLICY IF EXISTS "Creators can update status of their deals" ON public.brand_deals;

CREATE POLICY "Brands can view deals they created" ON public.brand_deals
  FOR SELECT USING (auth.uid() = brand_id);
CREATE POLICY "Creators can view deals they're involved in" ON public.brand_deals
  FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Brands can create deals" ON public.brand_deals
  FOR INSERT WITH CHECK (auth.uid() = brand_id);
CREATE POLICY "Brands can update their deals" ON public.brand_deals
  FOR UPDATE USING (auth.uid() = brand_id);
CREATE POLICY "Creators can update deal status" ON public.brand_deals
  FOR UPDATE USING (auth.uid() = creator_id);

-- Create policies for remaining tables
CREATE POLICY "Users can view deals they're involved in" ON public.deals
  FOR SELECT USING (auth.uid() = creator_id OR auth.uid() = brand_id);
CREATE POLICY "Users can create deals" ON public.deals
  FOR INSERT WITH CHECK (auth.uid() = creator_id OR auth.uid() = brand_id);
CREATE POLICY "Users can update deals they're involved in" ON public.deals
  FOR UPDATE USING (auth.uid() = creator_id OR auth.uid() = brand_id);

CREATE POLICY "Users can view own scheduled posts" ON public.scheduled_posts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own scheduled posts" ON public.scheduled_posts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own AI captions" ON public.ai_captions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own AI captions" ON public.ai_captions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own engagement predictions" ON public.engagement_predictions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own engagement predictions" ON public.engagement_predictions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own content plans" ON public.content_plans
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own content plans" ON public.content_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own content plan posts" ON public.content_plan_posts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own content plan posts" ON public.content_plan_posts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own assistant conversations" ON public.assistant_conversations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own assistant conversations" ON public.assistant_conversations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages in their assistant conversations" ON public.assistant_messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM public.assistant_conversations WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create messages in their assistant conversations" ON public.assistant_messages
  FOR INSERT WITH CHECK (
    conversation_id IN (
      SELECT id FROM public.assistant_conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own API keys" ON public.user_api_keys
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own API keys" ON public.user_api_keys
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view approvals for their content" ON public.content_approvals
  FOR SELECT USING (
    post_id IN (
      SELECT id FROM public.content_posts WHERE user_id = auth.uid()
    ) OR auth.uid() = approver_id
  );
CREATE POLICY "Approvers can create content approvals" ON public.content_approvals
  FOR INSERT WITH CHECK (auth.uid() = approver_id);
CREATE POLICY "Approvers can update their approvals" ON public.content_approvals
  FOR UPDATE USING (auth.uid() = approver_id);

CREATE POLICY "Users can view own approval flows" ON public.content_approval_flows
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own approval flows" ON public.content_approval_flows
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create invoices" ON public.invoices
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage subscriptions" ON public.subscriptions
  FOR ALL WITH CHECK (true);

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can view content tags" ON public.content_tags
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage content tags" ON public.content_tags
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view tags for accessible posts" ON public.content_post_tags
  FOR SELECT USING (
    post_id IN (
      SELECT id FROM public.content_posts WHERE user_id = auth.uid()
    ) OR public.is_admin()
  );
CREATE POLICY "Users can manage tags for their posts" ON public.content_post_tags
  FOR ALL USING (
    post_id IN (
      SELECT id FROM public.content_posts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view plan features" ON public.plan_features
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage plan features" ON public.plan_features
  FOR ALL USING (public.is_admin());

CREATE POLICY "Only admins can access admin roles" ON public.admin_roles
  FOR ALL USING (public.is_admin());

CREATE POLICY "Only admins can access admin permissions" ON public.admin_permissions
  FOR ALL USING (public.is_admin());

CREATE POLICY "Only admins can access admin access logs" ON public.admin_access_logs
  FOR ALL USING (public.is_admin());

CREATE POLICY "Only admins can access test results" ON public.test_results
  FOR ALL USING (public.is_admin());
