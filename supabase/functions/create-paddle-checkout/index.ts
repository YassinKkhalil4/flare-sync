
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log('Paddle checkout function called');
    
    // Get request data
    const requestBody = await req.text();
    console.log('Request body:', requestBody);
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(requestBody);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      throw new Error("Invalid JSON in request body");
    }
    
    const { priceId, plan } = parsedBody;
    
    console.log('Parsed request data:', { priceId, plan });
    
    if (!priceId) {
      throw new Error("Price ID is required");
    }

    if (!plan) {
      throw new Error("Plan name is required");
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase configuration");
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.error('Auth error:', userError);
      throw new Error("Invalid token");
    }
    
    console.log('User authenticated:', userData.user.id);
    
    const paddleApiKey = Deno.env.get("PADDLE_API_KEY");
    if (!paddleApiKey) {
      throw new Error("PADDLE_API_KEY is not set");
    }

    console.log('Creating Paddle checkout session...');
    
    // Create Paddle checkout session
    const paddlePayload = {
      items: [
        {
          price_id: priceId,
          quantity: 1,
        },
      ],
      customer: {
        email: userData.user.email,
      },
      custom_data: {
        user_id: userData.user.id,
        plan: plan,
      },
      checkout: {
        url: `${req.headers.get("origin")}/plans?success=true`,
      },
      return_url: `${req.headers.get("origin")}/plans?success=true`,
      discount_id: null,
    };
    
    console.log('Paddle API payload:', JSON.stringify(paddlePayload, null, 2));
    
    const paddleResponse = await fetch("https://api.paddle.com/transactions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paddleApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paddlePayload),
    });

    console.log('Paddle response status:', paddleResponse.status);
    
    if (!paddleResponse.ok) {
      const errorText = await paddleResponse.text();
      console.error('Paddle API error response:', errorText);
      
      // Try to parse error response
      let errorData;
      try {
        errorData = JSON.parse(errorText);
        console.error('Parsed Paddle error:', errorData);
      } catch {
        console.error('Raw Paddle error:', errorText);
      }
      
      throw new Error(`Paddle API error (${paddleResponse.status}): ${errorText}`);
    }

    const paddleData = await paddleResponse.json();
    console.log('Paddle success response:', JSON.stringify(paddleData, null, 2));
    
    if (!paddleData.data || !paddleData.data.checkout || !paddleData.data.checkout.url) {
      console.error('Invalid Paddle response structure:', paddleData);
      throw new Error('Invalid response from Paddle API - missing checkout URL');
    }
    
    return new Response(JSON.stringify({ url: paddleData.data.checkout.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error('Checkout function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack || 'No stack trace available'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
