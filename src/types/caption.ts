
export interface CaptionGenerationRequest {
  description: string;
  platform: string;
  tone?: string;
  objective?: string;
  niche?: string;
  postType?: string;
}

export interface CaptionGenerationResponse {
  success: boolean;
  captions: string[];
  error?: string;
}

export interface SavedCaption {
  id: string;
  user_id: string;
  description: string;
  platform: string;
  tone?: string;
  objective?: string;
  niche?: string;
  post_type?: string;
  captions: string[];
  selected_caption?: string;
  created_at: string;
  updated_at: string;
}
