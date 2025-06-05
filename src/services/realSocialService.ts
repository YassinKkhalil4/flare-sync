
import { supabase } from '@/integrations/supabase/client';
import { SocialProfile } from '@/types/messaging';

export class RealSocialService {
  static async connectPlatform(platform: string, authCode: string): Promise<SocialProfile> {
    const { data, error } = await supabase.functions.invoke('connect-social-platform', {
      body: { platform, authCode }
    });

    if (error) throw error;
    return data;
  }

  static async disconnectPlatform(platform: string): Promise<void> {
    const { data, error } = await supabase
      .from('social_profiles')
      .update({ connected: false, access_token: null, refresh_token: null })
      .eq('platform', platform);

    if (error) throw error;
  }

  static async getUserProfiles(userId: string): Promise<SocialProfile[]> {
    const { data, error } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }

  static async syncPlatformData(platform: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('sync-platform-data', {
        body: { platform }
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  static async getAnalytics(platform: string, timeRange: string = '30d'): Promise<any> {
    const { data, error } = await supabase.functions.invoke('get-platform-analytics', {
      body: { platform, timeRange }
    });

    if (error) throw error;
    return data;
  }
}
