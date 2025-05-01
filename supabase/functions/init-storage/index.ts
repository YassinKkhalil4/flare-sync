
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Check if avatars bucket already exists
    const { data: buckets } = await supabaseAdmin
      .storage
      .listBuckets();
    
    const avatarBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
    
    if (!avatarBucketExists) {
      // Create avatars bucket
      const { data: bucket, error } = await supabaseAdmin
        .storage
        .createBucket('avatars', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
        });
      
      if (error) throw error;
      
      // Create policy to allow authenticated users to upload their own avatars
      await supabaseAdmin.rpc('create_storage_policy', {
        bucket_name: 'avatars',
        policy_name: 'authenticated can upload',
        definition: `(bucket_id = 'avatars'::text AND auth.role() = 'authenticated'::text)`,
        policy_for: 'INSERT'
      });
      
      // Create policy to allow public read access
      await supabaseAdmin.rpc('create_storage_policy', {
        bucket_name: 'avatars',
        policy_name: 'public can read',
        definition: `(bucket_id = 'avatars'::text)`,
        policy_for: 'SELECT'
      });
      
      return new Response(JSON.stringify({ message: "Avatars bucket created successfully", bucket }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }
    
    return new Response(JSON.stringify({ message: "Avatars bucket already exists" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
