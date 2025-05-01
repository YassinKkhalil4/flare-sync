
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../utils/cors.ts";

// Create a Supabase client with the Admin key
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    const { externalToken, email, redirectUrl } = await req.json();
    
    if (!externalToken || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required authentication data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Here you would validate the external token with flaresync.org
    // This is a placeholder for the actual validation logic
    // const isValidToken = await validateWithExternalSite(externalToken);
    
    // For demonstration, we'll assume the token is valid
    // In production, you should implement proper validation
    const isValidToken = true;
    
    if (!isValidToken) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Look up user by email
    const { data: userData, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();
      
    if (userError || !userData) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Generate a temporary login link that the app can use
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: email,
      options: {
        redirectTo: redirectUrl || "https://app.flaresync.org/dashboard",
      }
    });
    
    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        url: data.properties.action_link,
        message: "Success! Use this link to log into the FlareSync app" 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
