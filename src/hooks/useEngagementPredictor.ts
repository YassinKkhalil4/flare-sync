
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AIService } from '@/services/aiService';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useEngagementPredictor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const { data: savedPredictions, isLoading: isLoadingPredictions } = useQuery({
    queryKey: ['engagement-predictions', user?.id],
    queryFn: () => AIService.getEngagementPredictions(user?.id || ''),
    enabled: !!user?.id,
  });

  const predictMutation = useMutation({
    mutationFn: (params: {
      content: string;
      platform: string;
      hashtags?: string[];
      mediaUrls?: string[];
    }) => AIService.predictEngagement(params.content, params.platform, params.hashtags, params.mediaUrls),
    onSuccess: () => {
      toast({
        title: 'Prediction complete',
        description: 'Engagement prediction has been generated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Prediction failed',
        description: error instanceof Error ? error.message : 'Failed to predict engagement',
        variant: 'destructive',
      });
    },
  });

  const predict = async (params: {
    content: string;
    platform: string;
    hashtags?: string[];
    mediaUrls?: string[];
  }) => {
    setIsLoading(true);
    try {
      return await predictMutation.mutateAsync(params);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    predict,
    isLoading,
    savedPredictions: savedPredictions || [],
    isLoadingPredictions,
  };
};
