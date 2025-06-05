
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  sender: string;
  user_id: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  user_id: string;
  partner_id: string;
  partner_name: string;
  partner_avatar?: string;
  partner_type: string;
  last_message?: string;
  last_message_time?: string;
  created_at: string;
  updated_at: string;
}

export class MessagingService {
  static async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async sendMessage(
    conversationId: string,
    content: string,
    userId: string,
    sender: string
  ): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        content,
        user_id: userId,
        sender,
        timestamp: new Date().toISOString(),
        read: false
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation last message
    await supabase
      .from('conversations')
      .update({
        last_message: content,
        last_message_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    return data;
  }

  static async markAsRead(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId);

    if (error) throw error;
  }

  static async createConversation(
    userId: string,
    partnerId: string,
    partnerName: string,
    partnerType: string,
    partnerAvatar?: string
  ): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        partner_id: partnerId,
        partner_name: partnerName,
        partner_type: partnerType,
        partner_avatar: partnerAvatar,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
