
export interface ContentPost {
  id: string;
  user_id: string;
  title: string;
  body?: string;
  platform: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_for?: string;
  published_at?: string;
  media_urls?: string[];
  platform_post_id?: string;
  metrics?: any;
  created_at: string;
  updated_at: string;
  tags?: ContentTag[];
}

export interface ContentPlan {
  id: string;
  user_id: string;
  name: string;
  content: string;
  goal: string;
  platforms: string[];
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduledPost {
  id: string;
  user_id: string;
  content: string;
  platform: string;
  scheduled_for: string;
  status: 'scheduled' | 'published' | 'failed' | 'cancelled';
  metadata?: any;
  created_at: string;
  updated_at: string;
  title?: string;
  body?: string;
}

export interface ContentApproval {
  id: string;
  post_id: string;
  approver_id: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  created_at: string;
  updated_at: string;
  content_posts?: ContentPost;
}

export interface ContentTag {
  id: string;
  name: string;
  created_at: string;
}

export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook' | 'twitch';

export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'failed' | 'pending' | 'pending_approval' | 'cancelled';
