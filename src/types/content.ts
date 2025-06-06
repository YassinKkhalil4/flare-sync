
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
}

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
  size: number;
}
