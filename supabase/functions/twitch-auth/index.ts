
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

    // Get Twitch credentials
    const clientId = Deno.env.get('TWITCH_CLIENT_ID')
    const clientSecret = Deno.env.get('TWITCH_CLIENT_SECRET')
    const redirectUri = Deno.env.get('TWITCH_REDIRECT_URI') || 
                        `${new URL(req.url).origin}/social-connect`

    if (!clientId || !clientSecret) {
      throw new Error('Twitch configuration not set')
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: clientId,
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
    const accessToken = tokenData.access_token
    const refreshToken = tokenData.refresh_token
    
    // Get user information
    const userResponse = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data')
    }
    
    const userData = await userResponse.json()
    
    if (!userData.data || userData.data.length === 0) {
      throw new Error('No Twitch user found')
    }
    
    const user = userData.data[0]
    const userId = user.id
    const username = user.login
    const displayName = user.display_name

    // Get user followers count
    const followsResponse = await fetch(`https://api.twitch.tv/helix/users/follows?to_id=${userId}`, {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    let followersCount = 0
    if (followsResponse.ok) {
      const followsData = await followsResponse.json()
      followersCount = followsData.total || 0
    }
    
    // Get user's recent streams (as "posts")
    const streamsResponse = await fetch(`https://api.twitch.tv/helix/videos?user_id=${userId}&type=archive`, {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    let streamsCount = 0
    if (streamsResponse.ok) {
      const streamsData = await streamsResponse.json()
      streamsCount = streamsData.data?.length || 0
    }

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
        platform: 'twitch',
        username: displayName || username,
        profile_url: `https://twitch.tv/${username}`,
        connected: true,
        last_synced: new Date().toISOString(),
        access_token: accessToken,
        refresh_token: refreshToken,
        followers: followersCount,
        posts: streamsCount,
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
