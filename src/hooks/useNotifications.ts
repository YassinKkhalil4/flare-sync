
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Notification } from '@/types/database';

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Fetch all notifications for the current user
  const {
    data: notifications = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (error) throw error;
        
        return data as Notification[];
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return [];
      }
    },
    enabled: !!user,
  });
  
  // Calculate unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter(notification => !notification.is_read).length;
    setUnreadCount(count);
  }, [notifications]);
  
  // Mark a single notification as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true 
        } as any)
        .eq('id', notificationId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return notificationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to mark notification as read: ${error}`,
        variant: 'destructive',
      });
    }
  });
  
  // Mark all notifications as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true 
        } as any)
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      if (error) throw error;
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to mark all notifications as read: ${error}`,
        variant: 'destructive',
      });
    }
  });
  
  // Delete a notification
  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      return notificationId;
    },
    onSuccess: (notificationId) => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      toast({
        title: 'Success',
        description: 'Notification deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete notification: ${error}`,
        variant: 'destructive',
      });
    }
  });
  
  return {
    notifications,
    unreadCount,
    isLoading,
    refetch,
    markAsRead: (notificationId: string) => markAsRead.mutate(notificationId),
    markAllAsRead: () => markAllAsRead.mutate(),
    deleteNotification: (notificationId: string) => deleteNotification.mutate(notificationId),
    isMarkingAsRead: markAsRead.isPending,
    isMarkingAllAsRead: markAllAsRead.isPending,
    isDeleting: deleteNotification.isPending,
  };
}
