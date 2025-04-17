
import { supabase } from '@/integrations/supabase/client';
import { SocialAPI } from './socialService';
import { Notification } from '@/types/notification';

export const MessagingService = {
  // Get all conversations for the current user
  getConversations: async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*, partner:profiles!conversations_partner_id_fkey(*)')
        .or(`user_id.eq.${user.user.id},partner_id.eq.${user.user.id}`)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match the expected format
      return data.map(conversation => ({
        id: conversation.id,
        partner: {
          id: conversation.partner_id !== user.user?.id ? conversation.partner_id : conversation.user_id,
          name: conversation.partner.full_name,
          avatar: conversation.partner.avatar_url
        },
        lastMessage: {
          content: conversation.last_message,
          timestamp: conversation.updated_at,
          read: conversation.read_status || false
        },
        unreadCount: conversation.unread_count || 0
      }));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // Return mock data if there's an error
      return [{
        id: 'mock-1',
        partner: {
          id: 'mock-user-1',
          name: 'Mock User',
          avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=mock'
        },
        lastMessage: {
          content: 'This is a mock message due to error fetching real data',
          timestamp: new Date().toISOString(),
          read: true
        },
        unreadCount: 0
      }];
    }
  },
  
  // Get messages for a specific conversation
  getMessages: async (conversationId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      const { data: user } = await supabase.auth.getUser();
      
      return data.map(message => ({
        id: message.id,
        sender: message.sender_id === user.user?.id ? 'me' : message.sender_id,
        content: message.content,
        timestamp: message.created_at
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },
  
  // Send a new message
  sendMessage: async ({ conversationId, content }) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.user.id,
          content
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update the conversation's last message
      await supabase
        .from('conversations')
        .update({
          last_message: content,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);
      
      return {
        id: data.id,
        sender: 'me',
        content: data.content,
        timestamp: data.created_at
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
  
  // Mark a conversation as read
  markAsRead: async (conversationId) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('conversations')
        .update({
          read_status: true,
          unread_count: 0
        })
        .eq('id', conversationId)
        .neq('user_id', user.user.id);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      return false;
    }
  }
};

export const NotificationService = {
  // Get all notifications for the current user
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as Notification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },
  
  // Get unread notification count
  getUnreadCount: async (): Promise<number> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user.id)
        .eq('is_read', false);
      
      if (error) throw error;
      
      return count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },
  
  // Mark a notification as read
  markAsRead: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
  
  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.user.id)
        .eq('is_read', false);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },
  
  // Delete a notification
  deleteNotification: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },
  
  // Subscribe to real-time notifications
  subscribeToNotifications: (onNewNotification) => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          // Check if this notification is for the current user
          const notification = payload.new as Notification;
          onNewNotification(notification);
        }
      )
      .subscribe();
    
    return channel;
  }
};

export const BrandDealsService = {
  // Get all deals for the current user
  getDeals: async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('brand_deals')
        .select('*, brand:profiles!brand_deals_brand_id_fkey(*), creator:profiles!brand_deals_creator_id_fkey(*)')
        .or(`creator_id.eq.${user.user.id},brand_id.eq.${user.user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching deals:', error);
      return [];
    }
  },
  
  // Get a specific deal
  getDeal: async (id) => {
    try {
      const { data, error } = await supabase
        .from('brand_deals')
        .select('*, brand:profiles!brand_deals_brand_id_fkey(*), creator:profiles!brand_deals_creator_id_fkey(*)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching deal:', error);
      return null;
    }
  },
  
  // Create a new deal
  createDeal: async (dealData) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('brand_deals')
        .insert({
          ...dealData,
          brand_id: user.user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating deal:', error);
      throw error;
    }
  },
  
  // Update a deal status
  updateDealStatus: async (id, status) => {
    try {
      const { data, error } = await supabase
        .from('brand_deals')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error updating deal status:', error);
      throw error;
    }
  }
};

export const ProfileService = {
  // Get user profile
  getProfile: async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },
  
  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  // Upload avatar
  uploadAvatar: async (file) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase
        .storage
        .from('user-content')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data } = supabase
        .storage
        .from('user-content')
        .getPublicUrl(filePath);
      
      // Update profile with avatar URL
      await supabase
        .from('profiles')
        .update({
          avatar_url: data.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.user.id);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  }
};

// Export the SocialAPI from socialService
export { SocialAPI };
