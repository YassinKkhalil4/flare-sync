
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
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

    const { feature, params } = await req.json();

    let response;
    switch (feature) {
      case 'chat-assistant':
        response = await handleChatAssistant(params);
        break;
      case 'smart-scheduling':
        response = await handleSmartScheduling(params);
        break;
      default:
        throw new Error('Unknown AI feature requested');
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-helper function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleChatAssistant(params: { message: string; conversation_history?: any[] }) {
  const { message, conversation_history = [] } = params;

  const messages = [
    {
      role: 'system',
      content: `You are a helpful AI assistant specialized in social media marketing, content creation, and influencer strategy. 
      You help creators with:
      - Content strategy and planning
      - Engagement optimization
      - Platform-specific best practices
      - Brand partnership advice
      - Analytics interpretation
      - Growth strategies
      
      Be friendly, professional, and provide actionable advice.`
    },
    ...conversation_history,
    { role: 'user', content: message }
  ];

  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  const data = await openaiResponse.json();
  
  if (!data.choices || data.choices.length === 0) {
    throw new Error('No response from OpenAI');
  }

  return {
    response: data.choices[0].message.content
  };
}

async function handleSmartScheduling(params: {
  platform: string;
  contentType: string;
  audienceLocation: string;
  postCount: number;
}) {
  const { platform, contentType, audienceLocation, postCount } = params;

  const prompt = `As a social media expert, recommend the best posting times for:
  - Platform: ${platform}
  - Content Type: ${contentType}
  - Audience Location: ${audienceLocation}
  - Posts per week: ${postCount}
  
  Consider timezone, platform-specific peak hours, and content type optimization.
  Return optimal posting times for the week with engagement scores (0-100).
  
  Format as JSON: [{"day": 0-6, "time": "HH:MM", "score": 0-100}]`;

  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a social media scheduling expert. Always respond with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    }),
  });

  const data = await openaiResponse.json();
  
  if (!data.choices || data.choices.length === 0) {
    throw new Error('No response from OpenAI');
  }

  try {
    const optimalTimes = JSON.parse(data.choices[0].message.content);
    return { optimalTimes };
  } catch {
    // Fallback if JSON parsing fails
    const fallbackTimes = [
      { day: 1, time: "09:00", score: 85 },
      { day: 3, time: "14:30", score: 78 },
      { day: 5, time: "19:15", score: 82 },
    ];
    return { optimalTimes: fallbackTimes };
  }
}
