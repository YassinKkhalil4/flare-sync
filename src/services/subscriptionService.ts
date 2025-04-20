
import { supabase } from '@/integrations/supabase/client';
import { Subscription } from '@/hooks/useSubscription';

class SubscriptionService {
  async getCurrentPlan(userId: string): Promise<Subscription | null> {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription found, return default free plan
        return {
          id: '',
          user_id: userId,
          plan: 'free',
          status: 'inactive',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      throw error;
    }
    
    return subscription;
  }

  async checkout(priceId: string) {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { priceId }
    });

    if (error) throw error;
    return data;
  }

  async getCustomerPortalUrl() {
    const { data, error } = await supabase.functions.invoke('customer-portal', {
      body: {}
    });

    if (error) throw error;
    return data;
  }
  
  async checkSubscription() {
    const { data, error } = await supabase.functions.invoke('check-subscription', {
      body: {}
    });
    
    if (error) throw error;
    return data;
  }
}

export const subscriptionService = new SubscriptionService();
