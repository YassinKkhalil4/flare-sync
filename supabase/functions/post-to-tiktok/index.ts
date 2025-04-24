
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
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

    // Get request data
    const { postId, userId } = await req.json();

    if (!postId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: postId and userId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get the post and TikTok profile
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

    const accessToken = post.social_profiles.access_token;
    if (!accessToken) {
      throw new Error('No access token found for TikTok account');
    }

    // First, create a video upload URL
    const createUploadResponse = await fetch(
      `https://open-api.tiktok.com/share/video/upload/?access_token=${accessToken}`,
      { method: 'POST' }
    );

    if (!createUploadResponse.ok) {
      throw new Error('Failed to get upload URL');
    }

    const uploadData = await createUploadResponse.json();
    
    if (uploadData.message !== 'success') {
      throw new Error('Failed to get upload URL: ' + uploadData.data.description);
    }

    // Upload the video
    const videoUrl = post.media_urls[0]; // Get the first video URL
    const videoResponse = await fetch(videoUrl);
    const videoBlob = await videoResponse.blob();

    const uploadResponse = await fetch(uploadData.data.upload_url, {
      method: 'POST',
      body: videoBlob,
      headers: {
        'Content-Type': 'video/mp4'
      }
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload video');
    }

    const uploadResult = await uploadResponse.json();

    // Create the post with the uploaded video
    const createPostResponse = await fetch(
      `https://open-api.tiktok.com/share/video/create/?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          video_id: uploadResult.data.video_id,
          title: post.content,
          privacy_level: 'public'
        })
      }
    );

    if (!createPostResponse.ok) {
      throw new Error('Failed to create TikTok post');
    }

    const postResult = await createPostResponse.json();

    if (postResult.message !== 'success') {
      throw new Error('Failed to create post: ' + postResult.data.description);
    }

    // Update post status
    const { error: updateError } = await supabaseAdmin
      .from('scheduled_posts')
      .update({ 
        status: 'published',
        platform_post_id: postResult.data.share_id,
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
        message: 'Post published to TikTok',
        postId: postResult.data.share_id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in post-to-tiktok function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
