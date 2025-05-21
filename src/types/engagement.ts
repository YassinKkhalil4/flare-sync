
export interface EngagementPredictionRequest {
  platform: "instagram" | "tiktok" | "youtube";
  caption: string;
  scheduledTime: string;
  postType: "photo" | "video" | "carousel";
  mediaMetadata?: any;
}

export interface EngagementMetric {
  estimatedCount: number;
  confidence: number;
}

export interface EngagementPredictionResult {
  overallScore: number;
  metrics: {
    likes: EngagementMetric;
    comments: EngagementMetric;
    shares: EngagementMetric;
    saves?: EngagementMetric;
  };
  insights: string[];
  recommendedTimes?: string[];
}

export interface EngagementPrediction {
  id: string;
  user_id: string;
  platform: string;
  caption: string;
  scheduled_time: string;
  post_type: string;
  media_metadata?: any;
  overall_score: number;
  metrics: {
    likes: EngagementMetric;
    comments: EngagementMetric;
    shares: EngagementMetric;
    saves?: EngagementMetric;
  };
  insights: string[];
  created_at: string;
  recommended_times?: string[];
}
