
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
