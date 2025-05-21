
import { supabase } from '@/integrations/supabase/client';

export interface CheckoutParams {
  priceId: string;
  plan: string;
}

export interface CustomerPortalParams {
  returnUrl?: string;
}

export const subscriptionService = {
  
  getCurrentPlan: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('plan, subscription_id, subscription_status, current_period_end')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      return {
        id: userId,
        user_id: userId,
        plan: data.plan || 'free',
        stripe_subscription_id: data.subscription_id || null,
        current_period_end: data.current_period_end || null,
        status: data.subscription_status || 'inactive',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting current plan:', error);
      return null;
    }
  },
  
  checkSubscription: async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('No active session');
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error checking subscription:', error);
      throw error;
    }
  },
  
  checkout: async (params: CheckoutParams) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('No active session');
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: params,
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },
  
  getCustomerPortalUrl: async (params?: CustomerPortalParams) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('No active session');
      
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error getting customer portal URL:', error);
      throw error;
    }
  }
};
