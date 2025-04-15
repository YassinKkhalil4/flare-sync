
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
      localStorage.setItem('instagram_connected', 'true');
      return {
        id: 'instagram-1',
        platform: 'instagram' as 'instagram',
        username: 'creator_profile',
        profileUrl: 'https://instagram.com/creator_profile',
        connected: true
      };
    },
    
    disconnectPlatform: async (): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.removeItem('instagram_connected');
      return;
    }
  };
};

// Social Media API using Supabase
export const SocialAPI = {
  // Get all connected social profiles
  getProfiles: async (): Promise<SocialProfile[]> => {
    if (!isRealSupabaseClient()) {
      // Use mock data if Supabase is not properly configured
      return useMockSocialData().getProfiles();
    }

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('user_id', user.user.id);
    
    if (error) throw error;
    
    return data.map(profile => ({
      id: profile.id,
      platform: profile.platform as 'instagram' | 'tiktok' | 'youtube' | 'twitter',
      username: profile.username,
      profileUrl: profile.profile_url,
      connected: profile.connected,
      lastSynced: profile.last_synced || undefined,
      stats: profile.followers ? {
        followers: profile.followers,
        posts: profile.posts || 0,
        engagement: profile.engagement || 0
      } : undefined
    }));
  },
  
  // Connect to a social platform
  connectPlatform: async (platform: string, code: string, state: string): Promise<SocialProfile> => {
    if (!isRealSupabaseClient()) {
      return useMockSocialData().connectPlatform(platform);
    }

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');
    
    // In a real implementation, this would exchange the code for an access token
    // For now, we'll simulate this process
    
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('platform', platform)
      .maybeSingle();
    
    const profileData = {
      user_id: user.user.id,
      platform,
      username: platform === 'instagram' ? 'creator_profile' : 'username',
      profile_url: `https://${platform}.com/creator_profile`,
      connected: true,
      last_synced: new Date().toISOString(),
      access_token: 'mock_access_token',
      followers: 12500,
      posts: 78,
      engagement: 4.2
    };
    
    let result;
    
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('social_profiles')
        .update({
          connected: true,
          last_synced: new Date().toISOString(),
          access_token: 'mock_access_token'
        })
        .eq('id', existingProfile.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('social_profiles')
        .insert(profileData)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    return {
      id: result.id,
      platform: result.platform as 'instagram' | 'tiktok' | 'youtube' | 'twitter',
      username: result.username,
      profileUrl: result.profile_url,
      connected: result.connected,
      lastSynced: result.last_synced || undefined,
      stats: {
        followers: result.followers || 0,
        posts: result.posts || 0,
        engagement: result.engagement || 0
      }
    };
  },
  
  // Disconnect from a platform
  disconnectPlatform: async (platformId: string): Promise<void> => {
    if (!isRealSupabaseClient()) {
      return useMockSocialData().disconnectPlatform();
    }

    const { error } = await supabase
      .from('social_profiles')
      .update({ connected: false })
      .eq('id', platformId);
    
    if (error) throw error;
  }
};
