
export interface EngagementPredictionRequest {
  platform: 'instagram' | 'tiktok' | 'youtube';
  caption: string;
  scheduledTime: string;
  postType: 'video' | 'photo' | 'carousel';
  mediaMetadata?: {
    duration?: number; // in seconds (for videos)
    width?: number; // in pixels
    height?: number; // in pixels
    fileSize?: number; // in bytes
    thumbnailUrl?: string;
  };
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
    saves?: {
      estimatedCount: number;
      confidence: number;
    };
  };
  insights: string[];
  recommendedTimes?: string[];
}

export interface EngagementPrediction {
  id: string;
  user_id: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  caption: string;
  scheduled_time: string;
  post_type: 'video' | 'photo' | 'carousel';
  media_metadata?: any;
  overall_score: number;
  metrics: {
    likes: {
      estimated_count: number;
      confidence: number;
    };
    comments: {
      estimated_count: number;
      confidence: number;
    };
    shares: {
      estimated_count: number;
      confidence: number;
    };
    saves?: {
      estimated_count: number;
      confidence: number;
    };
  };
  insights: string[];
  recommended_times?: string[];
  created_at: string;
  updated_at: string;
}
