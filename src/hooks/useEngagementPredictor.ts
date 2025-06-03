
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { EngagementPrediction, EngagementPredictionRequest, EngagementPredictionResult } from '@/types/engagement';

export const useEngagementPredictor = () => {
  const { user, session } = useAuth();
  const [isPredicting, setIsPredicting] = useState(false);

  // Function to predict engagement using real OpenAI API
  const predictEngagement = async (params: EngagementPredictionRequest): Promise<EngagementPredictionResult> => {
    try {
      setIsPredicting(true);
      
      if (!session?.access_token) {
        throw new Error('You must be logged in to predict engagement');
      }

      const response = await supabase.functions.invoke('predict-engagement', {
        body: params,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to predict engagement');
      }

      return response.data as EngagementPredictionResult;
    } catch (error) {
      console.error('Error predicting engagement:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to predict engagement';
      
      toast({
        variant: 'destructive',
        title: 'Engagement Prediction Failed',
        description: errorMessage,
      });
      
      throw error;
    } finally {
      setIsPredicting(false);
    }
  };

  // Mutation for predicting engagement
  const predictionMutation = useMutation({
    mutationFn: predictEngagement,
    onSuccess: (data) => {
      toast({
        title: 'Engagement Prediction Complete',
        description: `Overall engagement score: ${data.overallScore}/100`,
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Prediction Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    },
  });

  // Query to fetch saved predictions
  const { data: savedPredictions, isLoading: isLoadingSavedPredictions, refetch: refetchSavedPredictions } = useQuery({
    queryKey: ['savedPredictions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('engagement_predictions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data.map(item => ({
        id: item.id,
        platform: item.platform,
        createdAt: item.created_at,
        caption: item.content,
        post_type: item.platform === 'instagram' ? 'photo' : 'video',
        overall_score: Math.round((item.confidence_score || 0) * 100),
        confidence: item.confidence_score || 0.5,
        metrics: {
          likes: {
            type: 'likes',
            label: 'Likes',
            estimatedCount: item.predicted_likes || 0,
            confidenceScore: item.confidence_score || 0
          },
          comments: {
            type: 'comments',
            label: 'Comments',
            estimatedCount: item.predicted_comments || 0,
            confidenceScore: item.confidence_score || 0
          },
          shares: {
            type: 'shares',
            label: 'Shares',
            estimatedCount: item.predicted_shares || 0,
            confidenceScore: item.confidence_score || 0
          }
        }
      })) as EngagementPrediction[];
    },
    enabled: !!user,
  });

  return {
    predictEngagement: predictionMutation.mutate,
    isPredicting: isPredicting || predictionMutation.isPending,
    savedPredictions,
    isLoadingSavedPredictions,
    refetchSavedPredictions,
    error: predictionMutation.error,
  };
};
