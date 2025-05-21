
// Database types for Supabase integration

export interface Profile {
  id: string;
  updated_at: string;
  created_at: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  email: string;
  role: string | null;
  plan: string;
  onboarded: boolean;
}

export interface SocialProfile {
  id: string;
  user_id: string;
  platform: string;
  username: string;
  profile_url: string | null;
  access_token: string | null;
  refresh_token: string | null;
  connected: boolean;
  followers: number | null;
  engagement: number | null;
  stats: any | null;
  created_at: string;
  updated_at: string;
}

export interface ContentPost {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  media_urls: string[] | null;
  platform: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_for: string | null;
  published_at: string | null;
  metrics: any | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduledPost {
  id: string;
  user_id: string;
  content: string | null;
  media_urls: string[] | null;
  platform: string;
  scheduled_for: string;
  status: 'scheduled' | 'published' | 'failed' | 'cancelled';
  error_message: string | null;
  post_id: string | null;
  metadata: any | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_entity_type: string | null;
  related_entity_id: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  email_enabled: boolean;
  social_events_enabled: boolean;
  content_published_enabled: boolean;
  approval_requests_enabled: boolean;
  system_alerts_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  creator_id: string;
  brand_id: string;
  description: string;
  price: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface BrandDeal {
  id: string;
  brand_id: string;
  creator_id: string;
  title: string;
  description: string | null;
  budget: number;
  brand_name: string;
  brand_logo: string | null;
  requirements: string[] | null;
  deliverables: string[] | null;
  deadline: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  partner_id: string;
  partner_type: 'creator' | 'brand';
  partner_name: string;
  partner_avatar: string | null;
  last_message: string | null;
  last_message_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'partner';
  user_id: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  plan_id: string;
  status: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing';
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface AICaption {
  id: string;
  user_id: string;
  platform: string;
  niche: string | null;
  tone: string | null;
  post_type: string | null;
  objective: string | null;
  description: string | null;
  captions: string[];
  selected_caption: string | null;
  used_in_post_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EngagementPrediction {
  id: string;
  user_id: string;
  platform: string;
  content: string | null;
  post_time: string | null;
  media_urls: string[] | null;
  hashtags: string[] | null;
  predicted_likes: number | null;
  predicted_comments: number | null;
  predicted_shares: number | null;
  confidence_score: number | null;
  metadata: any | null;
  created_at: string;
  updated_at: string;
}

export interface AssistantConversation {
  id: string;
  user_id: string;
  topic: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssistantMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}
