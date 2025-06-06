
import { supabase } from '@/integrations/supabase/client';

export interface ContentPlan {
  id: string;
  name: string;
  content: string;
  platforms: string[];
  goal: string;
  start_date: string;
  end_date: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface EngagementPrediction {
  id: string;
  user_id: string;
  content: string;
  platform: string;
  hashtags?: string[];
  media_urls?: string[];
  post_time?: string;
  predicted_likes?: number;
  predicted_comments?: number;
  predicted_shares?: number;
  confidence_score?: number;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export class AIService {
  static async generateCaptions(
    description: string,
    platform: string,
    tone: string = 'engaging',
    count: number = 3
  ): Promise<string[]> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-captions', {
        body: {
          description,
          platform,
          tone,
          count
        }
      });

      if (error) throw error;
      return data.captions || [];
    } catch (error) {
      console.error('Error generating captions:', error);
      // Fallback captions
      return [
        `Check out this amazing ${platform} post! ${description}`,
        `New content alert! ${description} #${platform}`,
        `Excited to share: ${description}`
      ];
    }
  }

  static async predictEngagement(
    content: string,
    platform: string,
    hashtags?: string[],
    mediaUrls?: string[]
  ): Promise<EngagementPrediction> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('predict-engagement', {
        body: {
          content,
          platform,
          hashtags,
          mediaUrls
        }
      });

      if (error) throw error;

      // Save prediction to database
      const predictionData = {
        user_id: user.id,
        content,
        platform,
        hashtags,
        media_urls: mediaUrls,
        predicted_likes: data.likes || 0,
        predicted_comments: data.comments || 0,
        predicted_shares: data.shares || 0,
        confidence_score: data.confidence || 0.5,
        metadata: data
      };

      const { data: savedPrediction, error: saveError } = await supabase
        .from('engagement_predictions')
        .insert([predictionData])
        .select()
        .single();

      if (saveError) throw saveError;
      return savedPrediction;
    } catch (error) {
      console.error('Error predicting engagement:', error);
      throw error;
    }
  }

  static async getEngagementPredictions(userId: string): Promise<EngagementPrediction[]> {
    try {
      const { data, error } = await supabase
        .from('engagement_predictions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching engagement predictions:', error);
      return [];
    }
  }

  static async generateContentPlan(
    niche: string,
    platforms: string[],
    goal: string,
    duration: number
  ): Promise<ContentPlan> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('generate-content-plan', {
        body: {
          niche,
          platforms,
          goal,
          duration
        }
      });

      if (error) throw error;

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + duration);

      const planData = {
        user_id: user.id,
        name: `${niche} Content Plan`,
        content: data.plan || `Content plan for ${niche} targeting ${goal}`,
        platforms,
        goal,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      };

      const { data: savedPlan, error: saveError } = await supabase
        .from('content_plans')
        .insert([planData])
        .select()
        .single();

      if (saveError) throw saveError;
      return savedPlan;
    } catch (error) {
      console.error('Error generating content plan:', error);
      throw error;
    }
  }

  static async getContentPlans(userId: string): Promise<ContentPlan[]> {
    try {
      const { data, error } = await supabase
        .from('content_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching content plans:', error);
      return [];
    }
  }

  static async getOptimalPostingTimes(params: {
    platform: string;
    contentType: string;
    audienceLocation: string;
    postCount: number;
  }) {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-posting-schedule', {
        body: params
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting optimal posting times:', error);
      // Return fallback data
      return {
        optimalTimes: [
          { day: 'Monday', times: ['09:00', '14:30'] },
          { day: 'Tuesday', times: ['10:00', '15:00'] },
          { day: 'Wednesday', times: ['11:00', '16:00'] },
          { day: 'Thursday', times: ['09:30', '14:00'] },
          { day: 'Friday', times: ['10:30', '15:30'] }
        ]
      };
    }
  }
}
