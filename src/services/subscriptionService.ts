
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

class SubscriptionService {
  async getCurrentPlan(userId: string) {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
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
    return data.url;
  }
}

export const subscriptionService = new SubscriptionService();
