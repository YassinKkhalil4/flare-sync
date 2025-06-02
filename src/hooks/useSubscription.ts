
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '@/services/subscriptionService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserPlan } from '@/lib/supabase';

export interface Subscription {
  id: string;
  user_id: string;
  plan: UserPlan;
  paddle_subscription_id?: string;
  current_period_end?: string;
  status: 'active' | 'inactive' | 'past_due' | 'canceled';
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading, error } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: () => user ? subscriptionService.getCurrentPlan(user.id) : null,
    enabled: !!user
  });

  const checkSubscriptionMutation = useMutation({
    mutationFn: subscriptionService.checkSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
    }
  });

  const startCheckoutMutation = useMutation({
    mutationFn: subscriptionService.checkout,
    onSuccess: (data) => {
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      toast({
        title: 'Checkout Error',
        description: 'Failed to start checkout process',
        variant: 'destructive'
      });
    }
  });

  const openCustomerPortalMutation = useMutation({
    mutationFn: subscriptionService.getCustomerPortalUrl,
    onSuccess: (data) => {
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      toast({
        title: 'Portal Error',
        description: 'Failed to open subscription management portal',
        variant: 'destructive'
      });
    }
  });

  return {
    subscription,
    plan: subscription?.plan || 'basic',
    subscribed: subscription?.status === 'active',
    currentPeriodEnd: subscription?.current_period_end,
    isLoading,
    error,
    startCheckout: (priceId: string, planName: UserPlan) => 
      startCheckoutMutation.mutate({ priceId, plan: planName }),
    openCustomerPortal: () => openCustomerPortalMutation.mutate({}),
    checkSubscription: () => checkSubscriptionMutation.mutate()
  };
};
