
import { supabase } from '@/integrations/supabase/client';

export interface AIFeature {
  id: string;
  name: string;
  description: string;
  status: 'available' | 'coming_soon' | 'disabled';
  endpoint: string;
}

export interface ContentPlan {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  posts: ContentPlanPost[];
  created_at: string;
}

export interface ContentPlanPost {
  id: string;
  day: string;
  time: string;
  platform: string;
  contentType: string;
  title: string;
  description: string;
  hashtags: string[];
  status: 'draft' | 'scheduled' | 'published';
}

export interface EngagementPrediction {
  id: string;
  platform: string;
  caption: string;
  scheduled_time: string;
  post_type: string;
  overall_score: number;
  metrics: {
    likes: { estimatedCount: number; confidence: number };
    comments: { estimatedCount: number; confidence: number };
    shares: { estimatedCount: number; confidence: number };
  };
  insights: string[];
  recommended_times?: string[];
  created_at: string;
}

export interface CaptionGeneration {
  id: string;
  platform: string;
  niche: string;
  tone: string;
  post_type: string;
  objective: string;
  description: string;
  captions: string[];
  selected_caption?: string;
  created_at: string;
}

export interface BrandMatch {
  brandId: string;
  brandName: string;
  matchScore: number;
  reasonsForMatch: string[];
  estimatedMetrics: {
    cpm: number;
    ctr: number;
    roi: number;
  };
}

export class AIService {
  // Content Plan Generation
  static async generateContentPlan(params: {
    timeCommitment: string;
    platforms: string[];
    goal: string;
    niche: string;
    additionalInfo?: string;
  }): Promise<ContentPlan> {
    const { data, error } = await supabase.functions.invoke('generate-content-plan', {
      body: params
    });

    if (error) throw error;
    return data;
  }

  static async getContentPlans(): Promise<ContentPlan[]> {
    const { data, error } = await supabase
      .from('content_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Engagement Prediction
  static async predictEngagement(params: {
    platform: string;
    caption: string;
    scheduledTime: string;
    postType: string;
    mediaMetadata?: any;
  }): Promise<EngagementPrediction> {
    const { data, error } = await supabase.functions.invoke('predict-engagement', {
      body: params
    });

    if (error) throw error;
    return data;
  }

  static async getEngagementPredictions(): Promise<EngagementPrediction[]> {
    const { data, error } = await supabase
      .from('engagement_predictions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Caption Generation
  static async generateCaptions(params: {
    platform: string;
    niche: string;
    tone: string;
    postType: string;
    objective: string;
    description: string;
  }): Promise<CaptionGeneration> {
    const { data, error } = await supabase.functions.invoke('generate-captions', {
      body: params
    });

    if (error) throw error;
    return data;
  }

  static async getCaptions(): Promise<CaptionGeneration[]> {
    const { data, error } = await supabase
      .from('ai_captions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async saveSelectedCaption(captionId: string, selectedCaption: string): Promise<boolean> {
    const { error } = await supabase
      .from('ai_captions')
      .update({ selected_caption: selectedCaption })
      .eq('id', captionId);

    return !error;
  }

  // Brand Matchmaking
  static async findBrandMatches(params: {
    creatorId: string;
    filters?: any;
  }): Promise<BrandMatch[]> {
    const { data, error } = await supabase.functions.invoke('brand-matchmaker', {
      body: params
    });

    if (error) throw error;
    return data || [];
  }

  // Smart Assistant
  static async sendAssistantMessage(message: string, conversationHistory?: any[]): Promise<string> {
    const { data, error } = await supabase.functions.invoke('ai-helper', {
      body: {
        feature: 'chat-assistant',
        params: {
          message,
          conversation_history: conversationHistory || []
        }
      }
    });

    if (error) throw error;
    return data.response;
  }

  // Smart Scheduling
  static async getOptimalPostingTimes(params: {
    platform: string;
    contentType: string;
    audienceLocation: string;
    postCount: number;
  }): Promise<{ day: number; time: string; score: number }[]> {
    const { data, error } = await supabase.functions.invoke('ai-helper', {
      body: {
        feature: 'smart-scheduling',
        params
      }
    });

    if (error) throw error;
    return data.optimalTimes || [];
  }
}
