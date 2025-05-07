
export interface CreatorProfile {
  id: string;
  name: string;
  followerCount: number;
  niche: string[];
  tone: string[];
  region: string;
  engagementRate: number;
  platformStats: {
    platform: string;
    followers: number;
    averageEngagement: number;
  }[];
}

export interface BrandProfile {
  id: string;
  name: string;
  industry: string[];
  targetAudience: {
    ageRange: string;
    interests: string[];
    locations: string[];
  };
  campaignTypes: string[];
  budgetRange: {
    min: number;
    max: number;
  };
  goals: string[];
}

export interface BrandMatchResult {
  brandId: string;
  brandName: string;
  matchScore: number;
  reasonForMatch: string[];
  estimatedMetrics: {
    cpm: number;
    ctr: number;
    roi: number;
  };
}

export interface BrandMatchRequest {
  creatorId: string;
  filters?: {
    minBudget?: number;
    maxBudget?: number;
    campaignTypes?: string[];
    industries?: string[];
  };
}
