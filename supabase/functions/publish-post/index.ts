
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

    const { postId } = await req.json()

    // Get the post/scheduled post
    let postData = null
    let isScheduled = false

    // Try to get from scheduled_posts first
    const { data: scheduledPost } = await supabase
      .from('scheduled_posts')
      .select('*')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single()

    if (scheduledPost) {
      postData = scheduledPost
      isScheduled = true
    } else {
      // Try content_posts
      const { data: contentPost } = await supabase
        .from('content_posts')
        .select('*')
        .eq('id', postId)
        .eq('user_id', user.id)
        .single()
      
      if (contentPost) {
        postData = contentPost
      }
    }

    if (!postData) {
      throw new Error('Post not found')
    }

    // Get user's social profile for the platform
    const { data: socialProfile } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', postData.platform)
      .eq('connected', true)
      .single()

    if (!socialProfile) {
      throw new Error(`No connected ${postData.platform} account found`)
    }

    // Publish based on platform
    let publishResult = null
    switch (postData.platform) {
      case 'instagram':
        publishResult = await publishToInstagram(postData, socialProfile)
        break
      case 'twitter':
        publishResult = await publishToTwitter(postData, socialProfile)
        break
      case 'facebook':
        publishResult = await publishToFacebook(postData, socialProfile)
        break
      default:
        throw new Error(`Publishing to ${postData.platform} not yet supported`)
    }

    // Update the database
    if (isScheduled) {
      // Update scheduled post status
      await supabase
        .from('scheduled_posts')
        .update({ 
          status: 'published',
          post_id: publishResult.postId,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)

      // Create a content post record
      await supabase
        .from('content_posts')
        .insert({
          user_id: user.id,
          title: postData.metadata?.title || 'Published Post',
          body: postData.content,
          platform: postData.platform,
          status: 'published',
          published_at: new Date().toISOString(),
          platform_post_id: publishResult.postId,
          media_urls: postData.media_urls || []
        })
    } else {
      // Update content post
      await supabase
        .from('content_posts')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString(),
          platform_post_id: publishResult.postId
        })
        .eq('id', postId)
    }

    return new Response(
      JSON.stringify({ success: true, platformPostId: publishResult.postId }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error publishing post:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

async function publishToInstagram(postData: any, socialProfile: any) {
  // This is a simplified version - in reality you'd need to implement
  // the full Instagram Graph API publishing flow
  const response = await fetch(`https://graph.instagram.com/v18.0/${socialProfile.username}/media`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: postData.media_urls?.[0] || '',
      caption: postData.content,
      access_token: socialProfile.access_token
    })
  })

  if (!response.ok) {
    throw new Error(`Instagram API error: ${response.statusText}`)
  }

  const result = await response.json()
  return { postId: result.id }
}

async function publishToTwitter(postData: any, socialProfile: any) {
  // Simplified Twitter publishing
  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${socialProfile.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: postData.content
    })
  })

  if (!response.ok) {
    throw new Error(`Twitter API error: ${response.statusText}`)
  }

  const result = await response.json()
  return { postId: result.data.id }
}

async function publishToFacebook(postData: any, socialProfile: any) {
  // Simplified Facebook publishing
  const response = await fetch(`https://graph.facebook.com/v18.0/me/feed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: postData.content,
      access_token: socialProfile.access_token
    })
  })

  if (!response.ok) {
    throw new Error(`Facebook API error: ${response.statusText}`)
  }

  const result = await response.json()
  return { postId: result.id }
}
