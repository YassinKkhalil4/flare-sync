
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get request data
    const { priceId, plan } = await req.json();
    
    if (!priceId) {
      throw new Error("Price ID is required");
    }

    if (!plan) {
      throw new Error("Plan name is required");
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") as string;
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
    
    if (profileError) {
      throw new Error("Error fetching user profile");
    }
    
    let customerId = profile.stripe_customer_id;
    
    // If no customer ID, create one
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData.user.email,
        metadata: {
          supabase_id: userData.user.id,
        },
      });
      
      customerId = customer.id;
      
      // Save customer ID to user profile
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", userData.user.id);
    }

    // Check if it's an agency plan to include setup fee
    const isAgencyPlan = plan.startsWith('agency-');
    let setupFeeAmount = 0;
    
    if (isAgencyPlan) {
      // Determine setup fee based on plan
      switch(plan) {
        case 'agency-small':
          setupFeeAmount = 499;
          break;
        case 'agency-medium':
          setupFeeAmount = 999;
          break;
        case 'agency-large':
          setupFeeAmount = 1999;
          break;
      }
    }

    // Create line items array
    const lineItems = [
      {
        price: priceId,
        quantity: 1,
      },
    ];

    // Add setup fee if applicable
    if (setupFeeAmount > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Setup Fee",
            description: "One-time setup fee for agency account configuration",
          },
          unit_amount: setupFeeAmount * 100, // Convert to cents
          tax_behavior: "exclusive",
        },
        quantity: 1,
      });
    }
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "subscription",
      subscription_data: {
        metadata: {
          user_id: userData.user.id,
          plan: plan,
        },
      },
      success_url: `${req.headers.get("origin")}/plans?success=true`,
      cancel_url: `${req.headers.get("origin")}/plans?canceled=true`,
    });
    
    return new Response(JSON.stringify({ url: session.url }), {
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
