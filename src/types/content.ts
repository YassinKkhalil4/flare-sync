
export type ContentStatus = 'draft' | 'pending_approval' | 'scheduled' | 'published' | 'rejected';

export type SocialPlatform = 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'twitch';

export interface ContentTag {
  id: string;
  name: string;
  created_at?: string;
}

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

export interface ContentApprovalFlow {
  id: string;
  name: string;
  description?: string;
  required_approvers: number;
  created_at?: string;
  updated_at?: string;
}

export interface ContentApproval {
  id: string;
  post_id: string;
  approver_id?: string;
  status: 'approved' | 'rejected' | 'pending';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
