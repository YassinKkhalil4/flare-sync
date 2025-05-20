
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    // Parse request body
    const { bucketName } = await req.json();
    
    if (!bucketName) {
      throw new Error('bucketName is required');
    }
    
    // Only allow specific bucket names for security
    const allowedBuckets = ['avatars', 'content', 'media'];
    if (!allowedBuckets.includes(bucketName)) {
      return new Response(
        JSON.stringify({ 
          error: `Bucket name ${bucketName} is not allowed. Allowed bucket names: ${allowedBuckets.join(', ')}` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
    
    // Create Supabase admin client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Check if bucket already exists
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets()
    
    if (bucketError) {
      throw bucketError
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { error: createError } = await supabase
        .storage
        .createBucket(bucketName, {
          public: true,
          fileSizeLimit: 5242880, // 5MB in bytes
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4']
        })
      
      if (createError) {
        throw createError
      }

      // Set up public bucket policy
      const { error: policyError } = await supabase
        .storage
        .from(bucketName)
        .createSignedUrl('dummy-path', 1) // This is just to access the bucket object
      
      if (policyError && !policyError.message.includes('not found')) {
        console.warn('Error creating bucket policy:', policyError);
      }
      
      return new Response(
        JSON.stringify({ 
          message: `${bucketName} bucket created successfully`,
          status: "created" 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
        }
      )
    }
    
    return new Response(
      JSON.stringify({ 
        message: `${bucketName} bucket already exists`,
        status: "exists"  
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
    
  } catch (error) {
    console.error('Error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to create storage bucket" 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
