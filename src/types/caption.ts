
export interface CaptionGenerationRequest {
  platform: string;
  niche: string;
  tone: string;
  postType: string;
  objective: string;
  description: string;
}

export interface CaptionGenerationResponse {
  success: boolean;
  captions: string[];
  captionId: string;
}

export interface SavedCaption {
  id: string;
  user_id: string;
  platform: string;
  niche: string;
  tone: string;
  post_type: string;
  objective: string;
  description: string;
  captions: string[];
  selected_caption: string | null;
  created_at: string;
  updated_at: string;
}
