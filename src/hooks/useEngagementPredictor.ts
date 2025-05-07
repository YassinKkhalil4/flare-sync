
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { 
  EngagementPredictionRequest, 
  EngagementPredictionResult,
  EngagementPrediction
} from '@/types/engagement';

export const useEngagementPredictor = () => {
  const { user } = useAuth();
  const [isPredicting, setIsPredicting] = useState(false);

  // Function to predict engagement
  const predictEngagement = async (params: EngagementPredictionRequest): Promise<EngagementPredictionResult> => {
    try {
      setIsPredicting(true);
      
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        throw new Error('You must be logged in to predict engagement');
      }

      const response = await supabase.functions.invoke('predict-engagement', {
        body: params,
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to predict engagement');
      }

      return response.data.prediction as EngagementPredictionResult;
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
        description: `Overall score: ${data.overallScore}/100`,
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Engagement Prediction Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    },
  });

  // Query to fetch saved predictions
  const { data: savedPredictions, isLoading: isLoadingSavedPredictions, refetch: refetchSavedPredictions } = useQuery({
    queryKey: ['engagementPredictions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('engagement_predictions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data as EngagementPrediction[];
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
