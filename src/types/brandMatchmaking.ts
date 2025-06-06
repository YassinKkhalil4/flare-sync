
export interface BrandMatchRequest {
  creatorId: string;
  filters?: {
    minBudget?: number;
    maxBudget?: number;
    campaignTypes?: string[];
    industries?: string[];
  };
  niche?: string;
  audienceSize?: number;
  engagementRate?: number;
  location?: string;
  platforms?: string[];
}

export interface BrandMatchResult {
  id: string;
  brandId: string;
  brandName: string;
  description: string;
  logo?: string;
  industry: string;
  budget_range: string;
  requirements: string[];
  contact_email: string;
  matchScore: number;
  reasonForMatch: string[];
  compatibility_reasons: string[];
  estimatedMetrics: {
    cpm: number;
    ctr: number;
    roi: number;
  };
}

export interface CreatorProfile {
  id: string;
  full_name: string;
  username?: string;
  bio?: string;
  location?: string;
  avatar_url?: string;
  follower_count?: number;
  engagement_rate?: number;
  platforms?: string[];
}

export interface BrandProfile {
  id: string;
  full_name: string;
  username?: string;
  bio?: string;
  website?: string;
  avatar_url?: string;
  industry?: string;
  budget_range?: string;
}
