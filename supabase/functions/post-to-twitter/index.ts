
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Twitter OAuth 1.0a helper functions
function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )}`;
  
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  const hmacSha1 = createHmac("sha1", signingKey);
  const signature = hmacSha1.update(signatureBaseString).digest("base64");
  
  return signature;
}

function generateOAuthHeader(method: string, url: string, accessToken: string, tokenSecret: string): string {
  const TWITTER_CLIENT_ID = Deno.env.get('TWITTER_CLIENT_ID')!;
  const TWITTER_CLIENT_SECRET = Deno.env.get('TWITTER_CLIENT_SECRET')!;

  const oauthParams = {
    oauth_consumer_key: TWITTER_CLIENT_ID,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(method, url, oauthParams, TWITTER_CLIENT_SECRET, tokenSecret);

  const signedOAuthParams = {
    ...oauthParams,
    oauth_signature: signature,
  };

  const entries = Object.entries(signedOAuthParams).sort((a, b) => a[0].localeCompare(b[0]));

  return "OAuth " + entries
    .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
    .join(", ");
}

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

    const { text, media_urls, post_id } = await req.json()

    if (!text || text.length > 280) {
      throw new Error('Tweet text is required and must be 280 characters or less')
    }

    // Get Twitter profile
    const { data: profile, error: profileError } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'twitter')
      .eq('connected', true)
      .single()

    if (profileError || !profile) {
      throw new Error('Twitter account not connected')
    }

    if (!profile.access_token || !profile.refresh_token) {
      throw new Error('No access tokens available for Twitter')
    }

    // Post tweet using Twitter API v2
    const url = 'https://api.twitter.com/2/tweets';
    const method = 'POST';
    
    const oauthHeader = generateOAuthHeader(method, url, profile.access_token, profile.refresh_token);

    const tweetData: any = { text };
    
    // Handle media uploads if present
    if (media_urls && media_urls.length > 0) {
      // For now, Twitter media upload requires additional implementation
      // This would involve uploading media first, then attaching to tweet
      console.log('Media attachments not yet implemented for Twitter');
    }

    const response = await fetch(url, {
      method: method,
      headers: {
        'Authorization': oauthHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tweetData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Twitter API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const twitterPostId = result.data?.id;

    // Update post record with platform post ID
    if (post_id) {
      const { error: updateError } = await supabase
        .from('content_posts')
        .update({
          platform_post_id: twitterPostId,
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
      platform_post_id: twitterPostId,
      message: 'Tweet posted successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Twitter posting error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
