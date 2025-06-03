
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AnalyzeScheduleParams {
  platform: string;
  contentType: string;
  audienceLocation: string;
  postCount: number;
}

interface OptimalTime {
  day: string;
  times: string[];
}

interface HeatmapData {
  day: number;
  hour: number;
  value: number;
}

interface SchedulingData {
  optimalTimes: OptimalTime[];
  heatmap: HeatmapData[];
  recommendations: string[];
}

export const useScheduler = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [schedulingData, setSchedulingData] = useState<SchedulingData | null>(null);

  // Get scheduled posts
  const { 
    data: scheduledPosts, 
    isLoading: isLoadingScheduledPosts,
    refetch: refetchScheduledPosts 
  } = useQuery({
    queryKey: ['scheduledPosts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_for', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const analyzeSchedule = async (params: AnalyzeScheduleParams) => {
    try {
      setIsAnalyzing(true);
      
      if (!session?.access_token) {
        throw new Error('You must be logged in to analyze posting schedule');
      }

      const response = await supabase.functions.invoke('analyze-posting-schedule', {
        body: params,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to analyze posting schedule');
      }

      const data = response.data as SchedulingData;
      setSchedulingData(data);

      toast({
        title: 'Analysis Complete',
        description: `Found optimal posting times for ${params.platform}`,
      });

      return data;
    } catch (error) {
      console.error('Error analyzing schedule:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze posting schedule';
      
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: errorMessage,
      });
      
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const schedulePost = async (postData: any) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert({
          ...postData,
          user_id: user.id,
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Post Scheduled',
        description: 'Your post has been scheduled successfully',
      });

      refetchScheduledPosts();
      return data;
    } catch (error) {
      console.error('Error scheduling post:', error);
      toast({
        variant: 'destructive',
        title: 'Scheduling Failed',
        description: 'Failed to schedule post. Please try again.',
      });
      throw error;
    }
  };

  const publishScheduledPost = async (postId: string, platform: string) => {
    try {
      if (!session?.access_token) {
        throw new Error('You must be logged in to publish posts');
      }

      let functionName = '';
      switch (platform) {
        case 'instagram':
          functionName = 'post-to-instagram';
          break;
        case 'twitter':
          functionName = 'post-to-twitter';
          break;
        case 'tiktok':
          functionName = 'post-to-tiktok';
          break;
        case 'youtube':
          functionName = 'post-to-youtube';
          break;
        default:
          throw new Error(`Publishing to ${platform} not supported yet`);
      }

      const response = await supabase.functions.invoke(functionName, {
        body: { postId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to publish post');
      }

      toast({
        title: 'Post Published',
        description: `Your post has been published to ${platform}`,
      });

      refetchScheduledPosts();
      return response.data;
    } catch (error) {
      console.error('Error publishing post:', error);
      toast({
        variant: 'destructive',
        title: 'Publishing Failed',
        description: error instanceof Error ? error.message : 'Failed to publish post',
      });
      throw error;
    }
  };

  return {
    analyzeSchedule,
    isAnalyzing,
    schedulingData,
    scheduledPosts,
    isLoadingScheduledPosts,
    refetchScheduledPosts,
    schedulePost,
    publishScheduledPost,
  };
};
