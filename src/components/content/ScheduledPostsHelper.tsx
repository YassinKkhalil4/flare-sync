
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Updated ScheduledPost interface to match database schema
interface ScheduledPost {
  id: string;
  user_id: string;
  content: string;
  media_urls: string[] | null;
  platform: string;
  scheduled_for: string;
  status: string;
  error_message: string | null;
  post_id: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

// Export the useScheduler hook directly
export const useScheduler = (userId: string) => {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchScheduledPosts = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', userId)
        .order('scheduled_for', { ascending: true });

      if (error) {
        throw error;
      }

      setScheduledPosts(data || []);
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load scheduled posts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduledPosts();
  }, [userId]);

  return {
    scheduledPosts,
    isLoading,
    refreshPosts: fetchScheduledPosts,
  };
};

// We don't need this anymore since we're exporting useScheduler directly
// but keeping for backward compatibility
export const createScheduledPostsHelper = () => {
  const useSchedulerFixed = (userId: string) => {
    return useScheduler(userId);
  };
  
  return { useSchedulerFixed };
};
