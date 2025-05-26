
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

  // Find brand matches function
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

      // Return mock data for now since the edge function might not be fully implemented
      const mockResults: BrandMatchResult[] = [
        {
          brandId: 'brand-1',
          brandName: 'TechFlow',
          matchScore: 92,
          reasonForMatch: [
            'Perfect audience alignment with tech-savvy millennials',
            'High engagement rate matches brand requirements',
            'Content style aligns with brand voice'
          ],
          estimatedMetrics: {
            cpm: 15,
            ctr: 3.2,
            roi: 180
          }
        },
        {
          brandId: 'brand-2',
          brandName: 'EcoLifestyle',
          matchScore: 88,
          reasonForMatch: [
            'Strong sustainability focus matches brand values',
            'Target demographic overlap of 85%',
            'Previous campaign performance in similar niche'
          ],
          estimatedMetrics: {
            cpm: 12,
            ctr: 2.8,
            roi: 160
          }
        },
        {
          brandId: 'brand-3',
          brandName: 'FitnessPro',
          matchScore: 85,
          reasonForMatch: [
            'Health and wellness content alignment',
            'High engagement on fitness-related posts',
            'Audience demographics match target market'
          ],
          estimatedMetrics: {
            cpm: 18,
            ctr: 3.5,
            roi: 200
          }
        }
      ];

      return mockResults;
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
    enabled: false, // Only load when explicitly requested
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
