
export interface EngagementPrediction {
  id: string;
  user_id: string;
  content: string;
  platform: string;
  hashtags?: string[];
  media_urls?: string[];
  predicted_likes: number;
  predicted_comments: number;
  predicted_shares: number;
  confidence_score: number;
  created_at: string;
  updated_at: string;
  post_time?: string;
  metadata?: any;
}

export interface EngagementPredictionRequest {
  content: string;
  platform: string;
  hashtags?: string[];
  mediaUrls?: string[];
  caption?: string;
  scheduledTime?: string;
  postType?: string;
}

export interface EngagementMetric {
  estimatedCount: number;
  confidence: number;
}

export interface EngagementPredictionResult {
  id: string;
  platform: string;
  caption: string;
  scheduled_time: string;
  overall_score: number;
  overallScore?: number; // Backward compatibility
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  confidence: number;
  insights: string[];
  metrics: {
    likes: EngagementMetric | number;
    comments: EngagementMetric | number;
    shares: EngagementMetric | number;
  };
  recommended_times?: string[];
  recommendedTimes?: string[];
}
