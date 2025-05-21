
import { ContentStatus, SocialPlatform } from '@/types/content';

// Helper function to get recent dates
const getRecentDate = (daysAgo: number = 0, hoursAgo: number = 0, minutesAgo: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  date.setMinutes(date.getMinutes() - minutesAgo);
  return date.toISOString();
};

// Helper to get future dates
const getFutureDate = (daysAhead: number = 0, hoursAhead: number = 0, minutesAhead: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(date.getHours() + hoursAhead);
  date.setMinutes(date.getMinutes() + minutesAhead);
  return date.toISOString();
};

// Generate mock scheduled posts
export const generateMockScheduledPosts = (userId: string, count: number = 10) => {
  const posts = [];
  const platforms = ['instagram', 'tiktok', 'twitter', 'youtube'];
  const statuses: ContentStatus[] = ['scheduled', 'published', 'failed', 'cancelled'];
  
  // Ensure we always have at least 3-5 scheduled posts for better UI
  const minScheduledPosts = Math.min(count, 5);
  const scheduledCount = Math.max(3, Math.floor(count * 0.6));
  
  // First generate some scheduled posts
  for (let i = 0; i < scheduledCount; i++) {
    const platform = platforms[Math.floor(Math.random() * platforms.length)] as SocialPlatform;
    const daysAhead = Math.floor(Math.random() * 7) + 1; // 1-7 days ahead
    
    posts.push({
      id: `scheduled-${i + 1}`,
      user_id: userId,
      platform,
      status: 'scheduled',
      content: `This is a scheduled ${platform} post #${i + 1} with hashtags #creator #content #flareSync`,
      scheduled_for: getFutureDate(
        daysAhead, 
        Math.floor(Math.random() * 24),
        Math.floor(Math.random() * 60)
      ),
      created_at: getRecentDate(Math.floor(Math.random() * 7)),
      updated_at: getRecentDate(Math.floor(Math.random() * 3)),
      media_urls: [`https://picsum.photos/seed/${platform}${i}/400/400`],
      metadata: {
        caption_suggestions: ["Try this caption!", "Or maybe this one?"],
        engagement_prediction: {
          estimated_likes: Math.floor(Math.random() * 5000),
          estimated_comments: Math.floor(Math.random() * 500),
          confidence_score: Math.random() * 0.5 + 0.5 // 0.5 to 1.0
        }
      },
      error_message: null,
      post_id: null
    });
  }
  
  // Fill the rest with other status posts
  for (let i = scheduledCount; i < count; i++) {
    const platform = platforms[Math.floor(Math.random() * platforms.length)] as SocialPlatform;
    const statusIndex = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3 (published, failed, cancelled)
    const status = statuses[statusIndex];
    
    posts.push({
      id: `post-${i + 1}`,
      user_id: userId,
      platform,
      status,
      content: `This is a mock ${platform} post #${i + 1} with hashtags #creator #content #flareSync`,
      scheduled_for: status === 'published' ? getRecentDate(
        Math.floor(Math.random() * 7), 
        Math.floor(Math.random() * 24),
        Math.floor(Math.random() * 60)
      ) : getFutureDate(
        Math.floor(Math.random() * 7), 
        Math.floor(Math.random() * 24),
        Math.floor(Math.random() * 60)
      ),
      created_at: getRecentDate(Math.floor(Math.random() * 30)),
      updated_at: getRecentDate(Math.floor(Math.random() * 15)),
      media_urls: [`https://picsum.photos/seed/${platform}${i}/400/400`],
      metadata: {
        caption_suggestions: ["Try this caption!", "Or maybe this one?"],
        engagement_prediction: {
          estimated_likes: Math.floor(Math.random() * 5000),
          estimated_comments: Math.floor(Math.random() * 500),
          confidence_score: Math.random() * 0.5 + 0.5 // 0.5 to 1.0
        }
      },
      error_message: status === 'failed' ? 'API connection timeout' : null,
      post_id: status === 'published' ? `original-${platform}-${i}` : null
    });
  }
  
  // Sort posts by scheduled_for date
  return posts.sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime());
};
