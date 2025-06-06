
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

    const { niche, audienceSize, engagementRate, location, platforms } = await req.json();

    // Simulate brand matching logic
    const mockBrands = [
      {
        id: 'brand_1',
        name: 'EcoStyle Fashion',
        description: 'Sustainable fashion brand focused on eco-friendly materials',
        industry: 'Fashion',
        budget_range: '$1,000 - $5,000',
        requirements: ['Instagram content', 'Sustainability focus', 'Fashion niche'],
        contact_email: 'partnerships@ecostyle.com',
        match_score: 92,
        compatibility_reasons: [
          'Perfect audience alignment with sustainable fashion',
          'Strong engagement rate matches our requirements',
          'Instagram presence aligns with our marketing strategy'
        ]
      },
      {
        id: 'brand_2',
        name: 'TechGadget Pro',
        description: 'Premium technology accessories and gadgets',
        industry: 'Technology',
        budget_range: '$2,000 - $8,000',
        requirements: ['Tech reviews', 'Unboxing content', 'YouTube presence'],
        contact_email: 'collabs@techgadgetpro.com',
        match_score: 78,
        compatibility_reasons: [
          'Good audience size for tech products',
          'Content style matches brand aesthetic',
          'Engagement rate indicates quality audience'
        ]
      }
    ];

    // Filter brands based on criteria
    const filteredBrands = mockBrands.filter(brand => {
      if (audienceSize < 1000) return brand.budget_range.includes('$1,000');
      if (audienceSize > 10000) return brand.budget_range.includes('$5,000') || brand.budget_range.includes('$8,000');
      return true;
    });

    return new Response(JSON.stringify(filteredBrands), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in brand-matchmaker function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
