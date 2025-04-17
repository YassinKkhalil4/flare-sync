
import { supabase } from '@/integrations/supabase/client';
import { Notification, NotificationPreferences, NotificationType } from '@/types/notification';

export class NotificationAPI {
  async getNotifications(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getUnreadCount(): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);
    
    if (error) throw error;
    return count || 0;
  }

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    
    if (error) throw error;
  }

  async markAllAsRead(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);
    
    if (error) throw error;
  }

  async deleteNotification(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  async createNotification({
    type,
    title,
    message,
    userId,
    relatedEntityType,
    relatedEntityId,
    imageUrl
  }: {
    type: NotificationType;
    title: string;
    message: string;
    userId: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    imageUrl?: string;
  }): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        related_entity_type: relatedEntityType,
        related_entity_id: relatedEntityId,
        image_url: imageUrl,
        is_read: false
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') { // Not found error
      throw error;
    }
    
    if (!data) {
      // Create default preferences if none exist
      const { data: newPreferences, error: insertError } = await supabase
        .from('notification_preferences')
        .insert({})
        .select()
        .single();
      
      if (insertError) throw insertError;
      return newPreferences;
    }
    
    return data;
  }

  async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .update(preferences)
      .eq('user_id', preferences.user_id!)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Set up subscription for real-time notifications
  subscribeToNotifications(callback: (notification: Notification) => void) {
    return supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();
  }
}

export const NotificationService = new NotificationAPI();
