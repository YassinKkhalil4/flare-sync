
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../utils/cors.ts'

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

    const { platform, authCode } = await req.json()

    // Exchange auth code for access token based on platform
    let tokenData = null
    let userInfo = null

    switch (platform) {
      case 'instagram':
        tokenData = await exchangeInstagramCode(authCode)
        userInfo = await getInstagramUserInfo(tokenData.access_token)
        break
      case 'twitter':
        tokenData = await exchangeTwitterCode(authCode)
        userInfo = await getTwitterUserInfo(tokenData.access_token)
        break
      case 'facebook':
        tokenData = await exchangeFacebookCode(authCode)
        userInfo = await getFacebookUserInfo(tokenData.access_token)
        break
      default:
        throw new Error(`Platform ${platform} not supported`)
    }

    // Store or update the social profile
    const { data: existingProfile } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', platform)
      .single()

    const profileData = {
      user_id: user.id,
      platform,
      username: userInfo.username,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      followers: userInfo.followers || 0,
      posts: userInfo.posts || 0,
      engagement: userInfo.engagement || 0,
      connected: true,
      last_synced: new Date().toISOString(),
      profile_url: userInfo.profile_url,
      stats: userInfo.stats || {}
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

    return new Response(
      JSON.stringify(savedProfile),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error connecting social platform:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

async function exchangeInstagramCode(code: string) {
  const clientId = Deno.env.get('INSTAGRAM_CLIENT_ID')
  const clientSecret = Deno.env.get('INSTAGRAM_CLIENT_SECRET')
  const redirectUri = `${Deno.env.get('SITE_URL')}/social-connect`

  const response = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code
    })
  })

  if (!response.ok) {
    throw new Error('Failed to exchange Instagram code')
  }

  return await response.json()
}

async function getInstagramUserInfo(accessToken: string) {
  const response = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`)
  
  if (!response.ok) {
    throw new Error('Failed to get Instagram user info')
  }

  const data = await response.json()
  return {
    username: data.username,
    followers: 0, // Would need additional API call
    posts: data.media_count || 0,
    engagement: 0,
    profile_url: `https://instagram.com/${data.username}`,
    stats: data
  }
}

async function exchangeTwitterCode(code: string) {
  const clientId = Deno.env.get('TWITTER_CLIENT_ID')
  const clientSecret = Deno.env.get('TWITTER_CLIENT_SECRET')
  const redirectUri = `${Deno.env.get('SITE_URL')}/social-connect`

  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: 'challenge' // In real implementation, store and use proper PKCE
    })
  })

  if (!response.ok) {
    throw new Error('Failed to exchange Twitter code')
  }

  return await response.json()
}

async function getTwitterUserInfo(accessToken: string) {
  const response = await fetch('https://api.twitter.com/2/users/me?user.fields=public_metrics,profile_image_url', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  })
  
  if (!response.ok) {
    throw new Error('Failed to get Twitter user info')
  }

  const data = await response.json()
  const user = data.data
  return {
    username: user.username,
    followers: user.public_metrics?.followers_count || 0,
    posts: user.public_metrics?.tweet_count || 0,
    engagement: 0,
    profile_url: `https://twitter.com/${user.username}`,
    stats: user.public_metrics || {}
  }
}

async function exchangeFacebookCode(code: string) {
  const clientId = Deno.env.get('FACEBOOK_CLIENT_ID')
  const clientSecret = Deno.env.get('FACEBOOK_CLIENT_SECRET')
  const redirectUri = `${Deno.env.get('SITE_URL')}/social-connect`

  const response = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}&code=${code}`)

  if (!response.ok) {
    throw new Error('Failed to exchange Facebook code')
  }

  return await response.json()
}

async function getFacebookUserInfo(accessToken: string) {
  const response = await fetch(`https://graph.facebook.com/me?fields=id,name,picture&access_token=${accessToken}`)
  
  if (!response.ok) {
    throw new Error('Failed to get Facebook user info')
  }

  const data = await response.json()
  return {
    username: data.name,
    followers: 0, // Would need page-specific API call
    posts: 0,
    engagement: 0,
    profile_url: `https://facebook.com/${data.id}`,
    stats: data
  }
}
