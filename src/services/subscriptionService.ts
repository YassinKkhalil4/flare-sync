
import { supabase } from '@/integrations/supabase/client';
import { Subscription } from '@/hooks/useSubscription';
import { UserPlan, ensureValidPlan } from '@/lib/supabase';

class SubscriptionService {
  // Fetch current subscription plan for the user
  async getCurrentPlan(userId: string): Promise<Subscription | null> {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // If no subscription found, return Free plan as default
    if (!subscription || (error && error.code === 'PGRST116')) {
      const now = new Date().toISOString();
      return {
        id: '',
        user_id: userId,
        plan: 'free',
        status: 'inactive',
        created_at: now,
        updated_at: now,
        stripe_subscription_id: null,
        current_period_end: null,
      };
    }

    // Throw on any other error
    if (error) throw error;

    // Ensure proper typing
    return {
      id: subscription.id,
      user_id: subscription.user_id,
      plan: ensureValidPlan(subscription.plan),
      status: this.validateStatus(subscription.status),
      created_at: subscription.created_at ?? new Date().toISOString(),
      updated_at: subscription.updated_at ?? new Date().toISOString(),
      stripe_subscription_id: subscription.stripe_subscription_id ?? null,
      current_period_end: subscription.current_period_end ?? null,
    };
  }

  // Validate subscription status
  private validateStatus(status: any): 'active' | 'inactive' | 'past_due' | 'canceled' {
    const validStatuses = ['active', 'inactive', 'past_due', 'canceled'];
    if (validStatuses.includes(status)) {
      return status;
    }
    return 'inactive';
  }

  // Start Stripe checkout
  async checkout({ priceId, plan }: { priceId: string, plan: UserPlan }) {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { priceId, plan },
    });
    if (error) throw error;
    return data;
  }

  // Open Stripe customer portal for managing subscription
  async getCustomerPortalUrl() {
    const { data, error } = await supabase.functions.invoke('customer-portal', { body: {} });
    if (error) throw error;
    return data;
  }
  
  // Refresh subscription status using server-side check
  async checkSubscription() {
    const { data, error } = await supabase.functions.invoke('check-subscription', { body: {} });
    if (error) throw error;
    return data;
  }
}

export const subscriptionService = new SubscriptionService();
