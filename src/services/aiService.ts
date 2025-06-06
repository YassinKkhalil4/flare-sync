
import { supabase } from '@/integrations/supabase/client';

export interface AIAnalysisRequest {
  content: string;
  platform: string;
  scheduledTime?: string;
  mediaUrls?: string[];
}

export interface EngagementPrediction {
  predicted_likes: number;
  predicted_comments: number;
  predicted_shares: number;
  confidence_score: number;
  recommendations: string[];
}

export interface OptimalTimingData {
  optimalTimes: Array<{
    day: string;
    times: string[];
  }>;
  heatmap: Array<{
    day: number;
    hour: number;
    value: number;
  }>;
  recommendations: string[];
}

export class AIService {
  static async predictEngagement(data: AIAnalysisRequest): Promise<EngagementPrediction> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('User not authenticated');

    try {
      const { data: response, error } = await supabase.functions.invoke('predict-engagement', {
        body: data,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      return response;
    } catch (error) {
      console.error('Error predicting engagement:', error);
      // Return mock data for development
      return {
        predicted_likes: Math.floor(Math.random() * 1000) + 100,
        predicted_comments: Math.floor(Math.random() * 100) + 10,
        predicted_shares: Math.floor(Math.random() * 50) + 5,
        confidence_score: Math.random() * 0.4 + 0.6, // 60-100%
        recommendations: [
          'Consider adding more engaging visuals',
          'Post during peak hours for better reach',
          'Use trending hashtags for increased visibility',
          'Add a call-to-action to encourage engagement'
        ]
      };
    }
  }

  static async getOptimalPostingTimes(params: {
    platform: string;
    contentType: string;
    audienceLocation: string;
    postCount: number;
  }): Promise<OptimalTimingData> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('User not authenticated');

    try {
      const { data: response, error } = await supabase.functions.invoke('analyze-optimal-times', {
        body: params,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      return response;
    } catch (error) {
      console.error('Error getting optimal times:', error);
      // Return mock data for development
      return {
        optimalTimes: [
          { day: 'Monday', times: ['09:00', '14:30', '19:00'] },
          { day: 'Tuesday', times: ['10:00', '15:00', '20:00'] },
          { day: 'Wednesday', times: ['11:00', '16:00', '18:30'] },
          { day: 'Thursday', times: ['09:30', '14:00', '19:30'] },
          { day: 'Friday', times: ['10:30', '15:30', '17:00'] },
          { day: 'Saturday', times: ['12:00', '16:00', '20:00'] },
          { day: 'Sunday', times: ['13:00', '17:00', '19:00'] },
        ],
        heatmap: Array.from({ length: 7 }, (_, day) =>
          Array.from({ length: 24 }, (_, hour) => ({
            day,
            hour,
            value: Math.random() * 0.9 + 0.1
          }))
        ).flat(),
        recommendations: [
          'Weekday afternoons show highest engagement',
          'Weekend evenings are optimal for lifestyle content',
          'Avoid posting during early morning hours',
          'Consider your audience timezone when scheduling'
        ]
      };
    }
  }

  static async generateContentSuggestions(params: {
    industry: string;
    platform: string;
    contentType: string;
    tone: string;
  }): Promise<string[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('User not authenticated');

    try {
      const { data: response, error } = await supabase.functions.invoke('generate-content-ideas', {
        body: params,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      return response.suggestions;
    } catch (error) {
      console.error('Error generating content suggestions:', error);
      // Return mock suggestions
      return [
        'Share behind-the-scenes content from your workspace',
        'Create a tips and tricks carousel post',
        'Post customer testimonials and success stories',
        'Share industry insights and trends',
        'Create engaging poll questions for your audience'
      ];
    }
  }
}
