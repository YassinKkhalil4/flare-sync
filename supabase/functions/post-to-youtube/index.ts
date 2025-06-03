
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

    const { postId } = await req.json();

    if (!postId) {
      return new Response(
        JSON.stringify({ error: 'Missing postId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get the scheduled post
    const { data: post, error: postError } = await supabaseAdmin
      .from('scheduled_posts')
      .select('*, social_profiles!inner(*)')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      console.error('Error fetching post:', postError);
      return new Response(
        JSON.stringify({ error: 'Post not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const accessToken = post.social_profiles.access_token;
    if (!accessToken) {
      throw new Error('No access token found for YouTube account');
    }

    // YouTube requires video files for uploads
    if (!post.media_urls || post.media_urls.length === 0) {
      throw new Error('YouTube posts require video files');
    }

    const videoUrl = post.media_urls[0];

    // Step 1: Initialize the upload
    const initResponse = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': 'video/*'
        },
        body: JSON.stringify({
          snippet: {
            title: post.content.substring(0, 100) || 'FlareSync Upload',
            description: post.content,
            tags: ['FlareSync', 'social media'],
            categoryId: '22' // People & Blogs
          },
          status: {
            privacyStatus: 'public'
          }
        })
      }
    );

    if (!initResponse.ok) {
      throw new Error(`Failed to initialize YouTube upload: ${initResponse.status}`);
    }

    const uploadUrl = initResponse.headers.get('location');
    if (!uploadUrl) {
      throw new Error('No upload URL received from YouTube');
    }

    // Step 2: Upload the video file
    const videoResponse = await fetch(videoUrl);
    const videoBlob = await videoResponse.blob();

    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/*'
      },
      body: videoBlob
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload video: ${uploadResponse.status}`);
    }

    const uploadResult = await uploadResponse.json();

    // Update post status
    const { error: updateError } = await supabaseAdmin
      .from('scheduled_posts')
      .update({ 
        status: 'published',
        post_id: uploadResult.id,
        metadata: { youtube_result: uploadResult }
      })
      .eq('id', postId);

    if (updateError) {
      console.error('Error updating post status:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Video uploaded to YouTube successfully',
        videoId: uploadResult.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error uploading to YouTube:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
