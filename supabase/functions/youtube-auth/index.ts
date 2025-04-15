
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

    // Get YouTube/Google credentials
    const clientId = Deno.env.get('YOUTUBE_CLIENT_ID')
    const clientSecret = Deno.env.get('YOUTUBE_CLIENT_SECRET')
    const redirectUri = Deno.env.get('YOUTUBE_REDIRECT_URI') || 
                        `${new URL(req.url).origin}/social-connect`

    if (!clientId || !clientSecret) {
      throw new Error('YouTube configuration not set')
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token
    const refreshToken = tokenData.refresh_token
    
    // Get channel information
    const channelResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    if (!channelResponse.ok) {
      throw new Error('Failed to fetch channel data')
    }
    
    const channelData = await channelResponse.json()
    
    if (!channelData.items || channelData.items.length === 0) {
      throw new Error('No YouTube channel found')
    }
    
    const channel = channelData.items[0]
    const channelId = channel.id
    const channelTitle = channel.snippet.title
    const subscribers = parseInt(channel.statistics.subscriberCount) || 0
    const videoCount = parseInt(channel.statistics.videoCount) || 0
    
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
        platform: 'youtube',
        username: channelTitle,
        profile_url: `https://youtube.com/channel/${channelId}`,
        connected: true,
        last_synced: new Date().toISOString(),
        access_token: accessToken,
        refresh_token: refreshToken,
        followers: subscribers,
        posts: videoCount,
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
