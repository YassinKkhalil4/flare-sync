
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BrandDealCard } from './BrandDealCard';
import { Loader2, Briefcase } from 'lucide-react';

export const BrandDealsList: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['brandDeals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('brand_deals')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const acceptDealMutation = useMutation({
    mutationFn: async (dealId: string) => {
      const { error } = await supabase
        .from('brand_deals')
        .update({ status: 'accepted' })
        .eq('id', dealId)
        .eq('creator_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Deal Accepted',
        description: 'You have successfully accepted this brand deal.',
      });
      queryClient.invalidateQueries({ queryKey: ['brandDeals'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to accept deal',
        variant: 'destructive',
      });
    },
  });

  const rejectDealMutation = useMutation({
    mutationFn: async (dealId: string) => {
      const { error } = await supabase
        .from('brand_deals')
        .update({ status: 'rejected' })
        .eq('id', dealId)
        .eq('creator_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Deal Declined',
        description: 'You have declined this brand deal.',
      });
      queryClient.invalidateQueries({ queryKey: ['brandDeals'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to decline deal',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading deals...</span>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Brand Deals Yet</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Brands will discover your profile and send you collaboration opportunities. 
          Make sure your profile is complete to attract more deals!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Brand Deals ({deals.length})</h2>
      <div className="grid gap-4">
        {deals.map((deal) => (
          <BrandDealCard
            key={deal.id}
            deal={deal}
            onAccept={(dealId) => acceptDealMutation.mutate(dealId)}
            onReject={(dealId) => rejectDealMutation.mutate(dealId)}
            onViewDetails={(dealId) => {
              // Navigate to deal details page
              console.log('View deal details:', dealId);
            }}
          />
        ))}
      </div>
    </div>
  );
};
