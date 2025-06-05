
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') as string;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { content, platform, hashtags, mediaUrls } = await req.json();

    // Calculate base engagement metrics based on content analysis
    let baseScore = 50; // Base engagement score
    
    // Content length analysis
    if (content.length > 100 && content.length < 300) baseScore += 10;
    if (content.length > 300) baseScore -= 5;
    
    // Hashtag analysis
    if (hashtags && hashtags.length > 0) {
      if (hashtags.length >= 3 && hashtags.length <= 8) baseScore += 15;
      if (hashtags.length > 10) baseScore -= 5;
    }
    
    // Media analysis
    if (mediaUrls && mediaUrls.length > 0) baseScore += 20;
    
    // Platform-specific adjustments
    switch (platform.toLowerCase()) {
      case 'instagram':
        if (mediaUrls && mediaUrls.length > 0) baseScore += 10;
        break;
      case 'twitter':
        if (content.length <= 280) baseScore += 10;
        break;
      case 'linkedin':
        if (content.length > 200) baseScore += 10;
        break;
    }

    // Generate predictions based on score
    const multiplier = baseScore / 100;
    const prediction = {
      predicted_likes: Math.floor((Math.random() * 500 + 100) * multiplier),
      predicted_comments: Math.floor((Math.random() * 50 + 10) * multiplier),
      predicted_shares: Math.floor((Math.random() * 25 + 5) * multiplier),
      confidence_score: Math.min(0.95, Math.max(0.6, baseScore / 100)),
    };

    // Store prediction in database
    await supabase.from('engagement_predictions').insert({
      user_id: user.id,
      content,
      platform,
      hashtags,
      media_urls: mediaUrls,
      predicted_likes: prediction.predicted_likes,
      predicted_comments: prediction.predicted_comments,
      predicted_shares: prediction.predicted_shares,
      confidence_score: prediction.confidence_score,
      metadata: { baseScore, multiplier }
    });

    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in predict-engagement function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
