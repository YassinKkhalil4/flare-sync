
import { supabase } from '@/integrations/supabase/client';

export interface PostAnalytics {
  id: string;
  post_id: string;
  platform: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
  engagement_rate: number;
  clicks: number;
  saves: number;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsOverview {
  total_posts: number;
  total_engagement: number;
  avg_engagement_rate: number;
  total_reach: number;
  total_impressions: number;
  growth_rate: number;
  best_performing_platform: string;
  recent_posts_performance: PostAnalytics[];
}

export class RealAnalyticsService {
  static async getPostAnalytics(postId: string): Promise<PostAnalytics | null> {
    const { data, error } = await supabase
      .from('post_analytics')
      .select('*')
      .eq('post_id', postId)
      .single();

    if (error) {
      console.error('Error fetching post analytics:', error);
      return null;
    }
    return data;
  }

  static async getOverviewAnalytics(userId: string, timeRange: string = '30d'): Promise<AnalyticsOverview> {
    try {
      const { data, error } = await supabase.functions.invoke('get-analytics-overview', {
        body: { userId, timeRange }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching analytics overview:', error);
      // Return basic structure if no data
      return {
        total_posts: 0,
        total_engagement: 0,
        avg_engagement_rate: 0,
        total_reach: 0,
        total_impressions: 0,
        growth_rate: 0,
        best_performing_platform: 'instagram',
        recent_posts_performance: []
      };
    }
  }

  static async getPlatformAnalytics(userId: string, platform: string, timeRange: string = '30d') {
    const { data, error } = await supabase.functions.invoke('get-platform-analytics', {
      body: { userId, platform, timeRange }
    });

    if (error) throw error;
    return data;
  }

  static async syncPlatformAnalytics(platform: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('sync-analytics', {
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
}
