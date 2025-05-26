
import { SocialProfile } from '../types/messaging';
import { supabase } from '../integrations/supabase/client';

// Social Media API using Supabase
export const SocialAPI = {
  // Get all connected social profiles
  getProfiles: async (): Promise<SocialProfile[]> => {
    try {
      const { data: profiles, error } = await supabase
        .from('social_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return profiles?.map(profile => ({
        id: profile.id,
        platform: profile.platform as any,
        username: profile.username,
        profileUrl: profile.profile_url,
        connected: profile.connected,
        lastSynced: profile.last_synced,
        stats: {
          followers: profile.followers || 0,
          posts: profile.posts || 0,
          engagement: Number(profile.engagement) || 0
        }
      })) || [];
    } catch (error) {
      console.error('Error fetching social profiles:', error);
      throw error;
    }
  },
  
  // Connect to a social platform
  connectPlatform: async (platform: string): Promise<SocialProfile> => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('social_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', platform)
        .single();

      if (existingProfile) {
        // Return existing profile
        return {
          id: existingProfile.id,
          platform: existingProfile.platform as any,
          username: existingProfile.username,
          profileUrl: existingProfile.profile_url,
          connected: existingProfile.connected,
          lastSynced: existingProfile.last_synced,
          stats: {
            followers: existingProfile.followers || 0,
            posts: existingProfile.posts || 0,
            engagement: Number(existingProfile.engagement) || 0
          }
        };
      }

      // Create new profile placeholder (will be updated by OAuth callback)
      const { data: newProfile, error } = await supabase
        .from('social_profiles')
        .insert({
          user_id: user.id,
          platform,
          username: `connecting_${platform}`,
          connected: false
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: newProfile.id,
        platform: newProfile.platform as any,
        username: newProfile.username,
        profileUrl: newProfile.profile_url,
        connected: newProfile.connected,
        lastSynced: newProfile.last_synced,
        stats: {
          followers: newProfile.followers || 0,
          posts: newProfile.posts || 0,
          engagement: Number(newProfile.engagement) || 0
        }
      };
    } catch (error) {
      console.error(`Error connecting ${platform}:`, error);
      throw error;
    }
  },
  
  // Disconnect from a platform
  disconnectPlatform: async (platformId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('social_profiles')
        .update({ 
          connected: false,
          access_token: null,
          refresh_token: null
        })
        .eq('id', platformId);

      if (error) throw error;
    } catch (error) {
      console.error('Error disconnecting platform:', error);
      throw error;
    }
  },
  
  // Sync platform data (followers, posts, etc.)
  syncPlatform: async (platformId: string): Promise<SocialProfile> => {
    try {
      // Get current profile
      const { data: profile, error: fetchError } = await supabase
        .from('social_profiles')
        .select('*')
        .eq('id', platformId)
        .single();

      if (fetchError) throw fetchError;

      // Call appropriate sync function based on platform
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No session');

      let syncResponse;
      switch (profile.platform) {
        case 'instagram':
          syncResponse = await supabase.functions.invoke('sync-instagram', {
            headers: { Authorization: `Bearer ${session.access_token}` }
          });
          break;
        case 'twitter':
          syncResponse = await supabase.functions.invoke('sync-twitter', {
            headers: { Authorization: `Bearer ${session.access_token}` }
          });
          break;
        case 'tiktok':
          syncResponse = await supabase.functions.invoke('sync-tiktok', {
            headers: { Authorization: `Bearer ${session.access_token}` }
          });
          break;
        case 'youtube':
          syncResponse = await supabase.functions.invoke('sync-youtube', {
            headers: { Authorization: `Bearer ${session.access_token}` }
          });
          break;
        case 'twitch':
          syncResponse = await supabase.functions.invoke('sync-twitch', {
            headers: { Authorization: `Bearer ${session.access_token}` }
          });
          break;
        default:
          throw new Error(`Sync not supported for platform: ${profile.platform}`);
      }

      if (syncResponse.error) throw syncResponse.error;

      // Fetch updated profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from('social_profiles')
        .select('*')
        .eq('id', platformId)
        .single();

      if (updateError) throw updateError;

      return {
        id: updatedProfile.id,
        platform: updatedProfile.platform as any,
        username: updatedProfile.username,
        profileUrl: updatedProfile.profile_url,
        connected: updatedProfile.connected,
        lastSynced: updatedProfile.last_synced,
        stats: {
          followers: updatedProfile.followers || 0,
          posts: updatedProfile.posts || 0,
          engagement: Number(updatedProfile.engagement) || 0
        }
      };
    } catch (error) {
      console.error('Error syncing platform data:', error);
      throw error;
    }
  }
};
