
import { supabase } from '@/integrations/supabase/client';

export interface SocialPlatformConfig {
  platform: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
  authUrl: string;
}

export interface SocialProfile {
  id: string;
  platform: string;
  username: string;
  connected: boolean;
  followers?: number;
  posts?: number;
  engagement?: number;
  profile_url?: string;
  last_synced?: string;
}

export class SocialPlatformService {
  private static configs: Record<string, SocialPlatformConfig> = {
    instagram: {
      platform: 'instagram',
      clientId: '', // Will be loaded from secrets
      clientSecret: '',
      redirectUri: `${window.location.origin}/social-connect/callback`,
      scope: 'user_profile,user_media',
      authUrl: 'https://api.instagram.com/oauth/authorize'
    },
    twitter: {
      platform: 'twitter',
      clientId: '',
      clientSecret: '',
      redirectUri: `${window.location.origin}/social-connect/callback`,
      scope: 'tweet.read tweet.write users.read offline.access',
      authUrl: 'https://twitter.com/i/oauth2/authorize'
    },
    facebook: {
      platform: 'facebook',
      clientId: '',
      clientSecret: '',
      redirectUri: `${window.location.origin}/social-connect/callback`,
      scope: 'pages_manage_posts,pages_read_engagement',
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth'
    },
    tiktok: {
      platform: 'tiktok',
      clientId: '',
      clientSecret: '',
      redirectUri: `${window.location.origin}/social-connect/callback`,
      scope: 'user.info.basic,video.list',
      authUrl: 'https://www.tiktok.com/auth/authorize'
    },
    youtube: {
      platform: 'youtube',
      clientId: '',
      clientSecret: '',
      redirectUri: `${window.location.origin}/social-connect/callback`,
      scope: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth'
    }
  };

  static async getUserProfiles(userId: string): Promise<SocialProfile[]> {
    const { data, error } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching social profiles:', error);
      return [];
    }

    return data || [];
  }

  static async connectPlatform(platform: string): Promise<{ success: boolean; authUrl?: string; error?: string }> {
    try {
      const config = this.configs[platform];
      if (!config) {
        return { success: false, error: 'Platform not supported' };
      }

      // Get the current session for the state parameter
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        return { success: false, error: 'Authentication required' };
      }

      // Check if platform credentials are configured
      const { data, error } = await supabase.functions.invoke('check-platform-config', {
        body: { platform }
      });

      if (error || !data?.configured) {
        return { 
          success: false, 
          error: `${platform.charAt(0).toUpperCase() + platform.slice(1)} API credentials need to be configured. Please contact your administrator.` 
        };
      }

      // Update config with actual client ID
      config.clientId = data.client_id;

      // Construct OAuth URL
      const authUrl = this.buildAuthUrl(config, session.access_token);
      
      // Redirect to platform OAuth
      window.location.href = authUrl;
      
      return { success: true, authUrl };
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
      return { success: false, error: `Failed to connect to ${platform}` };
    }
  }

  private static buildAuthUrl(config: SocialPlatformConfig, state: string): string {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scope,
      response_type: 'code',
      state: encodeURIComponent(state)
    });

    // Platform-specific parameters
    if (config.platform === 'twitter') {
      params.append('code_challenge', 'challenge');
      params.append('code_challenge_method', 'plain');
    } else if (config.platform === 'youtube') {
      params.append('access_type', 'offline');
    }

    return `${config.authUrl}?${params.toString()}`;
  }

  static async handleCallback(platform: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke(`${platform}-auth`, {
        body: { code }
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error(`Error handling ${platform} callback:`, error);
      return { success: false, error: `Failed to complete ${platform} connection` };
    }
  }

  static async disconnectPlatform(platform: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('social_profiles')
        .update({ 
          connected: false, 
          access_token: null, 
          refresh_token: null,
          access_token_encrypted: null,
          refresh_token_encrypted: null,
          access_token_iv: null,
          refresh_token_iv: null
        })
        .eq('user_id', user.id)
        .eq('platform', platform);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error(`Error disconnecting ${platform}:`, error);
      return { success: false, error: `Failed to disconnect ${platform}` };
    }
  }

  static async syncPlatformData(platform: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke(`sync-${platform}`, {
        body: {}
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error(`Error syncing ${platform} data:`, error);
      return { success: false, error: `Failed to sync ${platform} data` };
    }
  }

  static async publishPost(platform: string, postData: {
    content: string;
    media_urls?: string[];
    scheduled_for?: string;
  }): Promise<{ success: boolean; platformPostId?: string; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke(`post-to-${platform}`, {
        body: postData
      });

      if (error) throw error;

      return { success: true, platformPostId: data?.post_id };
    } catch (error) {
      console.error(`Error publishing to ${platform}:`, error);
      return { success: false, error: `Failed to publish to ${platform}` };
    }
  }

  static async getAnalytics(platform: string, timeRange: string = '30d'): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('get-platform-analytics', {
        body: { platform, timeRange }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching ${platform} analytics:`, error);
      return null;
    }
  }

  static getSupportedPlatforms(): string[] {
    return Object.keys(this.configs);
  }

  static isPlatformSupported(platform: string): boolean {
    return platform in this.configs;
  }
}
