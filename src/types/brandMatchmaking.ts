
export interface BrandMatchRequest {
  niche: string;
  audienceSize: number;
  engagementRate: number;
  location?: string;
  platforms: string[];
}

export interface BrandMatchResult {
  id: string;
  name: string;
  description: string;
  logo?: string;
  industry: string;
  budget_range: string;
  requirements: string[];
  contact_email: string;
  match_score: number;
  compatibility_reasons: string[];
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
