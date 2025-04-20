
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type SubscriptionPlan = 'free' | 'basic' | 'pro';

interface SubscriptionData {
  subscribed: boolean;
  plan: SubscriptionPlan;
  current_period_end?: string;
  status?: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false,
    plan: 'free'
  });

  // Check subscription status
  const checkSubscription = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscriptionData(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: 'Error checking subscription',
        description: 'Could not verify your subscription status. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Start Stripe checkout process
  const startCheckout = async (priceId: string, plan: SubscriptionPlan) => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please log in to subscribe to a plan',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, plan }
      });
      
      if (error) throw error;
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Checkout failed',
        description: 'Could not start the checkout process. Please try again.',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  // Open Stripe customer portal
  const openCustomerPortal = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: 'Error',
        description: 'Could not open the customer portal. Please try again.',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  // Check subscription when user changes
  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setSubscriptionData({ subscribed: false, plan: 'free' });
    }
  }, [user]);

  // Check subscription when returning from Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');
    
    if (success === 'true') {
      toast({
        title: 'Subscription successful',
        description: 'Your subscription has been processed. Thank you!',
      });
      checkSubscription();
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (canceled === 'true') {
      toast({
        title: 'Subscription canceled',
        description: 'You have canceled the subscription process.',
      });
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return {
    isLoading,
    subscribed: subscriptionData.subscribed,
    plan: subscriptionData.plan,
    currentPeriodEnd: subscriptionData.current_period_end,
    status: subscriptionData.status,
    checkSubscription,
    startCheckout,
    openCustomerPortal
  };
};
