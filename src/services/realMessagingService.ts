
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  conversation_id: string;
  sender: string;
  content: string;
  timestamp: string;
  read: boolean;
  user_id: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  partner_id: string;
  partner_name: string;
  partner_avatar?: string;
  partner_type: 'creator' | 'brand';
  last_message?: string;
  last_message_time?: string;
  created_at: string;
  updated_at: string;
}

export class RealMessagingService {
  static async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
    return data || [];
  }

  static async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    return data || [];
  }

  static async sendMessage(
    conversationId: string, 
    content: string, 
    sender: string,
    userId: string
  ): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        content,
        sender,
        user_id: userId,
        read: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    // Update conversation's last message
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

  static async createConversation(
    userId: string,
    partnerId: string,
    partnerName: string,
    partnerType: 'creator' | 'brand',
    partnerAvatar?: string
  ): Promise<Conversation | null> {
    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .eq('partner_id', partnerId)
      .single();

    if (existing) {
      return existing;
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        partner_id: partnerId,
        partner_name: partnerName,
        partner_avatar: partnerAvatar,
        partner_type: partnerType
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
    return data;
  }

  static async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  static subscribeToMessages(
    conversationId: string,
    onMessage: (message: Message) => void
  ) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          onMessage(payload.new as Message);
        }
      )
      .subscribe();
  }
}
