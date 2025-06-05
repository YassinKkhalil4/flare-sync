
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AIService, ContentPlan } from '@/services/aiService';
import { toast } from '@/hooks/use-toast';

export const useContentPlanGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: contentPlans, isLoading: isLoadingPlans, refetch } = useQuery({
    queryKey: ['contentPlans'],
    queryFn: () => AIService.getContentPlans(),
  });

  const generateMutation = useMutation({
    mutationFn: (params: {
      timeCommitment: string;
      platforms: string[];
      goal: string;
      niche: string;
      additionalInfo?: string;
    }) => AIService.generateContentPlan(params),
    onSuccess: () => {
      toast({
        title: 'Content Plan Generated',
        description: 'Your content plan has been created successfully.',
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate content plan',
        variant: 'destructive',
      });
    },
  });

  const generateContentPlan = async (params: {
    timeCommitment: string;
    platforms: string[];
    goal: string;
    niche: string;
    additionalInfo?: string;
  }) => {
    setIsGenerating(true);
    try {
      await generateMutation.mutateAsync(params);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateContentPlan,
    isGenerating,
    contentPlans,
    isLoadingPlans,
    contentPlan: generateMutation.data,
  };
};
