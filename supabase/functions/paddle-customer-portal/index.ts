
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
    
    // Check if user has a Paddle customer ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("paddle_customer_id, subscription_id")
      .eq("id", userData.user.id)
      .single();
    
    if (profileError || !profile?.paddle_customer_id) {
      throw new Error("No Paddle customer found for this user");
    }

    const paddleApiKey = Deno.env.get("PADDLE_API_KEY");
    if (!paddleApiKey) {
      throw new Error("PADDLE_API_KEY is not set");
    }
    
    // Create Paddle customer portal session
    const paddleResponse = await fetch("https://api.paddle.com/customers/customer-portal-sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paddleApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_id: profile.paddle_customer_id,
        return_url: `${req.headers.get("origin")}/plans`,
      }),
    });

    if (!paddleResponse.ok) {
      const errorData = await paddleResponse.text();
      throw new Error(`Paddle API error: ${errorData}`);
    }

    const paddleData = await paddleResponse.json();
    
    return new Response(JSON.stringify({ url: paddleData.data.url }), {
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
