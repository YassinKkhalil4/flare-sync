
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsService } from '@/services/dealsService';
import { useToast } from '@/hooks/use-toast';

export const useDeals = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deals, isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: dealsService.getDeals
  });

  const createDealMutation = useMutation({
    mutationFn: dealsService.createDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({
        title: 'Success',
        description: 'Deal created successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create deal',
        variant: 'destructive'
      });
    }
  });

  const respondToDealMutation = useMutation({
    mutationFn: ({ dealId, status }: { dealId: string; status: 'accepted' | 'rejected' }) =>
      dealsService.respondToDeal(dealId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast({
        title: 'Success',
        description: 'Deal response sent successfully'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to respond to deal',
        variant: 'destructive'
      });
    }
  });

  return {
    deals,
    isLoading,
    createDeal: createDealMutation.mutate,
    respondToDeal: respondToDealMutation.mutate
  };
};
