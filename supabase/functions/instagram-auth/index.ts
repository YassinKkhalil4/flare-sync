
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

    // Get Instagram credentials from secrets
    const INSTAGRAM_CLIENT_ID = Deno.env.get('INSTAGRAM_CLIENT_ID')
    const INSTAGRAM_CLIENT_SECRET = Deno.env.get('INSTAGRAM_CLIENT_SECRET')
    const REDIRECT_URI = `${Deno.env.get('SITE_URL') || 'http://localhost:3000'}/social-connect`

    if (!INSTAGRAM_CLIENT_ID || !INSTAGRAM_CLIENT_SECRET) {
      throw new Error('Instagram API credentials not configured')
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: INSTAGRAM_CLIENT_ID,
        client_secret: INSTAGRAM_CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code: code,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      throw new Error(`Instagram token exchange failed: ${errorText}`)
    }

    const tokenData = await tokenResponse.json()

    // Get user info from Instagram
    const userResponse = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${tokenData.access_token}`)
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch Instagram user info')
    }

    const userData = await userResponse.json()

    // Store/update social profile
    const { data: existingProfile } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'instagram')
      .single()

    const profileData = {
      user_id: user.id,
      platform: 'instagram',
      username: userData.username,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      followers: 0, // Will be updated in sync
      posts: userData.media_count || 0,
      engagement: 0, // Will be calculated in sync
      connected: true,
      last_synced: new Date().toISOString(),
      profile_url: `https://instagram.com/${userData.username}`,
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
      message: 'Instagram account connected successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Instagram auth error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
