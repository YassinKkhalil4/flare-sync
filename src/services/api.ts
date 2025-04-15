
import { Conversation, Message, MessageRequest, SocialProfile } from '../types/messaging';
import { supabase, isRealSupabaseClient } from '../lib/supabase';
import { mockConversations, generateMockMessages, formatDate } from '../utils/mockMessagingData';

// Real API implementation using Supabase
export const MessagingAPI = {
  // Get all conversations for the current user
  getConversations: async (): Promise<Conversation[]> => {
    if (!isRealSupabaseClient()) {
      // Use mock data if Supabase is not properly configured
      return useMockMessagingData().getConversations();
    }

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.user.id);
    
    if (error) throw error;
    
    // Get the last message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      data.map(async (conv) => {
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('timestamp', { ascending: false })
          .limit(1);
        
        if (messagesError) throw messagesError;
        
        const lastMessage = messages[0] || { 
          content: 'No messages yet', 
          timestamp: new Date().toISOString(),
          read: true
        };
        
        return {
          id: conv.id,
          partner: {
            id: conv.partner_id,
            name: conv.partner_name,
            avatar: conv.partner_avatar,
            type: conv.partner_type
          },
          lastMessage: {
            content: lastMessage.content,
            timestamp: lastMessage.timestamp,
            read: lastMessage.read
          }
        };
      })
    );
    
    return conversationsWithLastMessage;
  },
  
  // Get messages for a specific conversation
  getMessages: async (conversationId: string): Promise<Message[]> => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });
    
    if (error) throw error;
    
    return data.map(msg => ({
      id: msg.id,
      sender: msg.sender,
      content: msg.content,
      timestamp: msg.timestamp
    }));
  },
  
  // Send a new message
  sendMessage: async (data: MessageRequest): Promise<Message> => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');
    
    const newMessage = {
      conversation_id: data.conversationId,
      sender: 'me',
      content: data.content,
      timestamp: new Date().toISOString(),
      read: true,
      user_id: user.user.id
    };
    
    const { data: insertedData, error } = await supabase
      .from('messages')
      .insert(newMessage)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: insertedData.id,
      sender: insertedData.sender,
      content: insertedData.content,
      timestamp: insertedData.timestamp
    };
  },
  
  // Mark conversation as read
  markAsRead: async (conversationId: string): Promise<void> => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');
    
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender', 'me');
    
    if (error) throw error;
  }
};

// Social Media API using Supabase
export const SocialAPI = {
  // Get all connected social profiles
  getProfiles: async (): Promise<SocialProfile[]> => {
    if (!isRealSupabaseClient()) {
      // Use mock data if Supabase is not properly configured
      return useMockSocialData().getProfiles();
    }

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('user_id', user.user.id);
    
    if (error) throw error;
    
    return data.map(profile => ({
      id: profile.id,
      platform: profile.platform as 'instagram' | 'tiktok' | 'youtube' | 'twitter',
      username: profile.username,
      profileUrl: profile.profile_url,
      connected: profile.connected,
      lastSynced: profile.last_synced || undefined,
      stats: profile.followers ? {
        followers: profile.followers,
        posts: profile.posts || 0,
        engagement: profile.engagement || 0
      } : undefined
    }));
  },
  
  // Connect to a social platform
  connectPlatform: async (platform: string, code: string, state: string): Promise<SocialProfile> => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');
    
    // In a real implementation, this would exchange the code for an access token
    // For now, we'll simulate this process
    
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('platform', platform)
      .maybeSingle();
    
    const profileData = {
      user_id: user.user.id,
      platform,
      username: platform === 'instagram' ? 'creator_profile' : 'username',
      profile_url: `https://${platform}.com/creator_profile`,
      connected: true,
      last_synced: new Date().toISOString(),
      access_token: 'mock_access_token',
      followers: 12500,
      posts: 78,
      engagement: 4.2
    };
    
    let result;
    
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('social_profiles')
        .update({
          connected: true,
          last_synced: new Date().toISOString(),
          access_token: 'mock_access_token'
        })
        .eq('id', existingProfile.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('social_profiles')
        .insert(profileData)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    return {
      id: result.id,
      platform: result.platform as 'instagram' | 'tiktok' | 'youtube' | 'twitter',
      username: result.username,
      profileUrl: result.profile_url,
      connected: result.connected,
      lastSynced: result.last_synced || undefined,
      stats: {
        followers: result.followers || 0,
        posts: result.posts || 0,
        engagement: result.engagement || 0
      }
    };
  },
  
  // Disconnect from a platform
  disconnectPlatform: async (platformId: string): Promise<void> => {
    const { error } = await supabase
      .from('social_profiles')
      .update({ connected: false })
      .eq('id', platformId);
    
    if (error) throw error;
  }
};

// For development - mock API implementation
const useMockMessagingData = () => {
  // Use the imported mock data directly instead of requiring it
  
  // Mock implementation
  return {
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
};

const useMockSocialData = () => {
  return {
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
};

// Determine which API implementation to use
let useRealApi = isRealSupabaseClient();

// Override for development environments that want to use the mock API
if (process.env.NODE_ENV === 'development' && !import.meta.env.VITE_USE_SUPABASE) {
  useRealApi = false;
}

// Export the appropriate API implementation
export const { MessagingAPI: MessagingService, SocialAPI: SocialService } = 
  useRealApi ? { MessagingAPI, SocialAPI } : { 
    MessagingAPI: useMockMessagingData(), 
    SocialAPI: useMockSocialData() 
  };
