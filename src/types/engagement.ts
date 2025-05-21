

export interface EngagementMetric {
  type: 'likes' | 'comments' | 'shares';
  label: string;
  estimatedCount: number;
  confidenceScore: number;
}

export interface EngagementPrediction {
  id: string;
  platform: string;
  createdAt: string;
  metrics: {
    likes: EngagementMetric;
    comments: EngagementMetric;
    shares: EngagementMetric;
  };
  mediaUrls?: string[];
  content?: string;
  caption?: string;
  post_type?: string;
  overall_score?: number;
  confidence: number;
}

export interface EngagementPredictionRequest {
  platform: string;
  caption: string;
  scheduledTime: string;
  postType: string;
}

export interface EngagementPredictionResult {
  overallScore: number;
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
  insights: string[];
  recommendedTimes?: string[];
}

