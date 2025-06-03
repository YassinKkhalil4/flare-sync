
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ContentPlan, ContentPlanRequest, ContentPlanPost } from '@/types/contentPlan';
import { useAuth } from '@/context/AuthContext';

export const useContentPlanGenerator = () => {
  const { user, session } = useAuth();
  const [contentPlan, setContentPlan] = useState<ContentPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Query to fetch saved plans
  const { 
    data: savedPlans, 
    isLoading: isLoadingPlans,
    refetch: refetchPlans 
  } = useQuery({
    queryKey: ['contentPlans', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from('content_plans')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error('Error fetching content plans:', err);
        return [];
      }
    },
    enabled: !!user
  });

  // Generate content plan using real OpenAI API
  const generateContentPlan = async (params: ContentPlanRequest) => {
    try {
      setIsGenerating(true);
      
      if (!session?.access_token) {
        throw new Error('You must be logged in to generate content plans');
      }

      const response = await supabase.functions.invoke('generate-content-plan', {
        body: {
          timeCommitment: params.timeCommitment,
          platforms: params.platforms,
          goal: params.goal,
          niche: params.niche,
          additionalInfo: params.additionalInfo
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate content plan');
      }
      
      const plan = response.data as ContentPlan;
      setContentPlan(plan);
      return plan;
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
  const saveContentPlanMutation = useMutation({
    mutationFn: async (plan: ContentPlan) => {
      if (!user) {
        throw new Error('You must be logged in to save content plans');
      }
      
      const planToSave = {
        ...plan,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('content_plans')
        .insert(planToSave)
        .select('id')
        .single();
        
      if (error) throw error;
      
      const postsToSave = plan.posts.map(post => ({
        ...post,
        plan_id: data.id,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      const { error: postsError } = await supabase
        .from('content_plan_posts')
        .insert(postsToSave);
        
      if (postsError) throw postsError;
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: 'Content Plan Saved',
        description: 'Your content plan has been saved successfully',
      });
    },
    onError: (error) => {
      console.error('Error saving content plan:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Save Content Plan',
        description: 'There was an error saving your content plan',
      });
    }
  });

  const saveContentPlan = async (plan: ContentPlan): Promise<boolean> => {
    try {
      await saveContentPlanMutation.mutateAsync(plan);
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    generateContentPlan,
    isGenerating,
    contentPlan,
    saveContentPlan,
    savedPlans: savedPlans || [],
    isLoadingPlans,
    refetchPlans,
    error: null,
  };
};
