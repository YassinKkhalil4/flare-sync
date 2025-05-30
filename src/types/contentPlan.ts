
export interface ContentPlanRequest {
  timeCommitment?: number;
  platforms: string[];
  goal: 'growth' | 'engagement' | 'sales';
  niche: string;
  audience: string;
  goals: string;
  timeframe: string;
  additionalInfo?: string;
}

export interface ContentPlanPost {
  id: string;
  day: string;
  time: string;
  platform: string;
  contentType: string;
  title: string;
  description: string;
  suggestedCaption?: string;
  hashtags?: string[];
  status: 'draft' | 'scheduled' | 'published';
}

export interface ContentPlan {
  id: string;
  name: string;
  content: string;
  startDate: string;
  endDate: string;
  goal: string;
  platforms: string[];
  posts: ContentPlanPost[];
  createdAt: string;
  updatedAt: string;
}
