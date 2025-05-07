
export interface ContentPlanRequest {
  timeCommitment: number; // hours per week
  platforms: string[];
  goal: 'growth' | 'engagement' | 'sales';
  niche: string;
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
  status: 'draft' | 'ready' | 'published';
}

export interface ContentPlan {
  id: string;
  user_id: string;
  name: string;
  startDate: string;
  endDate: string;
  goal: string;
  platforms: string[];
  createdAt: string;
  updatedAt: string;
  posts: ContentPlanPost[];
}
