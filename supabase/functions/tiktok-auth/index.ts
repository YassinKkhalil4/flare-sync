
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

    // Get TikTok credentials from secrets
    const TIKTOK_CLIENT_KEY = Deno.env.get('TIKTOK_CLIENT_KEY')
    const TIKTOK_CLIENT_SECRET = Deno.env.get('TIKTOK_CLIENT_SECRET')
    const REDIRECT_URI = `${Deno.env.get('SITE_URL') || 'http://localhost:3000'}/social-connect`

    if (!TIKTOK_CLIENT_KEY || !TIKTOK_CLIENT_SECRET) {
      throw new Error('TikTok API credentials not configured')
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      throw new Error(`TikTok token exchange failed: ${errorText}`)
    }

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      throw new Error(`TikTok API error: ${tokenData.error_description}`)
    }

    // Get user info from TikTok
    const userResponse = await fetch(`https://open-api.tiktok.com/user/info/?access_token=${tokenData.data.access_token}&open_id=${tokenData.data.open_id}&fields=open_id,username,display_name,avatar_url,follower_count,video_count`)
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch TikTok user info')
    }

    const userResult = await userResponse.json()
    const userData = userResult.data?.user

    if (!userData) {
      throw new Error('No user data received from TikTok')
    }

    // Store/update social profile
    const { data: existingProfile } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'tiktok')
      .single()

    const profileData = {
      user_id: user.id,
      platform: 'tiktok',
      username: userData.username || userData.display_name,
      access_token: tokenData.data.access_token,
      refresh_token: tokenData.data.refresh_token || null,
      followers: userData.follower_count || 0,
      posts: userData.video_count || 0,
      engagement: 0, // Will be calculated
      connected: true,
      last_synced: new Date().toISOString(),
      profile_url: `https://tiktok.com/@${userData.username}`,
      stats: userData
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
      message: 'TikTok account connected successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('TikTok auth error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
