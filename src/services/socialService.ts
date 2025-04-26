
import { SocialProfile } from '../types/messaging';
import { supabase, isRealSupabaseClient } from '../lib/supabase';

// Mock social data implementation
const useMockSocialData = () => {
  return {
    getProfiles: async (): Promise<SocialProfile[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        {
          id: 'instagram-1',
          platform: 'instagram',
          username: 'creator_profile',
          profileUrl: 'https://instagram.com/creator_profile',
          connected: Boolean(localStorage.getItem('instagram_connected')),
          lastSynced: new Date().toISOString(),
          stats: {
            followers: 12500,
            posts: 78,
            engagement: 4.2
          }
        },
        {
          id: 'tiktok-1',
          platform: 'tiktok',
          username: 'creator_tiktok',
          profileUrl: 'https://tiktok.com/@creator_tiktok',
          connected: Boolean(localStorage.getItem('tiktok_connected')),
          lastSynced: new Date().toISOString(),
          stats: {
            followers: 25000,
            posts: 120,
            engagement: 5.7
          }
        },
        {
          id: 'twitter-1',
          platform: 'twitter',
          username: 'creator_twitter',
          profileUrl: 'https://twitter.com/creator_twitter',
          connected: Boolean(localStorage.getItem('twitter_connected')),
          lastSynced: new Date().toISOString(),
          stats: {
            followers: 8700,
            posts: 210,
            engagement: 3.5
          }
        },
        {
          id: 'youtube-1',
          platform: 'youtube',
          username: 'CreatorChannel',
          profileUrl: 'https://youtube.com/@CreatorChannel',
          connected: Boolean(localStorage.getItem('youtube_connected')),
          lastSynced: new Date().toISOString(),
          stats: {
            followers: 32000,
            posts: 45,
            engagement: 6.2
          }
        },
        {
          id: 'twitch-1',
          platform: 'twitch',
          username: 'creator_twitch',
          profileUrl: 'https://twitch.tv/creator_twitch',
          connected: Boolean(localStorage.getItem('twitch_connected')),
          lastSynced: new Date().toISOString(),
          stats: {
            followers: 4300,
            posts: 28,
            engagement: 7.8
          }
        }
      ];
    },
    
    connectPlatform: async (platform: string): Promise<SocialProfile> => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem(`${platform}_connected`, 'true');
      
      // Return platform-specific mock data
      const platformData: { [key: string]: SocialProfile } = {
        instagram: {
          id: 'instagram-1',
          platform: 'instagram',
          username: 'creator_profile',
          profileUrl: 'https://instagram.com/creator_profile',
          connected: true,
          lastSynced: new Date().toISOString(),
          stats: {
            followers: 12500,
            posts: 78,
            engagement: 4.2
          }
        },
        tiktok: {
          id: 'tiktok-1',
          platform: 'tiktok',
          username: 'creator_tiktok',
          profileUrl: 'https://tiktok.com/@creator_tiktok',
          connected: true,
          lastSynced: new Date().toISOString(),
          stats: {
            followers: 25000,
            posts: 120,
            engagement: 5.7
          }
        },
        twitter: {
          id: 'twitter-1',
          platform: 'twitter',
          username: 'creator_twitter',
          profileUrl: 'https://twitter.com/creator_twitter',
          connected: true,
          lastSynced: new Date().toISOString(),
          stats: {
            followers: 8700,
            posts: 210,
            engagement: 3.5
          }
        },
        youtube: {
          id: 'youtube-1',
          platform: 'youtube',
          username: 'CreatorChannel',
          profileUrl: 'https://youtube.com/@CreatorChannel',
          connected: true,
          lastSynced: new Date().toISOString(),
          stats: {
            followers: 32000,
            posts: 45,
            engagement: 6.2
          }
        },
        twitch: {
          id: 'twitch-1',
          platform: 'twitch',
          username: 'creator_twitch',
          profileUrl: 'https://twitch.tv/creator_twitch',
          connected: true,
          lastSynced: new Date().toISOString(),
          stats: {
            followers: 4300,
            posts: 28,
            engagement: 7.8
          }
        }
      };
      
      return platformData[platform] || {
        id: `${platform}-1`,
        platform: platform as any,
        username: `creator_${platform}`,
        profileUrl: `https://${platform}.com/creator_${platform}`,
        connected: true,
        lastSynced: new Date().toISOString(),
        stats: {
          followers: Math.floor(Math.random() * 50000) + 1000,
          posts: Math.floor(Math.random() * 200) + 10,
          engagement: parseFloat((Math.random() * 5 + 2).toFixed(1))
        }
      };
    },
    
    disconnectPlatform: async (): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real application, this would disconnect the platform
      // For our mock implementation, we'll just update localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.endsWith('_connected')) {
          localStorage.removeItem(key);
        }
      });
      return;
    },
    
    syncPlatform: async (platformId: string): Promise<SocialProfile> => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Extract platform from ID
      const platform = platformId.split('-')[0];
      
      // Generate random changes to make it look like data was synced
      const followerChange = Math.floor(Math.random() * 500) - 100; // Between -100 and 400
      const postsChange = Math.floor(Math.random() * 5); // Between 0 and 4
      const engagementChange = parseFloat((Math.random() * 0.6 - 0.2).toFixed(1)); // Between -0.2 and 0.4
      
      // Platform-specific base values
      const platformBaseValues: { [key: string]: { followers: number, posts: number, engagement: number } } = {
        instagram: { followers: 12500, posts: 78, engagement: 4.2 },
        tiktok: { followers: 25000, posts: 120, engagement: 5.7 },
        twitter: { followers: 8700, posts: 210, engagement: 3.5 },
        youtube: { followers: 32000, posts: 45, engagement: 6.2 },
        twitch: { followers: 4300, posts: 28, engagement: 7.8 }
      };
      
      const baseValues = platformBaseValues[platform] || { 
        followers: 10000, 
        posts: 50, 
        engagement: 4.0 
      };
      
      return {
        id: platformId,
        platform: platform as any,
        username: `creator_${platform}`,
        profileUrl: `https://${platform}.com/creator_${platform}`,
        connected: true,
        lastSynced: new Date().toISOString(),
        stats: {
          followers: Math.max(0, baseValues.followers + followerChange),
          posts: Math.max(0, baseValues.posts + postsChange),
          engagement: parseFloat((baseValues.engagement + engagementChange).toFixed(1))
        }
      };
    }
  };
};

// Social Media API using Supabase
export const SocialAPI = {
  // Get all connected social profiles
  getProfiles: async (): Promise<SocialProfile[]> => {
    // Always use mock data since the social_profiles table doesn't exist in the schema
    return useMockSocialData().getProfiles();
  },
  
  // Connect to a social platform
  connectPlatform: async (platform: string, code?: string, state?: string): Promise<SocialProfile> => {
    // Always use mock data since the social_profiles table doesn't exist in the schema
    return useMockSocialData().connectPlatform(platform);
  },
  
  // Disconnect from a platform
  disconnectPlatform: async (platformId: string): Promise<void> => {
    // Always use mock data since the social_profiles table doesn't exist in the schema
    return useMockSocialData().disconnectPlatform();
  },
  
  // Sync platform data (followers, posts, etc.)
  syncPlatform: async (platformId: string): Promise<SocialProfile> => {
    // Always use mock data since the social_profiles table doesn't exist in the schema
    return useMockSocialData().syncPlatform(platformId);
  }
};
