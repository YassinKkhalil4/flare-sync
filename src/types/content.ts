
export interface ScheduledPost {
  id: string;
  title: string;
  content?: string;
  platform: string;
  scheduled_for: string;
  status: 'pending' | 'published' | 'failed' | 'cancelled';
  media_urls?: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
  post_id?: string;
  error_message?: string;
  metadata?: any;
}

export interface ContentPost {
  id: string;
  title: string;
  body?: string;
  platform: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_for?: string;
  published_at?: string;
  media_urls?: string[];
  user_id: string;
  created_at: string;
  updated_at: string;
  platform_post_id?: string;
  metrics?: any;
  tags?: { id: string; name: string }[];
}

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  size: number;
}

export interface ContentApproval {
  id: string;
  post_id: string;
  approver_id: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  created_at: string;
  updated_at: string;
  content_posts?: {
    id: string;
    title: string;
    body: string;
    platform: string;
    media_urls?: string[];
    created_at: string;
  };
}

export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook' | 'twitch';

export type ContentStatus = 'draft' | 'pending' | 'pending_approval' | 'scheduled' | 'published' | 'failed' | 'cancelled';
