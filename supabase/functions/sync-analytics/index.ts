
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

    const { platform } = await req.json()

    // Get user's social profile for the platform
    const { data: socialProfile, error: profileError } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', platform)
      .eq('connected', true)
      .single()

    if (profileError || !socialProfile) {
      throw new Error(`No connected ${platform} account found`)
    }

    if (!socialProfile.access_token) {
      throw new Error(`No access token found for ${platform} account`)
    }

    // Get user's posts for this platform
    const { data: posts, error: postsError } = await supabase
      .from('content_posts')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', platform)
      .eq('status', 'published')
      .not('platform_post_id', 'is', null)

    if (postsError) throw postsError

    // Sync analytics for each post based on platform
    const syncResults = []
    
    for (const post of posts || []) {
      if (!post.platform_post_id) continue

      try {
        let analytics = null
        
        switch (platform) {
          case 'instagram':
            analytics = await syncInstagramPostAnalytics(post.platform_post_id, socialProfile.access_token)
            break
          case 'twitter':
            analytics = await syncTwitterPostAnalytics(post.platform_post_id, socialProfile.access_token)
            break
          case 'facebook':
            analytics = await syncFacebookPostAnalytics(post.platform_post_id, socialProfile.access_token)
            break
          default:
            console.log(`Analytics sync not implemented for ${platform}`)
            continue
        }

        if (analytics) {
          // Update post metrics
          await supabase
            .from('content_posts')
            .update({ 
              metrics: analytics,
              updated_at: new Date().toISOString()
            })
            .eq('id', post.id)

          syncResults.push({
            post_id: post.id,
            success: true,
            metrics: analytics
          })
        }
      } catch (error) {
        console.error(`Error syncing analytics for post ${post.id}:`, error)
        syncResults.push({
          post_id: post.id,
          success: false,
          error: error.message
        })
      }
    }

    // Update social profile last synced time
    await supabase
      .from('social_profiles')
      .update({ 
        last_synced: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', socialProfile.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced_posts: syncResults.length,
        results: syncResults
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error syncing analytics:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

async function syncInstagramPostAnalytics(postId: string, accessToken: string) {
  const response = await fetch(
    `https://graph.instagram.com/v18.0/${postId}?fields=like_count,comments_count,shares,reach,impressions&access_token=${accessToken}`
  )
  
  if (!response.ok) {
    throw new Error(`Instagram API error: ${response.statusText}`)
  }
  
  const data = await response.json()
  
  return {
    likes: data.like_count || 0,
    comments: data.comments_count || 0,
    shares: data.shares || 0,
    reach: data.reach || 0,
    impressions: data.impressions || 0,
    clicks: 0,
    saves: 0
  }
}

async function syncTwitterPostAnalytics(postId: string, accessToken: string) {
  const response = await fetch(
    `https://api.twitter.com/2/tweets/${postId}?tweet.fields=public_metrics`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  )
  
  if (!response.ok) {
    throw new Error(`Twitter API error: ${response.statusText}`)
  }
  
  const data = await response.json()
  const metrics = data.data?.public_metrics || {}
  
  return {
    likes: metrics.like_count || 0,
    comments: metrics.reply_count || 0,
    shares: metrics.retweet_count || 0,
    reach: metrics.impression_count || 0,
    impressions: metrics.impression_count || 0,
    clicks: 0,
    saves: 0
  }
}

async function syncFacebookPostAnalytics(postId: string, accessToken: string) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${postId}?fields=likes.summary(true),comments.summary(true),shares&access_token=${accessToken}`
  )
  
  if (!response.ok) {
    throw new Error(`Facebook API error: ${response.statusText}`)
  }
  
  const data = await response.json()
  
  return {
    likes: data.likes?.summary?.total_count || 0,
    comments: data.comments?.summary?.total_count || 0,
    shares: data.shares?.count || 0,
    reach: 0, // Requires additional API call
    impressions: 0, // Requires additional API call
    clicks: 0,
    saves: 0
  }
}
