
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AIService, EngagementPrediction } from '@/services/aiService';
import { toast } from '@/hooks/use-toast';

export interface EngagementPredictionRequest {
  platform: string;
  caption: string;
  scheduledTime: string;
  postType: string;
  mediaMetadata?: any;
}

export const useEngagementPredictor = () => {
  const [isPredicting, setIsPredicting] = useState(false);

  const { data: savedPredictions, isLoading: isLoadingSavedPredictions, refetch } = useQuery({
    queryKey: ['engagementPredictions'],
    queryFn: () => AIService.getEngagementPredictions(),
  });

  const predictMutation = useMutation({
    mutationFn: (params: EngagementPredictionRequest) => AIService.predictEngagement(params),
    onSuccess: () => {
      toast({
        title: 'Prediction Complete',
        description: 'Your engagement prediction has been generated.',
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Prediction Failed',
        description: error instanceof Error ? error.message : 'Failed to predict engagement',
        variant: 'destructive',
      });
    },
  });

  const predictEngagement = async (params: EngagementPredictionRequest, options?: {
    onSuccess?: (data: EngagementPrediction) => void;
  }) => {
    setIsPredicting(true);
    try {
      const result = await predictMutation.mutateAsync(params);
      options?.onSuccess?.(result);
      return result;
    } finally {
      setIsPredicting(false);
    }
  };

  return {
    predictEngagement,
    isPredicting,
    savedPredictions,
    isLoadingSavedPredictions,
  };
};
