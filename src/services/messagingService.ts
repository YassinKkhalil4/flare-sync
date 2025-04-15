
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
    if (!isRealSupabaseClient()) {
      return useMockMessagingData().getMessages(conversationId);
    }

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
    if (!isRealSupabaseClient()) {
      return useMockMessagingData().sendMessage(data);
    }

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
    if (!isRealSupabaseClient()) {
      return useMockMessagingData().markAsRead(conversationId);
    }

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
