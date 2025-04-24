
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
    
    // Get user information including follower count and video count
    const userResponse = await fetch(
      `https://open-api.tiktok.com/user/info/?access_token=${profile.access_token}`
    )
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data')
    }
    
    const userData = await userResponse.json()
    
    if (userData.message !== 'success') {
      throw new Error('Failed to get user info: ' + userData.data.description)
    }
    
    const userInfo = userData.data.user;

    // Get recent videos to calculate engagement
    const videosResponse = await fetch(
      `https://open-api.tiktok.com/video/list/?access_token=${profile.access_token}`
    )

    if (!videosResponse.ok) {
      throw new Error('Failed to fetch videos')
    }

    const videosData = await videosResponse.json()
    
    if (videosData.message !== 'success') {
      throw new Error('Failed to get videos: ' + videosData.data.description)
    }

    // Calculate engagement rate from recent videos
    const videos = videosData.data.videos || [];
    let totalEngagement = 0;
    
    videos.forEach((video: any) => {
      const likes = video.like_count || 0;
      const comments = video.comment_count || 0;
      const shares = video.share_count || 0;
      totalEngagement += likes + comments + shares;
    });

    const engagementRate = videos.length > 0 
      ? ((totalEngagement / videos.length) / userInfo.follower_count) * 100 
      : 0;

    // Update profile with new stats
    const { error: updateError } = await supabase
      .from('social_profiles')
      .update({
        followers: userInfo.follower_count,
        posts: userInfo.video_count,
        engagement: parseFloat(engagementRate.toFixed(2)),
        last_synced: new Date().toISOString()
      })
      .eq('id', profile.id)
      
    if (updateError) throw updateError

    return new Response(JSON.stringify({
      message: 'TikTok stats updated successfully',
      stats: {
        followers: userInfo.follower_count,
        posts: userInfo.video_count,
        engagement: parseFloat(engagementRate.toFixed(2))
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
