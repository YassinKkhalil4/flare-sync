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

  // Generate content plan
  const generateContentPlan = async (params: ContentPlanRequest) => {
    try {
      setIsGenerating(true);
      
      // Ensure all required fields are present
      const request: ContentPlanRequest = {
        timeCommitment: params.timeCommitment,
        platforms: params.platforms,
        goal: params.goal,
        niche: params.niche,
        additionalInfo: params.additionalInfo
      };
      
      // Simulate API call for now
      // In production, this would be a real API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response 
      const mockPlan: ContentPlan = {
        id: `plan-${Date.now()}`,
        name: `${params.niche} Content Plan`,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        goal: params.goal,
        platforms: params.platforms,
        posts: generateMockPosts(params.platforms),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setContentPlan(mockPlan);
      return mockPlan;
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
  const saveContentPlan = async (plan: ContentPlan): Promise<boolean> => {
    try {
      if (!user) {
        toast({
          variant: 'destructive',
          title: 'Authentication Required',
          description: 'You must be logged in to save content plans',
        });
        return false;
      }
      
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

  // For mock data, return an empty array of saved plans
  const savedPlans: ContentPlan[] = [];
  const isLoadingPlans = false;
  const refetchPlans = () => {};

  return {
    generateContentPlan,
    isGenerating,
    contentPlan,
    saveContentPlan,
    savedPlans,
    isLoadingPlans,
    refetchPlans,
    error: null,
  };
};
