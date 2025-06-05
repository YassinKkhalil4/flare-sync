
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AIService } from '@/services/aiService';
import { toast } from '@/hooks/use-toast';

export const useScheduler = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeMutation = useMutation({
    mutationFn: (params: {
      platform: string;
      contentType: string;
      audienceLocation: string;
      postCount: number;
    }) => AIService.getOptimalPostingTimes(params),
    onSuccess: () => {
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
  }) => {
    setIsAnalyzing(true);
    try {
      return await analyzeMutation.mutateAsync(params);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeSchedule,
    isAnalyzing,
    schedulingData: analyzeMutation.data,
  };
};
