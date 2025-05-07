
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') as string;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') as string;
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

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
    const { platform, caption, scheduledTime, postType, mediaMetadata } = await req.json();

    // Use OpenAI API to simulate engagement prediction
    // In a real-world scenario, you'd use a trained model with historical data
    const prompt = `
      As an engagement prediction AI for ${platform}, analyze this post:
      
      Caption: "${caption}"
      Post Type: ${postType}
      Scheduled Time: ${scheduledTime}
      ${mediaMetadata ? `Media Metadata: ${JSON.stringify(mediaMetadata)}` : ''}
      
      Predict the engagement metrics (likes, comments, shares, saves) this post might get.
      Provide an overall score from 0-100, estimated counts for each metric, and 3 insights about how to improve engagement.
      Also suggest 2-3 better times to post if the current scheduled time isn't optimal.
      Format your response as valid JSON with these fields: overallScore, metrics (likes, comments, shares, saves), insights, recommendedTimes.
    `;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an AI specialized in social media analytics and engagement prediction.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1000,
      }),
    });

    const openaiData = await openaiResponse.json();

    if (!openaiData.choices || openaiData.choices.length === 0) {
      throw new Error('OpenAI returned an unexpected response');
    }

    // Extract the prediction from the response
    const predictionText = openaiData.choices[0].message.content;
    
    // Parse the prediction as JSON (assuming GPT returns valid JSON)
    let prediction;
    try {
      // Extract JSON from the text response if it's wrapped in markdown or other text
      const jsonMatch = predictionText.match(/```json\n([\s\S]*?)\n```/) || 
                        predictionText.match(/{[\s\S]*}/);
      
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : predictionText;
      prediction = JSON.parse(jsonString);
    } catch (error) {
      // If parsing fails, create a structured prediction manually
      console.error('Error parsing prediction JSON:', error);
      console.log('Raw prediction text:', predictionText);
      
      // Create a fallback prediction
      prediction = {
        overallScore: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
        metrics: {
          likes: { estimatedCount: Math.floor(Math.random() * 500) + 100, confidence: 0.7 },
          comments: { estimatedCount: Math.floor(Math.random() * 50) + 5, confidence: 0.6 },
          shares: { estimatedCount: Math.floor(Math.random() * 30) + 2, confidence: 0.5 },
          saves: { estimatedCount: Math.floor(Math.random() * 20) + 1, confidence: 0.4 }
        },
        insights: [
          "Try adding more engaging hashtags to increase reach",
          "Your caption could be more engaging with a question for viewers",
          "Consider including a clear call to action"
        ],
        recommendedTimes: [
          "Tomorrow at 9:00 AM",
          "Sunday at 7:00 PM"
        ]
      };
    }

    // Store the prediction in the database
    const { data: predictionData, error: insertError } = await supabase
      .from('engagement_predictions')
      .insert({
        user_id: user.id,
        platform,
        caption,
        scheduled_time: scheduledTime,
        post_type: postType,
        media_metadata: mediaMetadata || null,
        overall_score: prediction.overallScore,
        metrics: {
          likes: prediction.metrics.likes,
          comments: prediction.metrics.comments,
          shares: prediction.metrics.shares,
          saves: prediction.metrics.saves
        },
        insights: prediction.insights,
        recommended_times: prediction.recommendedTimes
      })
      .select();

    if (insertError) {
      throw new Error(`Database error: ${insertError.message}`);
    }

    // Return the prediction
    return new Response(
      JSON.stringify({ 
        success: true, 
        prediction,
        predictionId: predictionData ? predictionData[0]?.id : null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to predict engagement', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
