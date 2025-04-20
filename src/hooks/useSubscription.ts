
import { useQuery } from '@tanstack/react-query';
import { subscriptionService } from '@/services/subscriptionService';
import { useAuth } from '@/context/AuthContext';

export const useSubscription = () => {
  const { user } = useAuth();

  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: () => user ? subscriptionService.getCurrentPlan(user.id) : null,
    enabled: !!user
  });

  return {
    subscription,
    isLoading,
    error
  };
};
