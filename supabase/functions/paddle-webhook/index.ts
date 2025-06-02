
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to validate plan
const ensureValidPlan = (plan: string): string => {
  const validPlans = [
    'basic', 'pro', 'enterprise', 
    'agency-small', 'agency-medium', 'agency-large'
  ];
  
  if (validPlans.includes(plan)) {
    return plan;
  }
  return 'basic'; // Default to basic for any invalid value
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log('Paddle webhook received');
    
    // Get the raw body for signature verification
    const body = await req.text();
    const data = JSON.parse(body);
    
    console.log('Webhook event type:', data.event_type);
    console.log('Webhook data:', JSON.stringify(data, null, 2));

    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseAdmin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string);
    
    // Handle different Paddle events
    switch (data.event_type) {
      case 'subscription.created':
      case 'subscription.updated':
      case 'subscription.activated':
        await handleSubscriptionEvent(supabaseAdmin, data);
        break;
        
      case 'subscription.canceled':
      case 'subscription.past_due':
        await handleSubscriptionCancellation(supabaseAdmin, data);
        break;
        
      case 'transaction.completed':
        await handleTransactionCompleted(supabaseAdmin, data);
        break;
        
      default:
        console.log('Unhandled webhook event type:', data.event_type);
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

async function handleSubscriptionEvent(supabase: any, data: any) {
  const subscription = data.data;
  const customData = subscription.custom_data || {};
  
  if (!customData.user_id) {
    console.error('No user_id in subscription custom_data');
    return;
  }
  
  const plan = ensureValidPlan(customData.plan || 'basic');
  
  console.log('Updating subscription for user:', customData.user_id);
  
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_id: subscription.id,
      subscription_status: subscription.status,
      current_period_end: subscription.next_billed_at,
      plan: plan,
      paddle_customer_id: subscription.customer_id
    })
    .eq('id', customData.user_id);
    
  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
  
  console.log('Successfully updated subscription for user:', customData.user_id);
}

async function handleSubscriptionCancellation(supabase: any, data: any) {
  const subscription = data.data;
  const customData = subscription.custom_data || {};
  
  if (!customData.user_id) {
    console.error('No user_id in subscription custom_data');
    return;
  }
  
  console.log('Handling subscription cancellation for user:', customData.user_id);
  
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: subscription.status,
      plan: 'basic' // Downgrade to basic plan
    })
    .eq('id', customData.user_id);
    
  if (error) {
    console.error('Error updating cancelled subscription:', error);
    throw error;
  }
  
  console.log('Successfully handled cancellation for user:', customData.user_id);
}

async function handleTransactionCompleted(supabase: any, data: any) {
  const transaction = data.data;
  const customData = transaction.custom_data || {};
  
  if (!customData.user_id) {
    console.error('No user_id in transaction custom_data');
    return;
  }
  
  console.log('Transaction completed for user:', customData.user_id);
  
  // If this is a one-time purchase or setup fee, we might want to handle it differently
  // For now, we'll just log it
  console.log('Transaction details:', {
    id: transaction.id,
    status: transaction.status,
    total: transaction.details.totals.total,
    currency: transaction.currency_code
  });
}
