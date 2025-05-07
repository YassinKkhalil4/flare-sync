
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
    const { creatorId, filters } = await req.json();

    // Validate inputs
    if (!creatorId) {
      throw new Error('Creator ID is required');
    }

    const { error: authError, auth } = await getSupabaseClient(req);
    if (authError) {
      throw new Error(`Authentication error: ${authError.message}`);
    }

    // Get creator profile from the database
    const { data: creatorData, error: creatorError } = await auth.client.from('profiles')
      .select('*')
      .eq('id', creatorId)
      .single();

    if (creatorError) {
      throw new Error(`Error fetching creator profile: ${creatorError.message}`);
    }

    if (!creatorData) {
      throw new Error('Creator profile not found');
    }

    // Get suitable brands for matching
    const { data: brands, error: brandsError } = await auth.client.from('brands')
      .select('*');

    if (brandsError) {
      throw new Error(`Error fetching brands: ${brandsError.message}`);
    }

    // Use OpenAI to analyze and match brands
    const matchResults = await findBrandMatches(creatorData, brands, filters);

    return new Response(JSON.stringify(matchResults), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in brand-matchmaker function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function findBrandMatches(creatorProfile, brands, filters) {
  try {
    // Use OpenAI to analyze and match
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
            content: 'You are an AI that specializes in matching brands with creators for marketing collaborations. Your task is to analyze a creator profile and a list of brands, and return the top matching brands based on audience alignment, content style, and campaign goals.' 
          },
          { 
            role: 'user', 
            content: `
              Creator Profile: ${JSON.stringify(creatorProfile)}
              Available Brands: ${JSON.stringify(brands)}
              Filters: ${JSON.stringify(filters)}
              
              Return the top 5 brand matches with these details for each match:
              1. brandId
              2. brandName
              3. matchScore (0-100)
              4. reasonForMatch (array of 3-5 reasons)
              5. estimatedMetrics (cpm, ctr, roi)
              
              Format the response as valid JSON that can be parsed directly.
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
      const parsedResult = JSON.parse(extractedJson);
      
      if (!Array.isArray(parsedResult)) {
        // If the result is an object with a matches property that is an array
        if (parsedResult.matches && Array.isArray(parsedResult.matches)) {
          return parsedResult.matches;
        }
        // Create an array from a single match if needed
        return [parsedResult];
      }
      
      return parsedResult;
    } catch (jsonError) {
      console.error('Error parsing OpenAI result:', jsonError);
      console.log('Raw result:', resultText);
      throw new Error('Failed to parse brand match results from AI');
    }
  } catch (error) {
    console.error('Error matching brands with OpenAI:', error);
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
