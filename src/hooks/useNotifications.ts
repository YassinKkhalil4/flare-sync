
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@/services/notificationsService';
import { useAuth } from '@/context/AuthContext';
import { Notification } from '@/utils/mockNotificationsData';

export const useNotifications = (limit?: number) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  // Fetch notifications
  const {
    data: notifications,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notifications', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) return [];
      return notificationsService.getNotifications(user.id, limit);
    },
    enabled: !!user?.id,
  });
  
  // Fetch unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user?.id) {
        try {
          const count = await notificationsService.getUnreadCount(user.id);
          setUnreadCount(count);
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      }
    };
    
    fetchUnreadCount();
    
    // Set up polling for unread count (every minute)
    const interval = setInterval(fetchUnreadCount, 60000);
    
    return () => clearInterval(interval);
  }, [user?.id]);
  
  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => 
      notificationsService.markAsRead(notificationId),
    onSuccess: () => {
      // Decrement unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      // Invalidate notifications query to refresh data
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
  
  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => {
      if (!user?.id) return Promise.resolve();
      return notificationsService.markAllAsRead(user.id);
    },
    onSuccess: () => {
      // Reset unread count
      setUnreadCount(0);
      // Invalidate notifications query to refresh data
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
  
  const markAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };
  
  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };
  
  return {
    notifications: notifications || [],
    isLoading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh: refetch,
  };
};
