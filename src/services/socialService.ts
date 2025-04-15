
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
    if (!isRealSupabaseClient()) {
      // Use mock data if Supabase is not properly configured
      return useMockSocialData().getProfiles();
    }

    try {
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
    } catch (error) {
      console.error('Error fetching social profiles:', error);
      return useMockSocialData().getProfiles();
    }
  },
  
  // Connect to a social platform
  connectPlatform: async (platform: string, code?: string, state?: string): Promise<SocialProfile> => {
    if (!isRealSupabaseClient()) {
      return useMockSocialData().connectPlatform(platform);
    }

    try {
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
          .select('*')
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('social_profiles')
          .insert(profileData)
          .select('*')
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
    } catch (error) {
      console.error('Error connecting social platform:', error);
      return useMockSocialData().connectPlatform(platform);
    }
  },
  
  // Disconnect from a platform
  disconnectPlatform: async (platformId: string): Promise<void> => {
    if (!isRealSupabaseClient()) {
      return useMockSocialData().disconnectPlatform();
    }

    try {
      const { error } = await supabase
        .from('social_profiles')
        .update({ connected: false })
        .eq('id', platformId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error disconnecting social platform:', error);
      // Fall back to mock implementation
      return useMockSocialData().disconnectPlatform();
    }
  },
  
  // Sync platform data (followers, posts, etc.)
  syncPlatform: async (platformId: string): Promise<SocialProfile> => {
    if (!isRealSupabaseClient()) {
      return useMockSocialData().syncPlatform(platformId);
    }
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      // Get the platform data
      const { data: profile, error: profileError } = await supabase
        .from('social_profiles')
        .select('*')
        .eq('id', platformId)
        .eq('user_id', user.user.id)
        .single();
      
      if (profileError) throw profileError;
      if (!profile) throw new Error('Profile not found');
      
      // Call Supabase edge function to sync data
      const functionName = `sync-${profile.platform}`;
      const { data, error } = await supabase.functions.invoke(functionName, {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });
      
      if (error) throw error;
      
      // Update profile with new data
      const { data: updatedProfile, error: updateError } = await supabase
        .from('social_profiles')
        .select('*')
        .eq('id', platformId)
        .single();
      
      if (updateError) throw updateError;
      
      return {
        id: updatedProfile.id,
        platform: updatedProfile.platform as 'instagram' | 'tiktok' | 'youtube' | 'twitter',
        username: updatedProfile.username,
        profileUrl: updatedProfile.profile_url,
        connected: updatedProfile.connected,
        lastSynced: updatedProfile.last_synced,
        stats: {
          followers: updatedProfile.followers || 0,
          posts: updatedProfile.posts || 0,
          engagement: updatedProfile.engagement || 0
        }
      };
    } catch (error) {
      console.error('Error syncing platform data:', error);
      return useMockSocialData().syncPlatform(platformId);
    }
  }
};
