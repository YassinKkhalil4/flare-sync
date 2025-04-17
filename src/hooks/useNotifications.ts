
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '@/services/api';
import { Notification } from '@/types/notification';
import { toast } from '@/hooks/use-toast';

export function useNotifications() {
  const queryClient = useQueryClient();
  const [channel, setChannel] = useState<any>(null);

  // Get all notifications
  const { 
    data: notifications = [], 
    isLoading,
    refetch 
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: NotificationService.getNotifications
  });

  // Get unread notifications count
  const { 
    data: unreadCount = 0,
    refetch: refetchUnreadCount 
  } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: NotificationService.getUnreadCount
  });

  // Mark notification as read
  const markAsRead = useMutation({
    mutationFn: (id: string) => NotificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    }
  });

  // Mark all notifications as read
  const markAllAsRead = useMutation({
    mutationFn: () => NotificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    }
  });

  // Delete notification
  const deleteNotification = useMutation({
    mutationFn: (id: string) => NotificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    }
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = NotificationService.subscribeToNotifications((notification) => {
      // Show toast for new notification
      toast({
        title: notification.title,
        description: notification.message,
      });
      
      // Refetch notifications
      refetch();
      refetchUnreadCount();
    });
    
    setChannel(channel);
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [refetch, refetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: (id: string) => markAsRead.mutate(id),
    markAllAsRead: () => markAllAsRead.mutate(),
    deleteNotification: (id: string) => deleteNotification.mutate(id),
  };
}
