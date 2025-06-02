
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Deal {
  id: string;
  brand_id: string;
  creator_id: string;
  description: string;
  price: number;
  status: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export const useRealDeals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch deals based on user role
  const { data: deals, isLoading, error } = useQuery({
    queryKey: ['deals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get user role to determine which deals to fetch
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const userRole = userRoles?.[0]?.role || 'creator';

      let query = supabase
        .from('deals')
        .select(`
          *,
          profiles!deals_brand_id_fkey(full_name, avatar_url)
        `);

      if (userRole === 'creator') {
        query = query.eq('creator_id', user.id);
      } else if (userRole === 'brand') {
        query = query.eq('brand_id', user.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as Deal[];
    },
    enabled: !!user?.id,
  });

  // Respond to a deal (accept/reject)
  const respondToDealMutation = useMutation({
    mutationFn: async ({ dealId, status }: { dealId: string; status: string }) => {
      const { error } = await supabase
        .from('deals')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', dealId);

      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({
        title: 'Deal updated',
        description: `Deal has been ${status}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update deal',
        variant: 'destructive',
      });
    },
  });

  // Create a new deal (for brands)
  const createDealMutation = useMutation({
    mutationFn: async (dealData: {
      creator_id: string;
      description: string;
      price: number;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('deals')
        .insert({
          ...dealData,
          brand_id: user.id,
          status: 'pending',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({
        title: 'Deal created',
        description: 'Your deal offer has been sent',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create deal',
        variant: 'destructive',
      });
    },
  });

  return {
    deals: deals || [],
    isLoading,
    error,
    respondToDeal: respondToDealMutation.mutate,
    createDeal: createDealMutation.mutate,
    isCreatingDeal: createDealMutation.isPending,
    isRespondingToDeal: respondToDealMutation.isPending,
  };
};
