
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

    // Get TikTok credentials
    const clientId = Deno.env.get('TIKTOK_CLIENT_ID')
    const clientSecret = Deno.env.get('TIKTOK_CLIENT_SECRET')
    const redirectUri = Deno.env.get('TIKTOK_REDIRECT_URI') || 
                        `${new URL(req.url).origin}/social-connect`

    if (!clientId || !clientSecret) {
      throw new Error('TikTok configuration not set')
    }

    // Exchange code for access token using TikTok's OAuth endpoint
    const tokenResponse = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
      method: 'POST',
      body: new URLSearchParams({
        client_key: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    
    // TikTok has a different response structure
    if (tokenData.message !== 'success') {
      throw new Error(tokenData.data || 'TikTok API error')
    }

    const accessToken = tokenData.data.access_token
    const refreshToken = tokenData.data.refresh_token
    const openId = tokenData.data.open_id

    // Get user information
    const userResponse = await fetch(
      `https://open-api.tiktok.com/user/info/?open_id=${openId}&access_token=${accessToken}`
    )
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data')
    }
    
    const userData = await userResponse.json()
    
    if (userData.message !== 'success') {
      throw new Error('Failed to get user info: ' + userData.data.description)
    }
    
    const userInfo = userData.data.user;

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
        platform: 'tiktok',
        username: userInfo.display_name || openId,
        profile_url: `https://tiktok.com/@${userInfo.unique_id || openId}`,
        connected: true,
        last_synced: new Date().toISOString(),
        access_token: accessToken,
        refresh_token: refreshToken,
        followers: userInfo.follower_count || 0,
        posts: userInfo.video_count || 0,
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
