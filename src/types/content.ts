
import { ContentPost as DatabaseContentPost, ScheduledPost as DatabaseScheduledPost } from './database';

// Re-export types from database.ts with any additional properties needed
export interface ContentPost extends DatabaseContentPost {
  // Additional properties that might come from joins or front-end operations
  reviewer_id?: string;
  reviewer_notes?: string;
  tags?: {
    id: string;
    name: string;
    created_at?: string;
  }[];
}

export interface ScheduledPost extends DatabaseScheduledPost {
  // Add any additional front-end properties here
}

export type ContentStatus = 'draft' | 'pending' | 'pending_approval' | 'approved' | 'rejected' | 'scheduled' | 'published' | 'failed';
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
