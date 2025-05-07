
export interface CaptionGenerationRequest {
  platform: 'instagram' | 'tiktok' | 'youtube';
  niche: string;
  tone: string;
  postType: 'video' | 'photo' | 'carousel';
  objective: 'engagement' | 'saves' | 'brand_interest';
  description: string;
}

export interface CaptionGenerationResponse {
  success: boolean;
  captions: string[];
  captionId: string | null;
  error?: string;
  details?: string;
}

export interface SavedCaption {
  id: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  niche: string;
  tone: string;
  post_type: 'video' | 'photo' | 'carousel';
  objective: 'engagement' | 'saves' | 'brand_interest';
  description: string;
  captions: string[];
  selected_caption: string | null;
  created_at: string;
  updated_at: string;
}
