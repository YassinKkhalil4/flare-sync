// Define types that match our Supabase database schema
// These types will be used throughout the application

// User profiles
export interface Profile {
  id: string;
  email: string;
  full_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  role?: 'creator' | 'brand' | 'admin' | 'user' | null;
  plan?: string | null;
  stripe_customer_id?: string | null;
  subscription_id?: string | null;
  subscription_status?: string | null;
  current_period_end?: string | null;
  onboarded?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  name?: string | null; // Added name property for compatibility with existing components
}

// User roles
export interface UserRole {
  id: string;
  user_id: string;
  role: 'user' | 'creator' | 'brand' | 'admin';
  created_at?: string | null;
}

// Social profiles
export interface SocialProfile {
  id: string;
  user_id: string;
  platform: string;
  username: string;
  profile_url?: string | null;
  connected?: boolean | null;
  last_synced?: string | null;
  access_token?: string | null;
  refresh_token?: string | null;
  access_token_encrypted?: string | null;
  refresh_token_encrypted?: string | null;
  access_token_iv?: string | null;
  refresh_token_iv?: string | null;
  followers?: number | null;
  posts?: number | null;
  engagement?: number | null;
  stats?: any | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Notifications
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read?: boolean | null;
  related_entity_type?: string | null;
  related_entity_id?: string | null;
  image_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Notification preferences
export interface NotificationPreference {
  id: string;
  user_id: string;
  email_enabled?: boolean | null;
  social_events_enabled?: boolean | null;
  system_alerts_enabled?: boolean | null;
  approval_requests_enabled?: boolean | null;
  content_published_enabled?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Conversations
export interface Conversation {
  id: string;
  user_id: string;
  partner_id: string;
  partner_name: string;
  partner_avatar?: string | null;
  partner_type: string;
  last_message?: string | null;
  last_message_time?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Messages
export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  sender: string;
  content: string;
  timestamp?: string | null;
  read?: boolean | null;
}

// Content posts
export interface ContentPost {
  id: string;
  user_id: string;
  title: string;
  body?: string | null;
  status: string;
  platform: string;
  scheduled_for?: string | null;
  published_at?: string | null;
  media_urls?: string[] | null;
  platform_post_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  metrics?: any | null;
}

// Content tags
export interface ContentTag {
  id: string;
  name: string;
  created_at?: string | null;
}

// Content post tags junction
export interface ContentPostTag {
  post_id: string;
  tag_id: string;
}

// Content approvals
export interface ContentApproval {
  id: string;
  post_id: string;
  approver_id: string;
  status: string;
  feedback?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Scheduled posts
export interface ScheduledPost {
  id: string;
  user_id: string;
  content?: string | null;
  media_urls?: string[] | null;
  platform: string;
  scheduled_for: string;
  status: string;
  error_message?: string | null;
  post_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  metadata?: any | null;
}

// Assistant conversations
export interface AssistantConversation {
  id: string;
  user_id: string;
  topic?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Assistant messages
export interface AssistantMessage {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at?: string | null;
}

// AI captions
export interface AICaption {
  id: string;
  user_id: string;
  platform: string;
  niche?: string | null;
  tone?: string | null;
  post_type?: string | null;
  objective?: string | null;
  description?: string | null;
  captions?: string[] | null;
  selected_caption?: string | null;
  used_in_post_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Engagement predictions
export interface EngagementPrediction {
  id: string;
  user_id: string;
  content?: string | null;
  media_urls?: string[] | null;
  platform: string;
  post_time?: string | null;
  hashtags?: string[] | null;
  predicted_likes?: number | null;
  predicted_comments?: number | null;
  predicted_shares?: number | null;
  confidence_score?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  metadata?: any | null;
}

// Brand deals
export interface BrandDeal {
  id: string;
  brand_id: string;
  brand_name: string;
  brand_logo?: string | null;
  creator_id: string;
  title: string;
  description?: string | null;
  budget: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  requirements?: string[] | null;
  deliverables?: string[] | null;
  deadline?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Deals (simpler model)
export interface Deal {
  id: string;
  creator_id: string;
  brand_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  price: number;
  description: string;
  created_at?: string | null;
  updated_at?: string | null;
}

// Subscriptions
export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id?: string | null;
  plan_id: string;
  status: string;
  current_period_start?: string | null;
  current_period_end?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Transactions
export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string | null;
  payment_id?: string | null;
  description?: string | null;
  metadata?: any | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Invoices
export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  due_date?: string | null;
  paid_date?: string | null;
  payment_method?: string | null;
  payment_id?: string | null;
  pdf_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Admin permissions
export interface AdminPermission {
  id: string;
  admin_id: string;
  permission: string;
  created_at?: string | null;
}

// Admin access logs
export interface AdminAccessLog {
  id: string;
  admin_id: string;
  action: 'view' | 'update' | 'delete';
  resource_type: string;
  resource_id: string;
  access_time?: string | null;
}

// Content approval flows
export interface ContentApprovalFlow {
  id: string;
  name: string;
  user_id: string;
  approver_ids: string[];
  required_approvals: number;
  created_at?: string | null;
  updated_at?: string | null;
}
