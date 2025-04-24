
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { method, headers } = req;
    const authorization = headers.get('Authorization');
    
    if (!authorization) {
      throw new Error('Missing authorization header');
    }
    
    // Get user from token
    const token = authorization.replace('Bearer ', '');
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !authData.user) {
      throw new Error('Invalid token');
    }
    
    // Get user's Instagram profile
    const { data: profiles, error: profileError } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .eq('platform', 'instagram')
      .eq('connected', true);
      
    if (profileError) throw profileError;
    if (!profiles || profiles.length === 0) {
      throw new Error('No connected Instagram profile found');
    }
    
    const profile = profiles[0];
    if (!profile.access_token) {
      throw new Error('No access token found for Instagram');
    }

    // Get latest media data
    const mediaResponse = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_type,media_url,permalink,timestamp,like_count,comments_count&access_token=${profile.access_token}`
    );

    if (!mediaResponse.ok) {
      throw new Error('Failed to fetch media data');
    }

    const mediaData = await mediaResponse.json();
    const posts = mediaData.data || [];

    // Calculate total engagement from available metrics
    let totalEngagement = 0;
    let totalInteractions = 0;
    
    posts.forEach((post: any) => {
      const likes = post.like_count || 0;
      const comments = post.comments_count || 0;
      totalInteractions += likes + comments;
    });

    // Calculate engagement rate (interactions per post)
    const engagementRate = posts.length > 0 ? (totalInteractions / posts.length) / 100 : 0;

    // Update profile with new stats
    const { error: updateError } = await supabase
      .from('social_profiles')
      .update({
        posts: posts.length,
        engagement: parseFloat(engagementRate.toFixed(2)),
        last_synced: new Date().toISOString()
      })
      .eq('id', profile.id);
      
    if (updateError) throw updateError;

    return new Response(JSON.stringify({
      message: 'Instagram stats updated successfully',
      stats: {
        posts: posts.length,
        engagement: parseFloat(engagementRate.toFixed(2))
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'An unknown error occurred'
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
