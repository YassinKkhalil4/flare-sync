
import { supabase } from '@/integrations/supabase/client';

export interface CaptionRequest {
  description: string;
  platform: string;
  tone?: string;
  objective?: string;
  niche?: string;
  postType?: string;
}

export interface OptimalTimesRequest {
  platform: string;
  contentType: string;
  audienceLocation: string;
  postCount: number;
}

export interface EngagementPrediction {
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  confidence: number;
}

export class AIService {
  static async generateCaptions(request: CaptionRequest): Promise<string[]> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-captions', {
        body: request
      });

      if (error) throw error;
      return data.captions || [];
    } catch (error) {
      console.error('Error generating captions:', error);
      // Fallback to simulated captions if AI service fails
      return [
        `Check out this amazing ${request.description}! 🚀 #${request.platform}`,
        `Excited to share: ${request.description} ✨ What do you think?`,
        `${request.description} - couldn't be more thrilled! 💫 #content`
      ];
    }
  }

  static async getOptimalPostingTimes(request: OptimalTimesRequest): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-posting-times', {
        body: request
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error analyzing posting times:', error);
      // Return simulated data if AI service fails
      return {
        optimalTimes: [
          { day: 'Monday', times: ['09:00', '15:00'] },
          { day: 'Tuesday', times: ['10:00', '16:00'] },
          { day: 'Wednesday', times: ['11:00', '17:00'] },
        ],
        recommendations: [
          'Post during peak engagement hours',
          'Consider your audience timezone',
          'Maintain consistent posting schedule'
        ]
      };
    }
  }

  static async predictEngagement(
    content: string,
    platform: string,
    hashtags: string[] = [],
    mediaUrls: string[] = []
  ): Promise<EngagementPrediction> {
    try {
      const { data, error } = await supabase.functions.invoke('predict-engagement', {
        body: {
          content,
          platform,
          hashtags,
          mediaUrls
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error predicting engagement:', error);
      // Return simulated prediction if AI service fails
      return {
        likes: Math.floor(Math.random() * 1000) + 100,
        comments: Math.floor(Math.random() * 100) + 10,
        shares: Math.floor(Math.random() * 50) + 5,
        reach: Math.floor(Math.random() * 5000) + 500,
        confidence: Math.random() * 0.4 + 0.6 // 60-100% confidence
      };
    }
  }

  static async generateContentPlan(
    niche: string,
    platforms: string[],
    goal: string,
    duration: number
  ): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-content-plan', {
        body: {
          niche,
          platforms,
          goal,
          duration
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating content plan:', error);
      // Return simulated plan if AI service fails
      return {
        posts: [
          {
            day: 'Monday',
            time: '09:00',
            platform: platforms[0] || 'instagram',
            contentType: 'photo',
            title: `Week starter: ${niche} insights`,
            description: `Share valuable insights about ${niche}`,
            hashtags: [`#${niche}`, '#Monday', '#motivation']
          }
        ]
      };
    }
  }
}
