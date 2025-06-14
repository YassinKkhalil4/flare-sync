
export interface CaptionRequest {
  description: string;
  platform: string;
  tone?: string;
  objective?: string;
  postType?: string;
  niche?: string;
}

export interface CaptionFormProps {
  onSubmit: (request: CaptionRequest) => void;
  isGenerating: boolean;
}

export interface CaptionResult {
  id: string;
  captions: string[];
  metadata: {
    platform: string;
    tone?: string;
    objective?: string;
    postType?: string;
    niche?: string;
  };
  createdAt: string;
}

export interface SavedCaption {
  id: string;
  content: string;
  platform: string;
  createdAt: string;
  used: boolean;
  tone?: string;
  description?: string;
  selected_caption?: string;
  captions?: string[];
  created_at?: string;
}

export interface CaptionGenerationRequest {
  description: string;
  platform: string;
  tone?: string;
  objective?: string;
  postType?: string;
  niche?: string;
}

export interface CaptionGenerationResponse {
  id: string;
  captions: string[];
  metadata: {
    platform: string;
    tone?: string;
    objective?: string;
    postType?: string;
    niche?: string;
  };
  createdAt: string;
}
