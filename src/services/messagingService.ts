
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
    if (!isRealSupabaseClient()) {
      // Use mock data if Supabase is not properly configured
      return useMockMessagingData().getConversations();
    }

    try {
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
          
          const lastMessage = messages && messages[0] ? messages[0] : { 
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
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return useMockMessagingData().getConversations();
    }
  },
  
  // Get messages for a specific conversation
  getMessages: async (conversationId: string): Promise<Message[]> => {
    if (!isRealSupabaseClient()) {
      return useMockMessagingData().getMessages(conversationId);
    }

    try {
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
    } catch (error) {
      console.error('Error fetching messages:', error);
      return useMockMessagingData().getMessages(conversationId);
    }
  },
  
  // Send a new message
  sendMessage: async (data: MessageRequest): Promise<Message> => {
    if (!isRealSupabaseClient()) {
      return useMockMessagingData().sendMessage(data);
    }

    try {
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
      
      // Also update the conversation's last message
      await supabase
        .from('conversations')
        .update({
          last_message: data.content,
          last_message_time: newMessage.timestamp
        })
        .eq('id', data.conversationId);
      
      return {
        id: insertedData.id,
        sender: insertedData.sender,
        content: insertedData.content,
        timestamp: insertedData.timestamp
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return useMockMessagingData().sendMessage(data);
    }
  },
  
  // Mark conversation as read
  markAsRead: async (conversationId: string): Promise<void> => {
    if (!isRealSupabaseClient()) {
      return useMockMessagingData().markAsRead(conversationId);
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender', 'me');
      
      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return useMockMessagingData().markAsRead(conversationId);
    }
  },
  
  // Create a new conversation
  createConversation: async (partnerData: { id: string, name: string, avatar: string, type: string }): Promise<Conversation> => {
    if (!isRealSupabaseClient()) {
      return useMockMessagingData().createConversation(partnerData);
    }
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      const newConversation = {
        partner_id: partnerData.id,
        partner_name: partnerData.name,
        partner_avatar: partnerData.avatar,
        partner_type: partnerData.type,
        user_id: user.user.id
      };
      
      const { data, error } = await supabase
        .from('conversations')
        .insert(newConversation)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        partner: {
          id: data.partner_id,
          name: data.partner_name,
          avatar: data.partner_avatar,
          type: data.partner_type
        },
        lastMessage: {
          content: 'New conversation started',
          timestamp: new Date().toISOString(),
          read: true
        }
      };
    } catch (error) {
      console.error('Error creating conversation:', error);
      return useMockMessagingData().createConversation(partnerData);
    }
  }
};
