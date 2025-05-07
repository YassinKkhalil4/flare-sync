
import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { scheduledPostService } from '@/services/scheduledPostService';
import { ContentPost } from '@/types/content';

interface ScheduleParams {
  platform: string;
  historicalData?: any;
}

export const useScheduler = () => {
  const { user } = useAuth();
  const [schedulingData, setSchedulingData] = useState<any>(null);
  
  // Fetch scheduled posts
  const { data: scheduledPosts, isLoading: isLoadingScheduledPosts, refetch: refreshScheduledPosts } = useQuery({
    queryKey: ['scheduledPosts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from('content_posts')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['scheduled', 'published'])
          .order('scheduled_for', { ascending: true });
        
        if (error) throw error;
        
        return data as ContentPost[];
      } catch (error) {
        console.error('Error fetching scheduled posts:', error);
        return [];
      }
    },
    enabled: !!user,
  });
  
  // Analyze schedule
  const analyzeSchedule = async (params: ScheduleParams) => {
    try {
      setSchedulingData(null);
      
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('ai-helper', {
        body: {
          feature: 'analyze-schedule',
          params
        },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`,
        },
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to analyze schedule');
      }
      
      setSchedulingData(response.data);
      return response.data;
    } catch (error) {
      console.error('Error analyzing schedule:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze schedule';
      
      toast({
        variant: 'destructive',
        title: 'Schedule Analysis Failed',
        description: errorMessage,
      });
      
      throw error;
    }
  };
  
  // Schedule a post
  const schedulePost = async (post: Omit<ContentPost, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!user) {
        toast({
          variant: 'destructive',
          title: 'Authentication required',
          description: 'You must be logged in to schedule posts',
        });
        return null;
      }
      
      const result = await scheduledPostService.schedulePost({
        ...post,
        user_id: user.id
      });
      
      toast({
        title: 'Post Scheduled',
        description: 'Your post has been scheduled successfully',
      });
      
      refreshScheduledPosts();
      return result;
    } catch (error) {
      console.error('Error scheduling post:', error);
      
      toast({
        variant: 'destructive',
        title: 'Failed to Schedule Post',
        description: 'An error occurred while scheduling your post',
      });
      
      return null;
    }
  };

  const analyzeMutation = useMutation({
    mutationFn: analyzeSchedule,
  });

  return {
    analyzeSchedule: analyzeMutation.mutate,
    isAnalyzing: analyzeMutation.isPending,
    schedulingData,
    schedulePost,
    scheduledPosts,
    isLoadingScheduledPosts,
    refreshScheduledPosts
  };
};
