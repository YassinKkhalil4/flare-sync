
// Mock data for scheduled posts

import { ScheduledPost } from '@/types/database';

// Helper to generate a date in the future
const getFutureDate = (daysAhead: number, hoursAhead: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(date.getHours() + hoursAhead);
  return date.toISOString();
};

// Generate random scheduled posts
export const generateMockScheduledPosts = (count: number = 10, userId: string): ScheduledPost[] => {
  const platforms = ['instagram', 'twitter', 'facebook', 'tiktok', 'youtube'];
  const statuses = ['scheduled', 'published', 'failed', 'cancelled'];
  const contentTemplates = [
    "Check out our new {product} that just launched! #excited #newproduct",
    "We're thrilled to announce our collaboration with {brand}! Stay tuned for more details. #partnership",
    "Behind the scenes look at our latest photoshoot for {brand}. Love how these came out! #behindthescenes",
    "Just dropped a new tutorial on how to {activity}. Link in bio! #tutorial #howto",
    "Q&A time! Drop your questions about {topic} below and I'll answer them in my next post.",
    "Today marks {number} years of this amazing journey. Thank you all for your support! #anniversary",
    "My top 5 tips for {activity} that changed my life. #tips #lifestyle",
    "Sneak peek of what's coming next week! Any guesses? #sneakpeek #comingsoon"
  ];
  
  const brands = ['Nike', 'Adidas', 'Puma', 'Under Armour', 'Lululemon', 'Reebok'];
  const products = ['sweater', 'shoes', 'workout set', 'hat', 'jacket', 'accessories'];
  const activities = ['staying fit', 'healthy eating', 'morning routine', 'productivity', 'self-care'];
  const topics = ['fitness', 'nutrition', 'mental health', 'style tips', 'travel hacks'];
  const numbers = ['one', 'two', 'three', 'five', 'ten'];
  
  const posts: ScheduledPost[] = [];
  
  for (let i = 0; i < count; i++) {
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const status = i < count - 2 ? 'scheduled' : statuses[Math.floor(Math.random() * statuses.length)];
    
    // Select random template and fill in variables
    let contentTemplate = contentTemplates[Math.floor(Math.random() * contentTemplates.length)];
    contentTemplate = contentTemplate.replace('{brand}', brands[Math.floor(Math.random() * brands.length)]);
    contentTemplate = contentTemplate.replace('{product}', products[Math.floor(Math.random() * products.length)]);
    contentTemplate = contentTemplate.replace('{activity}', activities[Math.floor(Math.random() * activities.length)]);
    contentTemplate = contentTemplate.replace('{topic}', topics[Math.floor(Math.random() * topics.length)]);
    contentTemplate = contentTemplate.replace('{number}', numbers[Math.floor(Math.random() * numbers.length)]);
    
    // Randomize scheduling
    const daysAhead = Math.floor(Math.random() * 14) + 1; // 1-14 days ahead
    const hoursAhead = Math.floor(Math.random() * 24); // 0-23 hours ahead
    
    const mockPost: ScheduledPost = {
      id: `mock-post-${i+1}`,
      user_id: userId,
      platform,
      status,
      content: contentTemplate,
      scheduled_for: getFutureDate(daysAhead, hoursAhead),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      media_urls: Math.random() > 0.3 ? [`https://picsum.photos/id/${10+i}/500/500`] : [],
      metadata: {
        hashtags: ['flare', 'content', 'social'],
        locationName: Math.random() > 0.5 ? 'New York City' : null
      }
    };
    
    // For "published" posts, add a post_id
    if (status === 'published') {
      mockPost.post_id = `platform-post-${100000 + i}`;
    }
    
    // For "failed" posts, add an error message
    if (status === 'failed') {
      mockPost.error_message = 'API rate limit exceeded. Please try again later.';
    }
    
    posts.push(mockPost);
  }
  
  // Sort by scheduled_for date
  return posts.sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime());
};

