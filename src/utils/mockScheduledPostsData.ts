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
  
  for (let i = 0; i < count; i++) {
    const platform = platforms[Math.floor(Math.random() * platforms.length)] as SocialPlatform;
    // Adjust status probabilities to have more upcoming scheduled posts
    const statusIndex = Math.random() < 0.6 ? 0 : Math.floor(Math.random() * statuses.length);
    const status = statuses[statusIndex];
    
    const isScheduled = status === 'scheduled';
    const scheduledDate = isScheduled ? getFutureDate(
      Math.floor(Math.random() * 7), 
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 60)
    ) : getRecentDate(
      Math.floor(Math.random() * 7), 
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 60)
    );
    
    posts.push({
      id: `post-${i + 1}`,
      user_id: userId,
      platform,
      status,
      content: `This is a mock ${platform} post #${i + 1} with hashtags #creator #content #flareSync`,
      scheduled_for: scheduledDate,
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
