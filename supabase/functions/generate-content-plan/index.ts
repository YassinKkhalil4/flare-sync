
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      timeCommitment, 
      platforms, 
      goal, 
      niche, 
      additionalInfo 
    } = await req.json();

    // Validate inputs
    if (!timeCommitment || !platforms || !platforms.length || !goal || !niche) {
      throw new Error('Missing required fields: timeCommitment, platforms, goal, and niche are required');
    }

    // Authentication check
    const { error: authError, auth } = await getSupabaseClient(req);
    if (authError) {
      throw new Error(`Authentication error: ${authError.message}`);
    }

    // Generate plan using OpenAI
    const generatedPlan = await generatePlan(timeCommitment, platforms, goal, niche, additionalInfo);

    // Store plan in database
    const { data: savedPlan, error: saveError } = await auth.client.from('content_plans')
      .insert({
        user_id: auth.user.id,
        name: `${niche} ${goal} plan`,
        goal: goal,
        platforms: platforms,
        posts: generatedPlan.posts,
        start_date: generatedPlan.startDate,
        end_date: generatedPlan.endDate
      })
      .select('*')
      .single();

    if (saveError) {
      console.error('Error saving content plan:', saveError);
    }

    return new Response(JSON.stringify(generatedPlan), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-content-plan function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generatePlan(timeCommitment, platforms, goal, niche, additionalInfo) {
  try {
    // Use OpenAI to generate a content plan
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are an AI specialized in content strategy and social media planning. 
            Your task is to create a 7-day content plan for a creator based on their specifications.` 
          },
          { 
            role: 'user', 
            content: `
              Create a 7-day content plan for a ${niche} creator with the following details:
              - Time commitment: ${timeCommitment} hours per week
              - Platforms: ${platforms.join(', ')}
              - Goal: ${goal} (growth, engagement, or sales)
              ${additionalInfo ? `- Additional info: ${additionalInfo}` : ''}
              
              The content plan should include:
              1. A post for each day with platform, content type, title, description
              2. Suggested caption for each post
              3. Relevant hashtags for each post
              4. Best posting time for each day
              5. Status set to 'draft' for all posts
              
              Format the response as valid JSON with this structure:
              {
                "id": "[uuid]",
                "name": "[name of plan]",
                "startDate": "[start date]",
                "endDate": "[end date]",
                "goal": "[goal]",
                "platforms": [array of platforms],
                "posts": [array of post objects with day, time, platform, contentType, title, description, suggestedCaption, hashtags, status]
              }
            `
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid response from OpenAI');
    }
    
    const resultText = data.choices[0].message.content;
    
    // Extract JSON from the response
    try {
      // Find JSON in the response (in case OpenAI adds extra text)
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in OpenAI response');
      }
      
      const extractedJson = jsonMatch[0];
      let contentPlan = JSON.parse(extractedJson);
      
      // Generate a unique ID if not provided
      if (!contentPlan.id) {
        contentPlan.id = crypto.randomUUID();
      }
      
      // Add createdAt and updatedAt if not present
      const now = new Date().toISOString();
      contentPlan.createdAt = now;
      contentPlan.updatedAt = now;
      
      // Generate IDs for posts if needed
      if (contentPlan.posts) {
        contentPlan.posts = contentPlan.posts.map(post => ({
          ...post,
          id: post.id || crypto.randomUUID()
        }));
      }
      
      return contentPlan;
    } catch (jsonError) {
      console.error('Error parsing OpenAI result:', jsonError);
      console.log('Raw result:', resultText);
      throw new Error('Failed to parse content plan from AI');
    }
  } catch (error) {
    console.error('Error generating content plan with OpenAI:', error);
    throw error;
  }
}

// Helper function to create authenticated Supabase client
async function getSupabaseClient(req) {
  try {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return { error: new Error('No authorization header'), auth: null };
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Create a Supabase client with the user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
    
    // Get user info to verify auth
    const { data, error } = await client.auth.getUser();
    
    if (error || !data.user) {
      return { error: error || new Error('User not found'), auth: null };
    }
    
    return { error: null, auth: { user: data.user, client } };
  } catch (error) {
    return { error, auth: null };
  }
}
