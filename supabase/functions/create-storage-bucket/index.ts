
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
    // Create Supabase admin client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Check if avatars bucket already exists
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets()
    
    if (bucketError) {
      throw bucketError
    }
    
    const avatarsBucket = buckets.find(bucket => bucket.name === 'avatars')
    
    if (!avatarsBucket) {
      // Create the avatars bucket if it doesn't exist
      const { error: createError } = await supabase
        .storage
        .createBucket('avatars', {
          public: true,
          fileSizeLimit: 5242880, // 5MB in bytes
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        })
      
      if (createError) {
        throw createError
      }
      
      return new Response(
        JSON.stringify({ 
          message: "Avatars bucket created successfully" 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
        }
      )
    }
    
    return new Response(
      JSON.stringify({ 
        message: "Avatars bucket already exists" 
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
