
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
  // Map ContentStatus to ContentPost status values
  let contentStatus: 'draft' | 'scheduled' | 'published' | 'failed';
  
  switch (data.status) {
    case 'draft':
      contentStatus = 'draft';
      break;
    case 'scheduled':
      contentStatus = 'scheduled';
      break;
    case 'published':
      contentStatus = 'published';
      break;
    case 'failed':
      contentStatus = 'failed';
      break;
    default:
      // For all other statuses (pending, pending_approval, etc.), default to draft
      contentStatus = 'draft';
      break;
  }

  return {
    user_id: data.user_id || '',
    title: data.title,
    body: data.body,
    media_urls: data.media_urls || [],
    status: contentStatus,
    scheduled_for: data.scheduled_for || null,
    platform: data.platform,
    published_at: null,
    metrics: null
  };
}

// Helper function to convert PostFormData to ScheduledPost format
export function toScheduledPost(data: PostFormData): Partial<ScheduledPost> {
  // Map ContentStatus to ScheduledPost status values
  let scheduledStatus: 'pending' | 'published' | 'failed' | 'cancelled';
  
  switch (data.status) {
    case 'scheduled':
      scheduledStatus = 'pending';
      break;
    case 'published':
      scheduledStatus = 'published';
      break;
    case 'failed':
      scheduledStatus = 'failed';
      break;
    case 'cancelled':
      scheduledStatus = 'cancelled';
      break;
    default:
      // For all other statuses (draft, pending, etc.), default to pending
      scheduledStatus = 'pending';
      break;
  }
  
  return {
    user_id: data.user_id || '',
    content: data.body || data.content || '',
    platform: data.platform,
    scheduled_for: data.scheduled_for || new Date().toISOString(),
    status: scheduledStatus,
    metadata: {
      title: data.title,
      media_urls: data.media_urls || []
    }
  };
}
