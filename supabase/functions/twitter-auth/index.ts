
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
    // Get request parameters
    const body = await req.json();
    const { code, state } = body;

    if (!code) {
      throw new Error('No code provided')
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Get Twitter credentials
    const clientId = Deno.env.get('TWITTER_CLIENT_ID')
    const clientSecret = Deno.env.get('TWITTER_CLIENT_SECRET')
    const redirectUri = Deno.env.get('TWITTER_REDIRECT_URI') || 
                        `${new URL(req.url).origin}/social-connect`

    if (!clientId || !clientSecret) {
      throw new Error('Twitter configuration not set')
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: 'challenge' // Should match the code_challenge sent in the auth request
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token
    
    // Get user information
    const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=public_metrics', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data')
    }
    
    const userData = await userResponse.json()
    const userId = userData.data.id
    const username = userData.data.username
    const followers = userData.data.public_metrics?.followers_count || 0
    const tweetCount = userData.data.public_metrics?.tweet_count || 0

    // Get user from state param (contains JWT)
    const { data: authData } = await supabase.auth.getUser(state)
    if (!authData.user) {
      throw new Error('User not authenticated')
    }

    // Store profile in database
    const { data: profile, error } = await supabase
      .from('social_profiles')
      .upsert({
        user_id: authData.user.id,
        platform: 'twitter',
        username: username,
        profile_url: `https://twitter.com/${username}`,
        connected: true,
        last_synced: new Date().toISOString(),
        access_token: accessToken,
        followers: followers,
        posts: tweetCount,
        engagement: parseFloat((Math.random() * 2 + 3).toFixed(1)) // Mock data for engagement
      }, {
        onConflict: 'user_id, platform'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ success: true, profile }), {
      status: 200,
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
