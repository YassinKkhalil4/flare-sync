
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
    
    // Check if user has a Paddle customer ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("paddle_customer_id")
      .eq("id", userData.user.id)
      .single();
    
    if (profileError || !profile?.paddle_customer_id) {
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
    
    // Get subscriptions from Paddle
    const paddleApiKey = Deno.env.get("PADDLE_API_KEY");
    if (!paddleApiKey) {
      throw new Error("PADDLE_API_KEY is not set");
    }
    
    const paddleResponse = await fetch(`https://api.paddle.com/subscriptions?customer_id=${profile.paddle_customer_id}`, {
      headers: {
        "Authorization": `Bearer ${paddleApiKey}`,
      },
    });

    if (!paddleResponse.ok) {
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

    const paddleData = await paddleResponse.json();
    
    if (!paddleData.data || paddleData.data.length === 0) {
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
    const subscription = paddleData.data[0];
    const plan = ensureValidPlan(subscription.custom_data?.plan || 'basic');
    
    // Update user profile with subscription info
    await supabaseAdmin
      .from("profiles")
      .update({ 
        plan: plan,
        subscription_id: subscription.id,
        subscription_status: subscription.status,
        current_period_end: subscription.next_billed_at
      })
      .eq("id", userData.user.id);
    
    return new Response(JSON.stringify({ 
      subscribed: subscription.status === 'active',
      plan: plan,
      current_period_end: subscription.next_billed_at,
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
