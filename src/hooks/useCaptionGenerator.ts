
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { CaptionGenerationRequest, CaptionGenerationResponse, SavedCaption } from '@/types/caption';

export const useCaptionGenerator = () => {
  const { user, session } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  // Function to generate captions
  const generateCaptions = async (params: CaptionGenerationRequest): Promise<CaptionGenerationResponse> => {
    try {
      setIsGenerating(true);
      
      if (!session?.access_token) {
        throw new Error('You must be logged in to generate captions');
      }

      const response = await supabase.functions.invoke('generate-captions', {
        body: params,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate captions');
      }

      return response.data as CaptionGenerationResponse;
    } catch (error) {
      console.error('Error generating captions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate captions';
      
      toast({
        variant: 'destructive',
        title: 'Caption Generation Failed',
        description: errorMessage,
      });
      
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  // Mutation for generating captions
  const captionMutation = useMutation({
    mutationFn: generateCaptions,
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Captions Generated Successfully',
          description: `${data.captions.length} captions have been created.`,
        });
      }
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Caption Generation Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    },
  });

  // Query to fetch saved captions
  const { data: savedCaptions, isLoading: isLoadingSavedCaptions, refetch: refetchSavedCaptions } = useQuery({
    queryKey: ['savedCaptions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('ai_captions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data as SavedCaption[];
    },
    enabled: !!user,
  });

  // Function to save selected caption
  const saveSelectedCaption = async (captionId: string, selectedCaption: string) => {
    try {
      const { error } = await supabase
        .from('ai_captions')
        .update({ selected_caption: selectedCaption })
        .eq('id', captionId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Caption Saved',
        description: 'Your selected caption has been saved.',
      });
      
      // Refresh the saved captions
      refetchSavedCaptions();
      
      return true;
    } catch (error) {
      console.error('Error saving caption:', error);
      
      toast({
        variant: 'destructive',
        title: 'Failed to Save Caption',
        description: 'There was an error saving your selected caption.',
      });
      
      return false;
    }
  };

  return {
    generateCaptions: captionMutation.mutate,
    isGenerating: isGenerating || captionMutation.isPending,
    savedCaptions,
    isLoadingSavedCaptions,
    saveSelectedCaption,
    error: captionMutation.error,
  };
};
