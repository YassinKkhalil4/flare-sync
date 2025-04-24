
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, handleCors, createErrorResponse, createSuccessResponse, validateAuth } from '../utils/cors.ts'
import { getSupabaseClient } from '../utils/supabase.ts'

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const token = validateAuth(req);
    const { target, method = 'GET', body } = await req.json();

    if (!target) {
      throw new Error('Missing target API endpoint');
    }

    // Validate user authentication
    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get required API keys based on target
    const apiKey = Deno.env.get(`${target.toUpperCase()}_API_KEY`);
    if (!apiKey) {
      throw new Error(`Missing API key for ${target}`);
    }

    // Make the actual API call
    const response = await fetch(target, {
      method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    return createSuccessResponse(data);

  } catch (error) {
    return createErrorResponse(error);
  }
});
