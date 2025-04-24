
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { method, headers } = req
    const authorization = headers.get('Authorization')
    
    if (!authorization) {
      throw new Error('Missing authorization header')
    }
    
    // Get user from token
    const token = authorization.replace('Bearer ', '')
    const { data: authData, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !authData.user) {
      throw new Error('Invalid token')
    }
    
    // Get user's TikTok profile
    const { data: profiles, error: profileError } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .eq('platform', 'tiktok')
      .eq('connected', true)
      
    if (profileError) throw profileError
    if (!profiles || profiles.length === 0) {
      throw new Error('No connected TikTok profile found')
    }
    
    const profile = profiles[0]
    if (!profile.access_token) {
      throw new Error('No access token found for TikTok')
    }
    
    // Get TikTok credentials
    const clientKey = Deno.env.get('TIKTOK_CLIENT_ID')
    
    if (!clientKey) {
      throw new Error('TikTok configuration not set')
    }
    
    // In a real app, we would call the TikTok API to get stats
    // For this demo, we'll simulate changes in stats
    const followersChange = Math.floor(Math.random() * 200) - 50; // Between -50 and +150
    const newFollowers = Math.max(0, (profile.followers || 10000) + followersChange);
    
    const postsChange = Math.floor(Math.random() * 3) - 1; // Between -1 and +2
    const newPosts = Math.max(0, (profile.posts || 50) + postsChange);
    
    const engagementChange = (Math.random() * 0.6) - 0.2; // Between -0.2 and +0.4
    const newEngagement = Math.max(1, Math.min(15, (profile.engagement || 5) + engagementChange));
    
    // Update the profile with new stats
    const { error: updateError } = await supabase
      .from('social_profiles')
      .update({
        followers: newFollowers,
        posts: newPosts,
        engagement: parseFloat(newEngagement.toFixed(1)),
        last_synced: new Date().toISOString()
      })
      .eq('id', profile.id)
      
    if (updateError) throw updateError
    
    return new Response(JSON.stringify({
      message: 'TikTok stats updated successfully',
      stats: {
        followers: newFollowers,
        posts: newPosts,
        engagement: parseFloat(newEngagement.toFixed(1))
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
    
  } catch (error) {
    console.error('Error:', error)
    
    return new Response(JSON.stringify({
      error: error.message || 'An unknown error occurred'
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })
  }
})
