
export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  partner: {
    id: string;
    name: string;
    avatar: string;
    type: string;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    read: boolean;
  };
}

export interface MessageRequest {
  content: string;
  conversationId: string;
}

export interface SocialProfile {
  id: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'twitch';
  username: string;
  profileUrl: string;
  connected: boolean;
  lastSynced?: string;
  stats?: {
    followers: number;
    posts: number;
    engagement: number;
  };
}

export interface SocialService {
  getProfiles: () => Promise<SocialProfile[]>;
  connectPlatform: (platform: string, code?: string, state?: string) => Promise<SocialProfile>;
  disconnectPlatform: (platformId: string) => Promise<void>;
  syncPlatform: (platformId: string) => Promise<SocialProfile>;
}
