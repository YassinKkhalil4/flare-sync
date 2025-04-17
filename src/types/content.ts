
export interface ContentPost {
  id: string;
  user_id: string;
  title: string;
  body?: string;
  media_urls?: string[];
  status: ContentStatus;
  scheduled_for?: string;
  platform: SocialPlatform;
  platform_post_id?: string;
  reviewer_id?: string;
  reviewer_notes?: string;
  created_at: string;
  updated_at: string;
  tags?: ContentTag[];
}

export type ContentStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'scheduled' | 'published' | 'failed' | 'pending_approval';

export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'facebook' | 'twitch';

export interface ContentTag {
  id: string;
  name: string;
  created_at: string;
}

export interface ContentApproval {
  id: string;
  post_id: string;
  approver_id: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
  // Additional fields for Supabase join queries
  content_posts?: ContentPost;
  profiles?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}
