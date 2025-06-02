
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
      console.log('Getting current plan for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('plan, subscription_id, subscription_status, current_period_end, paddle_customer_id')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching user plan:', error);
        throw error;
      }
      
      console.log('Current plan data:', data);
      return {
        id: userId,
        user_id: userId,
        plan: data.plan || 'basic',
        paddle_subscription_id: data.subscription_id || null,
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
      console.log('Checking subscription status...');
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        console.error('No active session found');
        throw new Error('No active session');
      }
      
      console.log('Calling check-paddle-subscription function...');
      const { data, error } = await supabase.functions.invoke('check-paddle-subscription', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });
      
      if (error) {
        console.error('Error from check-paddle-subscription function:', error);
        throw error;
      }
      
      console.log('Subscription check result:', data);
      return data;
    } catch (error) {
      console.error('Error checking subscription:', error);
      throw error;
    }
  },
  
  checkout: async (params: CheckoutParams) => {
    try {
      console.log('Starting checkout with params:', params);
      
      // Validate params
      if (!params.priceId) {
        throw new Error('Price ID is required');
      }
      if (!params.plan) {
        throw new Error('Plan is required');
      }
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        console.error('No active session found for checkout');
        throw new Error('No active session - please log in');
      }
      
      console.log('User session found, calling create-paddle-checkout function...');
      const { data, error } = await supabase.functions.invoke('create-paddle-checkout', {
        body: params,
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (error) {
        console.error('Error from create-paddle-checkout function:', error);
        throw new Error(`Checkout failed: ${error.message || 'Unknown error'}`);
      }
      
      if (!data) {
        throw new Error('No response data from checkout function');
      }
      
      if (data.error) {
        console.error('Checkout function returned error:', data.error);
        throw new Error(`Checkout error: ${data.error}`);
      }
      
      if (!data.url) {
        console.error('No checkout URL in response:', data);
        throw new Error('No checkout URL received from Paddle');
      }
      
      console.log('Checkout successful, URL received:', data.url);
      return data;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  },
  
  getCustomerPortalUrl: async (params?: CustomerPortalParams) => {
    try {
      console.log('Getting customer portal URL...');
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        console.error('No active session found for customer portal');
        throw new Error('No active session');
      }
      
      console.log('Calling paddle-customer-portal function...');
      const { data, error } = await supabase.functions.invoke('paddle-customer-portal', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });
      
      if (error) {
        console.error('Error from paddle-customer-portal function:', error);
        throw error;
      }
      
      console.log('Customer portal result:', data);
      return data;
    } catch (error) {
      console.error('Error getting customer portal URL:', error);
      throw error;
    }
  }
};
