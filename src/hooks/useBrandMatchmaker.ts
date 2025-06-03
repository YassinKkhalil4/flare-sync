
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BrandMatchRequest, BrandMatchResult, CreatorProfile, BrandProfile } from '@/types/brandMatchmaking';
import { useAuth } from '@/context/AuthContext';

interface MutationCallbacks {
  onSuccess?: (data: BrandMatchResult[]) => void;
  onError?: (error: Error) => void;
}

export const useBrandMatchmaker = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [isMatching, setIsMatching] = useState(false);

  // Get creator profile
  const { data: creatorProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['creatorProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data as CreatorProfile;
    },
    enabled: !!user?.id,
  });

  // Find brand matches function using real OpenAI API
  const findBrandMatchesFunction = async (request: BrandMatchRequest): Promise<BrandMatchResult[]> => {
    try {
      setIsMatching(true);
      
      if (!session?.access_token) {
        throw new Error('You must be logged in to find brand matches');
      }

      const response = await supabase.functions.invoke('brand-matchmaker', {
        body: request,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to find brand matches');
      }

      return response.data as BrandMatchResult[];
    } catch (error) {
      console.error('Error finding brand matches:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to find brand matches';
      
      toast({
        variant: 'destructive',
        title: 'Brand Matchmaking Failed',
        description: errorMessage
      });
      
      throw error;
    } finally {
      setIsMatching(false);
    }
  };

  // Function to handle brand matching with callbacks
  const findBrandMatches = (request: BrandMatchRequest, callbacks?: MutationCallbacks) => {
    findBrandMatchesFunction(request)
      .then((data) => {
        toast({
          title: 'Brand Matches Found',
          description: `Found ${data.length} potential brand partners for you!`
        });
        callbacks?.onSuccess?.(data);
      })
      .catch((error) => {
        toast({
          variant: 'destructive',
          title: 'Matchmaking Failed',
          description: error instanceof Error ? error.message : 'An unexpected error occurred'
        });
        callbacks?.onError?.(error);
      });
  };

  // Get all brands for admin view
  const { data: allBrands, isLoading: isLoadingBrands } = useQuery({
    queryKey: ['allBrands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'brand');
      
      if (error) {
        throw error;
      }
      
      return data as BrandProfile[];
    },
    enabled: false,
  });

  return {
    findBrandMatches,
    isMatching,
    creatorProfile,
    isLoadingProfile,
    allBrands,
    isLoadingBrands,
  };
};
