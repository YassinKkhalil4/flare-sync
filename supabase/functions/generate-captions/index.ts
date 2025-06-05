
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

    const { description, platform, tone, objective, niche, postType } = await req.json();

    if (!OPENAI_API_KEY) {
      console.log('OPENAI_API_KEY not configured, using fallback captions');
      
      const fallbackCaptions = [
        `Excited to share: ${description} 🚀 #${platform} #${niche || 'content'}`,
        `Check this out! ${description} ✨ What do you think? #${platform}`,
        `${description} - couldn't be more thrilled! 💫 #${niche || 'amazing'} #${platform}`
      ];

      // Store in database
      await supabase.from('ai_captions').insert({
        user_id: user.id,
        description,
        platform,
        tone,
        objective,
        niche,
        post_type: postType,
        captions: fallbackCaptions,
        selected_caption: fallbackCaptions[0]
      });

      return new Response(JSON.stringify({ captions: fallbackCaptions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call OpenAI API
    const prompt = `Generate 3 engaging social media captions for ${platform} based on:
Description: ${description}
Tone: ${tone || 'friendly'}
Objective: ${objective || 'engagement'}
Niche: ${niche || 'general'}
Post Type: ${postType || 'general'}

Make them varied in style and include relevant hashtags.`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a social media expert who creates engaging captions. Return exactly 3 captions separated by "|||".'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    const openaiData = await openaiResponse.json();
    const generatedContent = openaiData.choices[0]?.message?.content || '';
    const captions = generatedContent.split('|||').map((caption: string) => caption.trim()).filter(Boolean);

    // Store in database
    await supabase.from('ai_captions').insert({
      user_id: user.id,
      description,
      platform,
      tone,
      objective,
      niche,
      post_type: postType,
      captions,
      selected_caption: captions[0]
    });

    return new Response(JSON.stringify({ captions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-captions function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
