
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { postId, userId } = await req.json();

    if (!postId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: postId and userId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get the post and Instagram profile
    const { data: post, error: postError } = await supabaseAdmin
      .from('scheduled_posts')
      .select('*, social_profiles!inner(*)')
      .eq('id', postId)
      .eq('user_id', userId)
      .single();

    if (postError || !post) {
      console.error('Error fetching post:', postError);
      return new Response(
        JSON.stringify({ error: 'Post not found or access denied' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Check if we have media to post
    if (!post.media_urls || post.media_urls.length === 0) {
      throw new Error('Instagram posts require media (image or video)');
    }

    const accessToken = post.social_profiles.access_token;
    if (!accessToken) {
      throw new Error('No access token found for Instagram account');
    }

    // Create Instagram media container
    const createMediaResponse = await fetch(
      `https://graph.instagram.com/me/media?access_token=${accessToken}`,
      {
        method: 'POST',
        body: JSON.stringify({
          image_url: post.media_urls[0],
          caption: post.content
        })
      }
    );

    if (!createMediaResponse.ok) {
      throw new Error('Failed to create Instagram media');
    }

    const mediaData = await createMediaResponse.json();
    const mediaId = mediaData.id;

    // Publish the media
    const publishResponse = await fetch(
      `https://graph.instagram.com/${mediaId}/publish?access_token=${accessToken}`,
      {
        method: 'POST'
      }
    );

    if (!publishResponse.ok) {
      throw new Error('Failed to publish Instagram media');
    }

    // Update post status
    const { error: updateError } = await supabaseAdmin
      .from('scheduled_posts')
      .update({ 
        status: 'published',
        platform_post_id: mediaId,
        published_at: new Date().toISOString()
      })
      .eq('id', postId);

    if (updateError) {
      console.error('Error updating post status:', updateError);
      throw new Error('Failed to update post status');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Post published to Instagram',
        mediaId: mediaId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in post-to-instagram function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
