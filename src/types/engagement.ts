
export interface EngagementPredictionRequest {
  platform: string;
  caption: string;
  scheduledTime: string;
  postType: string;
  mediaMetadata?: any;
}

export interface EngagementPredictionResult {
  id: string;
  platform: string;
  caption: string;
  scheduled_time: string;
  post_type: string;
  overallScore: number;
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
