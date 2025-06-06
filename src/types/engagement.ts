
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
  caption: string;
  scheduled_time: string;
  overall_score?: number;
  overallScore?: number;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  confidence: number;
  insights: string[];
  recommended_times?: string[];
  recommendedTimes?: string[];
  metrics: {
    likes: {
      estimatedCount: number;
      confidence: number;
    };
    comments: {
      estimatedCount: number;
      confidence: number;
    };
    shares: {
      estimatedCount: number;
      confidence: number;
    };
  };
}
