
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
        }
      ];
    },
    
    connectPlatform: async (platform: string): Promise<SocialProfile> => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem(`${platform}_connected`, 'true');
      return {
        id: `${platform}-1`,
        platform: platform as 'instagram',
        username: 'creator_profile',
        profileUrl: `https://${platform}.com/creator_profile`,
        connected: true
      };
    },
    
    disconnectPlatform: async (): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.removeItem('instagram_connected');
      return;
    },
    
    syncPlatform: async (platformId: string): Promise<SocialProfile> => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        id: platformId,
        platform: 'instagram',
        username: 'creator_profile',
        profileUrl: 'https://instagram.com/creator_profile',
        connected: true,
        lastSynced: new Date().toISOString(),
        stats: {
          followers: Math.floor(Math.random() * 2000) + 10000,
          posts: Math.floor(Math.random() * 10) + 70,
          engagement: parseFloat((Math.random() * 2 + 3).toFixed(1))
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
