
import { Conversation, Message, MessageRequest } from '../types/messaging';
import { supabase } from '../lib/supabase';

// Real API implementation using Supabase
export const MessagingAPI = {
  // Get all conversations for the current user
  getConversations: async (): Promise<Conversation[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Transform data to match Conversation interface
      return (data || []).map(conv => ({
        id: conv.id,
        partner: {
          id: conv.partner_id,
          name: conv.partner_name,
          avatar: conv.partner_avatar || '/placeholder.svg',
          type: conv.partner_type
        },
        lastMessage: {
          content: conv.last_message || 'No messages yet',
          timestamp: conv.last_message_time || conv.created_at,
          read: true // We'll implement read status later
        }
      }));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  },
  
  // Get messages for a specific conversation
  getMessages: async (conversationId: string): Promise<Message[]> => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      return (data || []).map(msg => ({
        id: msg.id,
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },
  
  // Send a new message
  sendMessage: async (data: MessageRequest): Promise<Message> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const messageData = {
        conversation_id: data.conversationId,
        user_id: user.id,
        sender: 'me',
        content: data.content,
        timestamp: new Date().toISOString(),
        read: false
      };

      const { data: insertedMessage, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      // Update conversation's last message
      await supabase
        .from('conversations')
        .update({
          last_message: data.content,
          last_message_time: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', data.conversationId);

      return {
        id: insertedMessage.id,
        sender: insertedMessage.sender,
        content: insertedMessage.content,
        timestamp: insertedMessage.timestamp
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
  
  // Mark conversation as read
  markAsRead: async (conversationId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .eq('read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },
  
  // Create a new conversation with a brand
  createConversation: async (partnerData: { id: string, name: string, avatar: string, type: string }): Promise<Conversation> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('partner_id', partnerData.id)
        .single();

      if (existingConversation) {
        return {
          id: existingConversation.id,
          partner: {
            id: partnerData.id,
            name: partnerData.name,
            avatar: partnerData.avatar,
            type: partnerData.type
          },
          lastMessage: {
            content: existingConversation.last_message || 'Conversation exists',
            timestamp: existingConversation.last_message_time || existingConversation.created_at,
            read: true
          }
        };
      }

      const conversationData = {
        user_id: user.id,
        partner_id: partnerData.id,
        partner_name: partnerData.name,
        partner_avatar: partnerData.avatar,
        partner_type: partnerData.type,
        last_message: 'New conversation started',
        last_message_time: new Date().toISOString()
      };

      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert(conversationData)
        .select()
        .single();

      if (error) throw error;

      return {
        id: conversation.id,
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
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  // Create conversation with brand from matchmaker
  createBrandConversation: async (brandId: string, brandName: string): Promise<string> => {
    try {
      const conversation = await MessagingAPI.createConversation({
        id: brandId,
        name: brandName,
        avatar: '/placeholder.svg',
        type: 'brand'
      });
      
      return conversation.id;
    } catch (error) {
      console.error('Error creating brand conversation:', error);
      throw error;
    }
  }
};
