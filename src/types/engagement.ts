
export interface EngagementMetric {
  type: 'likes' | 'comments' | 'shares';
  label: string;
  estimatedCount: number;
  confidenceScore: number;
}

// Adding these interfaces if they don't exist already
export interface EngagementPrediction {
  id: string;
  platform: string;
  createdAt: string;
  metrics: EngagementMetric[];
  mediaUrls?: string[];
  content?: string;
  confidence: number;
}
