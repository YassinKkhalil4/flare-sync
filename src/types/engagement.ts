
export interface EngagementPredictionRequest {
  content?: string;
  caption?: string;
  platform: string;
  hashtags?: string[];
  mediaUrls?: string[];
  scheduledTime?: string;
  postType?: string;
}

export interface EngagementPredictionResult {
  id: string;
  platform: string;
  content: string;
  scheduled_for?: string;
  overall_score?: number;
  overallScore?: number;
  predicted_likes?: number;
  predicted_comments?: number;
  predicted_shares?: number;
  confidence_score?: number;
  insights?: string[];
  recommended_times?: string[];
  recommendedTimes?: string[];
  hashtags?: string[];
  media_urls?: string[];
  post_time?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  user_id: string;
  
  // Legacy aliases for backward compatibility
  likes?: number;
  comments?: number;
  shares?: number;
  reach?: number;
  confidence?: number;
}
