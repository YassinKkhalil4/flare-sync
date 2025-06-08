
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

    const { caption, media_urls, post_id } = await req.json()

    // Get Instagram profile
    const { data: profile, error: profileError } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'instagram')
      .eq('connected', true)
      .single()

    if (profileError || !profile) {
      throw new Error('Instagram account not connected')
    }

    if (!profile.access_token) {
      throw new Error('No access token available for Instagram')
    }

    let mediaObject
    let instagramPostId

    // Handle different media types
    if (media_urls && media_urls.length > 0) {
      const mediaUrl = media_urls[0] // Use first media for now
      
      // Create media object
      const mediaResponse = await fetch(`https://graph.instagram.com/me/media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          image_url: mediaUrl,
          caption: caption || '',
          access_token: profile.access_token,
        }),
      })

      if (!mediaResponse.ok) {
        const errorText = await mediaResponse.text()
        throw new Error(`Failed to create Instagram media: ${errorText}`)
      }

      mediaObject = await mediaResponse.json()

      // Publish the media
      const publishResponse = await fetch(`https://graph.instagram.com/me/media_publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          creation_id: mediaObject.id,
          access_token: profile.access_token,
        }),
      })

      if (!publishResponse.ok) {
        const errorText = await publishResponse.text()
        throw new Error(`Failed to publish Instagram post: ${errorText}`)
      }

      const publishResult = await publishResponse.json()
      instagramPostId = publishResult.id
    } else {
      // Text-only post (not supported by Instagram Basic Display API)
      throw new Error('Instagram requires media content for posts')
    }

    // Update post record with platform post ID
    if (post_id) {
      const { error: updateError } = await supabase
        .from('content_posts')
        .update({
          platform_post_id: instagramPostId,
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', post_id)

      if (updateError) {
        console.error('Failed to update post record:', updateError)
      }
    }

    return new Response(JSON.stringify({
      success: true,
      platform_post_id: instagramPostId,
      message: 'Post published to Instagram successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Instagram posting error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
