
import { ContentPost, ScheduledPost, ContentStatus, SocialPlatform } from './content';

// PostFormData type that's compatible with both ContentPost and ScheduledPost
export interface PostFormData {
  user_id?: string;
  title: string;
  body: string;
  media_urls?: string[];
  status: ContentStatus;
  scheduled_for?: string;
  platform: SocialPlatform;
  content?: string; // For ScheduledPost compatibility
}

// Helper function to convert PostFormData to ContentPost format
export function toContentPost(data: PostFormData): Omit<ContentPost, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: data.user_id || '',
    title: data.title,
    body: data.body,
    media_urls: data.media_urls || [],
    status: data.status,
    scheduled_for: data.scheduled_for || null,
    platform: data.platform,
    published_at: null,
    platform_post_id: null,
    metrics: null
  };
}

// Helper function to convert PostFormData to ScheduledPost format
export function toScheduledPost(data: PostFormData): Partial<ScheduledPost> {
  const status = data.status === 'scheduled' ? 'scheduled' : 'draft';
  
  return {
    user_id: data.user_id || '',
    content: data.body || data.content || '',
    platform: data.platform,
    scheduled_for: data.scheduled_for || new Date().toISOString(),
    status: status,
    metadata: {
      title: data.title,
      media_urls: data.media_urls || []
    }
  };
}
