
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

// Webhook signature verification
const verifyWebhookSignature = (body: string, signature: string, secret: string): boolean => {
  try {
    // In production, implement proper Paddle signature verification
    // This is a simplified version for demonstration
    const encoder = new TextEncoder();
    const key = encoder.encode(secret);
    const data = encoder.encode(body);
    
    // For now, just check if signature exists
    // In production, use proper HMAC verification
    return signature && signature.length > 0;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
};

// Rate limiting check
const checkRateLimit = (identifier: string): boolean => {
  // In production, implement proper rate limiting with Redis or database
  // For now, just return true
  return true;
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
    const signature = req.headers.get('paddle-signature') || '';
    const webhookSecret = Deno.env.get('PADDLE_WEBHOOK_SECRET');
    
    // Verify webhook signature in production
    if (Deno.env.get('DENO_DEPLOYMENT_ID') && webhookSecret) {
      if (!verifyWebhookSignature(body, signature, webhookSecret)) {
        console.error('Invalid webhook signature');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }
    }
    
    // Check rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      console.error('Rate limit exceeded for IP:', clientIP);
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }
    
    const data = JSON.parse(body);
    
    console.log('Webhook event type:', data.event_type);
    console.log('Webhook data:', JSON.stringify(data, null, 2));

    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseAdmin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string);
    
    // Validate payload structure
    if (!data.event_type || !data.data) {
      throw new Error('Invalid webhook payload structure');
    }
    
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
