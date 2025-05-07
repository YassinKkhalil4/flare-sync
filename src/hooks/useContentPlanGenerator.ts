
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ContentPlan, ContentPlanRequest } from '@/types/contentPlan';
import { useAuth } from '@/context/AuthContext';

export const useContentPlanGenerator = () => {
  const { user, session } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate content plan
  const generateContentPlan = async (params: ContentPlanRequest): Promise<ContentPlan> => {
    try {
      setIsGenerating(true);
      
      if (!session?.access_token) {
        throw new Error('You must be logged in to generate a content plan');
      }

      const response = await supabase.functions.invoke('generate-content-plan', {
        body: params,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate content plan');
      }

      return response.data as ContentPlan;
    } catch (error) {
      console.error('Error generating content plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate content plan';
      
      toast({
        variant: 'destructive',
        title: 'Content Plan Generation Failed',
        description: errorMessage,
      });
      
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  // Save content plan
  const saveContentPlan = async (plan: ContentPlan): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('content_plans')
        .insert({
          id: plan.id,
          user_id: user?.id,
          name: plan.name,
          start_date: plan.startDate,
          end_date: plan.endDate,
          goal: plan.goal,
          platforms: plan.platforms,
          posts: plan.posts
        });
      
      if (error) throw error;
      
      toast({
        title: 'Content Plan Saved',
        description: 'Your content plan has been saved successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error saving content plan:', error);
      
      toast({
        variant: 'destructive',
        title: 'Failed to Save Content Plan',
        description: 'There was an error saving your content plan',
      });
      
      return false;
    }
  };

  // Get saved content plans
  const { data: savedPlans, isLoading: isLoadingPlans, refetch: refetchPlans } = useQuery({
    queryKey: ['contentPlans', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('content_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data as ContentPlan[];
    },
    enabled: !!user,
  });

  const planMutation = useMutation({
    mutationFn: generateContentPlan,
    onSuccess: () => {
      toast({
        title: 'Content Plan Generated',
        description: 'Your custom content plan is ready',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Plan Generation Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    },
  });

  return {
    generateContentPlan: planMutation.mutate,
    isGenerating: isGenerating || planMutation.isPending,
    saveContentPlan,
    contentPlan: planMutation.data,
    savedPlans,
    isLoadingPlans,
    refetchPlans,
    error: planMutation.error,
  };
};
