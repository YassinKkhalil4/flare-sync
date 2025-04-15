
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
    // Get Instagram credentials from environment variables
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
    
    // Get user's Instagram profile
    const { data: profiles, error: profileError } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .eq('platform', 'instagram')
      .eq('connected', true)
      
    if (profileError) throw profileError
    if (!profiles || profiles.length === 0) {
      throw new Error('No connected Instagram profile found')
    }
    
    const profile = profiles[0]
    
    // In a real app, we would use the access_token to call the Instagram API
    // For demo purposes, we'll update with simulated data
    
    // Simulate API call to get updated stats
    const updatedStats = {
      followers: Math.floor(Math.random() * 2000) + 10000, // Random between 10k-12k
      posts: Math.floor(Math.random() * 10) + 70, // Random between 70-80
      engagement: (Math.random() * 2 + 3).toFixed(1) // Random between 3-5%
    }
    
    // Update the profile with new stats
    const { error: updateError } = await supabase
      .from('social_profiles')
      .update({
        followers: updatedStats.followers,
        posts: updatedStats.posts,
        engagement: updatedStats.engagement,
        last_synced: new Date().toISOString()
      })
      .eq('id', profile.id)
      
    if (updateError) throw updateError
    
    return new Response(JSON.stringify({
      message: 'Instagram stats updated successfully',
      stats: updatedStats
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
