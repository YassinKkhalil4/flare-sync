
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") as string;
    const supabaseAdmin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string);
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Invalid token");
    }
    
    // Check if user has a Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userData.user.id)
      .single();
    
    if (profileError || !profile?.stripe_customer_id) {
      // No subscription found - set to basic plan (non-subscribed)
      await supabaseAdmin
        .from("profiles")
        .update({ plan: 'basic' })
        .eq("id", userData.user.id);
        
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: 'basic'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Get subscriptions from Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'active',
      limit: 1,
      expand: ['data.items.data.price.product'],
    });
    
    if (subscriptions.data.length === 0) {
      // No active subscription - set to basic plan (non-subscribed)
      await supabaseAdmin
        .from("profiles")
        .update({ plan: 'basic' })
        .eq("id", userData.user.id);
        
      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: 'basic'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // We have an active subscription
    const subscription = subscriptions.data[0];
    const plan = ensureValidPlan(subscription.metadata.plan || 'basic');
    
    // Update user profile with subscription info
    await supabaseAdmin
      .from("profiles")
      .update({ 
        plan: plan,
        subscription_id: subscription.id,
        subscription_status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
      })
      .eq("id", userData.user.id);
    
    return new Response(JSON.stringify({ 
      subscribed: true,
      plan: plan,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      status: subscription.status
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
