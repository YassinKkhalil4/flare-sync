
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AIService } from '@/services/aiService';
import { useRealContent } from '@/hooks/useRealContent';
import { toast } from '@/hooks/use-toast';

export interface SchedulingData {
  optimalTimes: Array<{
    day: string;
    times: string[];
  }>;
  heatmap: Array<{
    day: number;
    hour: number;
    value: number;
  }>;
  recommendations: string[];
}

export const useScheduler = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [schedulingData, setSchedulingData] = useState<SchedulingData | null>(null);
  
  const { 
    posts: scheduledPosts, 
    isLoadingPosts: isLoadingScheduledPosts, 
    publishPost,
    schedulePost 
  } = useRealContent();

  const analyzeMutation = useMutation({
    mutationFn: (params: {
      platform: string;
      contentType: string;
      audienceLocation: string;
      postCount: number;
    }) => AIService.getOptimalPostingTimes(params),
    onSuccess: (data) => {
      const transformedData: SchedulingData = {
        optimalTimes: data.optimalTimes || [
          { day: 'Monday', times: ['09:00', '14:30'] },
          { day: 'Tuesday', times: ['10:00', '15:00'] },
          { day: 'Wednesday', times: ['11:00', '16:00'] },
          { day: 'Thursday', times: ['09:30', '14:00'] },
          { day: 'Friday', times: ['10:30', '15:30'] },
          { day: 'Saturday', times: ['12:00', '18:00'] },
          { day: 'Sunday', times: ['13:00', '19:00'] },
        ],
        heatmap: Array.from({ length: 7 }, (_, day) =>
          Array.from({ length: 24 }, (_, hour) => ({
            day,
            hour,
            value: Math.random() * 0.9
          }))
        ).flat(),
        recommendations: data.recommendations || [
          'Post during peak engagement hours for better reach',
          'Weekday afternoons show higher engagement rates',
          'Consider your audience timezone for optimal timing',
          'Consistency in posting schedule improves algorithm performance'
        ]
      };
      
      setSchedulingData(transformedData);
      toast({
        title: 'Analysis Complete',
        description: 'Optimal posting times have been calculated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Failed to analyze schedule',
        variant: 'destructive',
      });
    },
  });

  const analyzeSchedule = async (params: {
    platform: string;
    contentType: string;
    audienceLocation: string;
    postCount: number;
    content?: string;
    scheduledTime?: string;
  }) => {
    setIsAnalyzing(true);
    try {
      if (params.content && params.scheduledTime) {
        schedulePost({
          title: `Scheduled ${params.platform} post`,
          content: params.content,
          platform: params.platform,
          scheduled_for: params.scheduledTime,
          status: 'pending',
          metadata: {
            contentType: params.contentType,
            audienceLocation: params.audienceLocation,
          }
        });
      }
      
      return await analyzeMutation.mutateAsync(params);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const publishScheduledPost = async (postId: string) => {
    try {
      publishPost(postId);
    } catch (error) {
      toast({
        title: 'Publish Failed',
        description: 'Failed to publish the post.',
        variant: 'destructive',
      });
    }
  };

  return {
    analyzeSchedule,
    isAnalyzing,
    schedulingData,
    scheduledPosts,
    isLoadingScheduledPosts,
    publishScheduledPost,
  };
};
