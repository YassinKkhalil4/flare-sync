
import { Conversation, Message, MessageRequest } from '../types/messaging';
import { supabase, isRealSupabaseClient } from '../lib/supabase';
import { mockConversations, generateMockMessages } from '../utils/mockMessagingData';

// For development - mock API implementation for messaging
const useMockMessagingData = () => {
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
    },
    
    createConversation: async (partnerData: { id: string, name: string, avatar: string, type: string }): Promise<Conversation> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newConversation: Conversation = {
        id: `new-${Date.now()}`,
        partner: {
          id: partnerData.id,
          name: partnerData.name,
          avatar: partnerData.avatar,
          type: partnerData.type
        },
        lastMessage: {
          content: 'New conversation started',
          timestamp: new Date().toISOString(),
          read: true
        }
      };
      return newConversation;
    }
  };
};

// Real API implementation using Supabase
export const MessagingAPI = {
  // Get all conversations for the current user
  getConversations: async (): Promise<Conversation[]> => {
    // Always use mock data since the conversations table doesn't exist in the schema
    return useMockMessagingData().getConversations();
  },
  
  // Get messages for a specific conversation
  getMessages: async (conversationId: string): Promise<Message[]> => {
    // Always use mock data since the messages table doesn't exist in the schema
    return useMockMessagingData().getMessages(conversationId);
  },
  
  // Send a new message
  sendMessage: async (data: MessageRequest): Promise<Message> => {
    // Always use mock data since the messages table doesn't exist in the schema
    return useMockMessagingData().sendMessage(data);
  },
  
  // Mark conversation as read
  markAsRead: async (conversationId: string): Promise<void> => {
    // Always use mock data since the messages table doesn't exist in the schema
    return useMockMessagingData().markAsRead(conversationId);
  },
  
  // Create a new conversation
  createConversation: async (partnerData: { id: string, name: string, avatar: string, type: string }): Promise<Conversation> => {
    // Always use mock data since the conversations table doesn't exist in the schema
    return useMockMessagingData().createConversation(partnerData);
  }
};
