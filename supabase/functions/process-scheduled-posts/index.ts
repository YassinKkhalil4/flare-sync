
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

    // Get current time
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - (10 * 60 * 1000));

    // Find scheduled posts that are due to be published
    const { data: scheduledPosts, error: postsError } = await supabaseAdmin
      .from('content_posts')
      .select('*, social_profiles:profiles!inner(*)')
      .eq('status', 'scheduled')
      .lt('scheduled_for', now.toISOString())
      .gt('scheduled_for', tenMinutesAgo.toISOString());

    if (postsError) {
      console.error('Error fetching scheduled posts:', postsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch scheduled posts' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`Found ${scheduledPosts?.length || 0} posts to publish`);

    // Process each post
    const results = [];
    for (const post of scheduledPosts || []) {
      try {
        console.log(`Processing post ${post.id} for platform ${post.platform}`);
        
        // In a real implementation, this would call the appropriate social media API
        // For now, just update the post status
        const { data: updatedPost, error: updateError } = await supabaseAdmin
          .from('content_posts')
          .update({ 
            status: 'published',
            platform_post_id: `${post.platform}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
          })
          .eq('id', post.id)
          .select()
          .single();

        if (updateError) {
          console.error(`Error updating post ${post.id}:`, updateError);
          results.push({ id: post.id, success: false, error: updateError.message });
        } else {
          results.push({ id: post.id, success: true, post: updatedPost });
        }
      } catch (postError) {
        console.error(`Error processing post ${post.id}:`, postError);
        results.push({ id: post.id, success: false, error: postError.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-scheduled-posts function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
