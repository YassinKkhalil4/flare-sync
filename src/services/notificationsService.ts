import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notification';

export const notificationsService = {
  // Get notifications for a user
  getNotifications: async (userId: string, limit?: number): Promise<Notification[]> => {
    try {
      const { count, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .limit(1);
        
      if (countError || count === 0) {
        // If there's an error or no data, return empty array
        return [];
      }
      
      // Otherwise, get real notifications
      const query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (limit) {
        query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data as Notification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },
  
  // Mark a notification as read
  markAsRead: async (notificationId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },
  
  // Mark all notifications as read
  markAllAsRead: async (userId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },
  
  // Delete a notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  },
  
  // Get unread notification count
  getUnreadCount: async (userId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
        
      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }
};
