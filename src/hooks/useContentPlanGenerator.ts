
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ContentPlan, ContentPlanRequest, ContentPlanPost } from '@/types/contentPlan';
import { useAuth } from '@/context/AuthContext';
import { aiServices } from '@/services/api';

export const useContentPlanGenerator = () => {
  const { user } = useAuth();
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

  // Generate content plan
  const generateContentPlan = async (params: ContentPlanRequest) => {
    try {
      setIsGenerating(true);
      
      // Use the real AI service if possible or fallback to mock
      let plan: ContentPlan;
      try {
        const response = await aiServices.contentPlanGenerator.generateContentPlan({
          timeCommitment: params.timeCommitment,
          platforms: params.platforms,
          goal: params.goal,
          niche: params.niche,
          additionalInfo: params.additionalInfo
        });
        
        if (response.error) throw new Error(response.error.message);
        plan = response.data;
      } catch (err) {
        console.warn('Using mock data because AI service failed:', err);
        // Fallback to mock data
        plan = {
          id: `plan-${Date.now()}`,
          name: `${params.niche} Content Plan`,
          content: `<h2>Content Plan for ${params.niche}</h2><p>This is a comprehensive content plan tailored to your ${params.niche} niche and ${params.audience} audience.</p><ul><li>Week 1: Introduction posts to establish your presence</li><li>Week 2: Educational content to provide value</li><li>Week 3: Behind-the-scenes content to build connection</li><li>Week 4: User-generated content and engagement</li></ul>`,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          goal: params.goal,
          platforms: params.platforms,
          posts: generateMockPosts(params.platforms),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      
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

  // Generate mock posts for testing
  const generateMockPosts = (platforms: string[]): ContentPlanPost[] => {
    const posts: ContentPlanPost[] = [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    platforms.forEach(platform => {
      days.forEach(day => {
        if (Math.random() > 0.3) { // Not every day has posts
          posts.push({
            id: `post-${platform}-${day}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            day,
            time: `${Math.floor(Math.random() * 12) + 1}:${Math.random() > 0.5 ? '00' : '30'} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
            platform,
            contentType: Math.random() > 0.5 ? 'image' : 'video',
            title: `${platform} ${day} Post`,
            description: `Engaging ${platform} content for ${day}`,
            suggestedCaption: `Check out this amazing content! #${platform} #${day.toLowerCase()} #trending`,
            hashtags: ['trending', platform.toLowerCase(), day.toLowerCase(), 'content'],
            status: 'draft'
          });
        }
      });
    });
    
    return posts;
  };

  // Save content plan
  const saveContentPlanMutation = useMutation({
    mutationFn: async (plan: ContentPlan) => {
      if (!user) {
        throw new Error('You must be logged in to save content plans');
      }
      
      // Prepare the plan for saving in the database
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
      
      // Save the posts with the plan_id reference
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
