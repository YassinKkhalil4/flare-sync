
import { supabase } from '@/integrations/supabase/client';

export interface SocialProfile {
  id: string;
  platform: string;
  username: string;
  connected: boolean;
  followers: number;
  posts: number;
  engagement: number;
  last_synced: string;
}

export class SocialMediaService {
  static async getSocialProfiles(userId: string): Promise<SocialProfile[]> {
    const { data, error } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }

  static async connectInstagram(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Generate Instagram OAuth URL
    const clientId = 'your-instagram-client-id'; // This should be in environment
    const redirectUri = `${window.location.origin}/social-connect`;
    const scope = 'user_profile,user_media';
    
    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&state=${user.id}`;
    
    window.location.href = authUrl;
  }

  static async connectTwitter(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // This would implement Twitter OAuth flow
    // For now, we'll simulate the connection
    await this.simulateConnection(user.id, 'twitter');
  }

  static async connectTikTok(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // This would implement TikTok OAuth flow
    await this.simulateConnection(user.id, 'tiktok');
  }

  static async connectYouTube(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // This would implement YouTube OAuth flow
    await this.simulateConnection(user.id, 'youtube');
  }

  private static async simulateConnection(userId: string, platform: string): Promise<void> {
    const { error } = await supabase
      .from('social_profiles')
      .upsert({
        user_id: userId,
        platform,
        username: `user_${platform}`,
        connected: true,
        followers: Math.floor(Math.random() * 10000),
        posts: Math.floor(Math.random() * 100),
        engagement: parseFloat((Math.random() * 5 + 1).toFixed(1)),
        last_synced: new Date().toISOString(),
      });

    if (error) throw error;
  }

  static async disconnectPlatform(profileId: string): Promise<void> {
    const { error } = await supabase
      .from('social_profiles')
      .update({ connected: false })
      .eq('id', profileId);

    if (error) throw error;
  }

  static async syncPlatformData(platform: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('User not authenticated');

    try {
      await supabase.functions.invoke(`sync-${platform}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
    } catch (error) {
      console.error(`Failed to sync ${platform} data:`, error);
      throw error;
    }
  }
}
