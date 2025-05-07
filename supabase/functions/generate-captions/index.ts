
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') as string;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') as string;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Get the JWT token from the request header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Auth token is in format: "Bearer <token>"
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the JWT token and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the request body
    const { platform, niche, tone, postType, objective, description } = await req.json();

    // Generate the prompt for OpenAI
    const prompt = `Generate 3 captions for a ${platform} post by a ${niche} creator. The content is about ${description}. Tone: ${tone}. Goal: ${objective}. Include 3-5 emojis, use Gen Z slang if applicable.`;

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert social media caption writer who knows how to drive engagement for each platform.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const openaiData = await openaiResponse.json();

    if (!openaiData.choices || openaiData.choices.length === 0) {
      throw new Error('OpenAI returned an unexpected response');
    }

    // Extract the captions from the response
    const captionText = openaiData.choices[0].message.content;
    
    // Process the response to extract individual captions
    const captions = captionText
      .split(/(\d+\.\s)/)
      .filter(text => text.trim() && !text.match(/^\d+\.\s$/))
      .map(text => text.trim());

    // Store the captions in the database
    const { data: captionData, error: insertError } = await supabase
      .from('ai_captions')
      .insert({
        user_id: user.id,
        platform,
        niche,
        tone,
        post_type: postType,
        objective,
        description,
        captions: captions,
      })
      .select();

    if (insertError) {
      throw new Error(`Database error: ${insertError.message}`);
    }

    // Return the generated captions
    return new Response(
      JSON.stringify({ 
        success: true, 
        captions,
        captionId: captionData ? captionData[0]?.id : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate captions', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
