
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

    // Get the post
    const { data: post, error: postError } = await supabaseAdmin
      .from('content_posts')
      .select('*')
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

    // Get the TikTok credentials
    const { data: tiktokProfile, error: profileError } = await supabaseAdmin
      .from('social_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', 'tiktok')
      .eq('connected', true)
      .single();

    if (profileError || !tiktokProfile) {
      console.error('Error fetching TikTok profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'TikTok profile not found or not connected' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // In a real implementation, this would use the TikTok API to post the content
    // using the access token from the social_profiles table
    // For now, we'll simulate a successful post and update the post status

    // Simulate posting to TikTok
    console.log(`Posting to TikTok for user ${userId}:`, post.title);

    // Update the post status to published
    const { data: updatedPost, error: updateError } = await supabaseAdmin
      .from('content_posts')
      .update({ 
        status: 'published',
        platform_post_id: `tiktok-${Date.now()}-${Math.floor(Math.random() * 1000)}` // Simulate a TikTok post ID
      })
      .eq('id', postId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating post status:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update post status' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Post published to TikTok',
        post: updatedPost
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
})
