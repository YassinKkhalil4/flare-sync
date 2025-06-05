
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RealDealsService } from '@/services/realDealsService';
import { useAuth } from '@/context/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';

export const useRealDeals = () => {
  const { user } = useAuth();
  const { userRole } = useUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['deals', user?.id, userRole],
    queryFn: () => RealDealsService.getDealsForUser(user!.id, userRole || 'creator'),
    enabled: !!user?.id && !!userRole,
  });

  const createDealMutation = useMutation({
    mutationFn: (dealData: {
      creator_id: string;
      title: string;
      description: string;
      budget: number;
      requirements: string[];
      deliverables: string[];
      deadline?: string;
    }) => RealDealsService.createDeal(dealData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({ title: 'Success', description: 'Deal created successfully' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create deal',
        variant: 'destructive',
      });
    },
  });

  const respondToDealMutation = useMutation({
    mutationFn: ({ dealId, status }: { dealId: string; status: 'accepted' | 'rejected' | 'completed' }) =>
      RealDealsService.updateDealStatus(dealId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({ title: 'Success', description: 'Deal updated successfully' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update deal',
        variant: 'destructive',
      });
    },
  });

  return {
    deals,
    isLoading,
    createDeal: createDealMutation.mutate,
    respondToDeal: respondToDealMutation.mutate,
    isCreatingDeal: createDealMutation.isPending,
    isRespondingToDeal: respondToDealMutation.isPending,
  };
};
