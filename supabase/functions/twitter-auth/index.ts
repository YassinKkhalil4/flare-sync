
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    const { code } = await req.json()
    
    if (!code) {
      throw new Error('Authorization code is required')
    }

    // Get Twitter credentials from secrets
    const TWITTER_CLIENT_ID = Deno.env.get('TWITTER_CLIENT_ID')
    const TWITTER_CLIENT_SECRET = Deno.env.get('TWITTER_CLIENT_SECRET')
    const REDIRECT_URI = `${Deno.env.get('SITE_URL') || 'http://localhost:3000'}/social-connect`

    if (!TWITTER_CLIENT_ID || !TWITTER_CLIENT_SECRET) {
      throw new Error('Twitter API credentials not configured')
    }

    // Exchange code for access token using OAuth 2.0
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        code_verifier: 'challenge' // In production, store proper PKCE verifier
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      throw new Error(`Twitter token exchange failed: ${errorText}`)
    }

    const tokenData = await tokenResponse.json()

    // Get user info from Twitter
    const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=public_metrics,profile_image_url', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    })
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch Twitter user info')
    }

    const { data: userData } = await userResponse.json()

    // Store/update social profile
    const { data: existingProfile } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'twitter')
      .single()

    const profileData = {
      user_id: user.id,
      platform: 'twitter',
      username: userData.username,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      followers: userData.public_metrics?.followers_count || 0,
      posts: userData.public_metrics?.tweet_count || 0,
      engagement: 0, // Will be calculated
      connected: true,
      last_synced: new Date().toISOString(),
      profile_url: `https://twitter.com/${userData.username}`,
      stats: userData.public_metrics || {}
    }

    let savedProfile
    if (existingProfile) {
      const { data, error } = await supabase
        .from('social_profiles')
        .update(profileData)
        .eq('id', existingProfile.id)
        .select()
        .single()
      
      if (error) throw error
      savedProfile = data
    } else {
      const { data, error } = await supabase
        .from('social_profiles')
        .insert(profileData)
        .select()
        .single()
      
      if (error) throw error
      savedProfile = data
    }

    return new Response(JSON.stringify({
      success: true,
      profile: savedProfile,
      message: 'Twitter account connected successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Twitter auth error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
