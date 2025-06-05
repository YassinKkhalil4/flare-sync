
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AIService, ContentPlan } from '@/services/aiService';
import { useAuth } from '@/context/AuthContext';

export const useContentPlanGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();

  const { data: savedPlans, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['content-plans', user?.id],
    queryFn: () => AIService.getContentPlans(user?.id || ''),
    enabled: !!user?.id,
  });

  const generatePlanMutation = useMutation({
    mutationFn: (params: {
      niche: string;
      platforms: string[];
      goal: string;
      duration: number;
    }) => AIService.generateContentPlan(params.niche, params.platforms, params.goal, params.duration),
    onSuccess: () => {
      // Handle success
    },
    onError: (error) => {
      console.error('Error generating content plan:', error);
    },
  });

  const generatePlan = async (params: {
    niche: string;
    platforms: string[];
    goal: string;
    duration: number;
  }) => {
    setIsGenerating(true);
    try {
      return await generatePlanMutation.mutateAsync(params);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generatePlan,
    isGenerating,
    savedPlans: savedPlans || [],
    isLoadingPlans,
  };
};
