
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
    const { code, state } = await req.json();
    if (!code) throw new Error('No authorization code provided');

    // Get Instagram credentials from environment variables
    const clientId = Deno.env.get('INSTAGRAM_APP_ID');
    const clientSecret = Deno.env.get('INSTAGRAM_APP_SECRET');
    const redirectUri = `${new URL(req.url).origin}/social-connect`;

    if (!clientId || !clientSecret) {
      throw new Error('Instagram credentials not configured');
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const shortLivedToken = tokenData.access_token;
    const userId = tokenData.user_id;

    // Exchange short-lived token for long-lived token
    const longLivedTokenResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${clientSecret}&access_token=${shortLivedToken}`
    );

    if (!longLivedTokenResponse.ok) {
      throw new Error('Failed to get long-lived token');
    }

    const longLivedTokenData = await longLivedTokenResponse.json();
    const accessToken = longLivedTokenData.access_token;

    // Get user profile information
    const userResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
    );

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await userResponse.json();

    // Get recent media metrics
    const mediaResponse = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${accessToken}`
    );

    if (!mediaResponse.ok) {
      throw new Error('Failed to fetch media data');
    }

    const mediaData = await mediaResponse.json();

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get user from state (contains JWT)
    const { data: authData } = await supabase.auth.getUser(state);
    if (!authData.user) {
      throw new Error('User not authenticated');
    }

    // Store profile in database
    const { data: profile, error } = await supabase
      .from('social_profiles')
      .upsert({
        user_id: authData.user.id,
        platform: 'instagram',
        username: userData.username,
        profile_url: `https://instagram.com/${userData.username}`,
        connected: true,
        last_synced: new Date().toISOString(),
        access_token: accessToken,
        posts: userData.media_count || mediaData.data?.length || 0,
        followers: 0, // Basic Display API doesn't provide follower count
        engagement: 0 // Will be calculated in sync function
      }, {
        onConflict: 'user_id, platform'
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, profile }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'An unknown error occurred'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
