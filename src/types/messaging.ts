
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
  unreadCount?: number;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

export interface MessageRequest {
  conversationId: string;
  content: string;
}

export interface SocialProfile {
  id: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'twitch';
  username: string;
  profileUrl?: string;
  connected: boolean;
  lastSynced?: string;
  stats?: {
    followers?: number;
    posts?: number;
    engagement?: number;
  };
  // Add the missing properties
  access_token?: string;
  refresh_token?: string;
}
