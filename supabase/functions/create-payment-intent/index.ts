
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') as string;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { amount, currency, description, metadata } = await req.json();

    if (!STRIPE_SECRET_KEY) {
      console.log('STRIPE_SECRET_KEY not configured, simulating payment intent');
      
      const simulatedPaymentIntent = {
        id: `pi_simulated_${Date.now()}`,
        amount,
        currency,
        status: 'requires_payment_method',
        client_secret: `pi_simulated_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`
      };

      // Store transaction record
      await supabase.from('transactions').insert({
        user_id: user.id,
        amount: amount / 100, // Convert from cents
        currency,
        status: 'pending',
        description: description || 'Payment',
        payment_method: 'simulated'
      });

      return new Response(JSON.stringify(simulatedPaymentIntent), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create payment intent with Stripe
    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: amount.toString(),
        currency,
        'metadata[user_id]': user.id,
        'metadata[description]': description || '',
        ...(metadata && Object.fromEntries(
          Object.entries(metadata).map(([key, value]) => [`metadata[${key}]`, value])
        ))
      }),
    });

    const paymentIntent = await stripeResponse.json();
    
    if (!stripeResponse.ok) {
      throw new Error(`Stripe API error: ${paymentIntent.error?.message}`);
    }

    // Store transaction record
    await supabase.from('transactions').insert({
      user_id: user.id,
      amount: amount / 100, // Convert from cents
      currency,
      status: 'pending',
      description: description || 'Payment',
      payment_method: 'stripe'
    });

    return new Response(JSON.stringify({
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      client_secret: paymentIntent.client_secret
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in create-payment-intent function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
