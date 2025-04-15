
import { Conversation, Message, MessageRequest, SocialProfile } from '../types/messaging';

// Base API URL - would come from environment variables in a real app
const API_URL = '/api';

// Helper function for API requests
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // In a real app, you would get the auth token from your auth provider
  const token = localStorage.getItem('auth_token');
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...defaultOptions,
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'An error occurred while fetching data');
  }

  return response.json();
}

// Messaging API
export const MessagingAPI = {
  // Get all conversations for the current user
  getConversations: async (): Promise<Conversation[]> => {
    return fetchWithAuth('/conversations');
  },
  
  // Get messages for a specific conversation
  getMessages: async (conversationId: string): Promise<Message[]> => {
    return fetchWithAuth(`/conversations/${conversationId}/messages`);
  },
  
  // Send a new message
  sendMessage: async (data: MessageRequest): Promise<Message> => {
    return fetchWithAuth(`/conversations/${data.conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content: data.content })
    });
  },
  
  // Mark conversation as read
  markAsRead: async (conversationId: string): Promise<void> => {
    return fetchWithAuth(`/conversations/${conversationId}/read`, {
      method: 'PUT'
    });
  }
};

// Social Media API
export const SocialAPI = {
  // Get all connected social profiles
  getProfiles: async (): Promise<SocialProfile[]> => {
    return fetchWithAuth('/social/profiles');
  },
  
  // Connect to a social platform
  connectPlatform: async (platform: string, code: string, state: string): Promise<SocialProfile> => {
    return fetchWithAuth('/social/connect', {
      method: 'POST',
      body: JSON.stringify({ platform, code, state })
    });
  },
  
  // Disconnect from a platform
  disconnectPlatform: async (platformId: string): Promise<void> => {
    return fetchWithAuth(`/social/disconnect/${platformId}`, {
      method: 'DELETE'
    });
  }
};

// For development - mock API implementation
// This will be used until the real backend is available
export const createMockAPI = () => {
  // Import mock data
  const { mockConversations, generateMockMessages } = require('../utils/mockMessagingData');
  
  // Mock implementation
  const mockMessagingAPI = {
    getConversations: async (): Promise<Conversation[]> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockConversations;
    },
    
    getMessages: async (conversationId: string): Promise<Message[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return generateMockMessages(conversationId);
    },
    
    sendMessage: async (data: MessageRequest): Promise<Message> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newMsg = {
        id: `new-${Date.now()}`,
        sender: 'me',
        content: data.content,
        timestamp: new Date().toISOString()
      };
      return newMsg;
    },
    
    markAsRead: async (conversationId: string): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 200));
      // Mock implementation would update the local state
      return;
    }
  };

  const mockSocialAPI = {
    getProfiles: async (): Promise<SocialProfile[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        {
          id: 'instagram-1',
          platform: 'instagram',
          username: 'creator_profile',
          profileUrl: 'https://instagram.com/creator_profile',
          connected: Boolean(localStorage.getItem('instagram_connected')),
          lastSynced: new Date().toISOString(),
          stats: {
            followers: 12500,
            posts: 78,
            engagement: 4.2
          }
        }
      ];
    },
    
    connectPlatform: async (platform: string): Promise<SocialProfile> => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('instagram_connected', 'true');
      return {
        id: 'instagram-1',
        platform: 'instagram' as 'instagram',
        username: 'creator_profile',
        profileUrl: 'https://instagram.com/creator_profile',
        connected: true
      };
    },
    
    disconnectPlatform: async (): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.removeItem('instagram_connected');
      return;
    }
  };

  return {
    MessagingAPI: mockMessagingAPI,
    SocialAPI: mockSocialAPI
  };
};

// Export the appropriate API based on environment
// In a real application, this would be controlled by environment variables
const isDevelopment = process.env.NODE_ENV === 'development' || true;
export const { MessagingAPI: MessagingService, SocialAPI: SocialService } = 
  isDevelopment ? createMockAPI() : { MessagingAPI, SocialAPI };
