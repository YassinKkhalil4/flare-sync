
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
if (!OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set');
}

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
    const { feature, params } = await req.json();
    
    switch (feature) {
      case 'generate-content-plan':
        return await generateContentPlan(params);
      case 'chat-assistant':
        return await chatAssistant(params);
      case 'analyze-schedule':
        return await analyzeSchedule(params);
      default:
        throw new Error(`Unknown feature: ${feature}`);
    }
  } catch (error) {
    console.error('Error in AI helper:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateContentPlan(params: any) {
  try {
    const { timeCommitment, platforms, goal, niche, additionalInfo } = params;
    
    const systemPrompt = `You are an expert social media content planner for ${niche} creators.
    Create a 7-day content plan with specific posts for each day. For each post, include:
    - Day (Monday-Sunday)
    - Platform (from the list provided)
    - Content type (video, image, carousel, story, etc.)
    - Title
    - Description
    - Suggested caption
    - Hashtags (as an array)
    Return your response as a structured JSON object with a "posts" array containing individual post objects.`;
    
    const userPrompt = `Create a content plan for a ${niche} creator.
    Time commitment: ${timeCommitment} hours per week
    Platforms: ${platforms.join(', ')}
    Goal: ${goal}
    Additional info: ${additionalInfo || 'None provided'}
    
    Generate a 7-day content plan with specific posts for each platform. Be creative but realistic.`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI');
    }
    
    const plan = JSON.parse(data.choices[0].message.content);
    
    // Generate a plan ID and add metadata
    const planData = {
      id: crypto.randomUUID(),
      name: `${niche} Content Plan`,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      goal,
      platforms,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      posts: plan.posts.map((post: any) => ({
        ...post,
        id: crypto.randomUUID(),
        status: 'draft'
      }))
    };
    
    return new Response(JSON.stringify(planData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating content plan:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function chatAssistant(params: any) {
  try {
    const { messages, userId } = params;
    
    const systemPrompt = `You are a knowledgeable social media marketing assistant for creators.
    You can help with content ideas, caption suggestions, audience growth strategies, engagement improvement,
    algorithm insights, and general social media best practices.
    Be concise, practical and give actionable advice.
    If asked about posting times, suggest optimal times for different platforms.
    If asked about content ideas, be specific to the creator's niche.
    If asked about caption help, provide examples and tips for engagement.`;
    
    const allMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ];
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: allMessages,
      }),
    });
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI');
    }
    
    const reply = data.choices[0].message.content;
    
    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat assistant:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function analyzeSchedule(params: any) {
  try {
    const { platform, historicalData } = params;
    
    // In a real app, you would use actual historical data to train a model
    // This is a simplified simulation of analyzing post times for engagement
    
    // Simulate optimal posting schedule based on platform
    let optimalTimes: any = {
      instagram: [
        { day: 'Monday', times: ['11:00', '15:00', '19:00'] },
        { day: 'Tuesday', times: ['10:00', '15:00', '20:00'] },
        { day: 'Wednesday', times: ['11:00', '14:00', '19:00'] },
        { day: 'Thursday', times: ['10:00', '13:00', '20:00'] },
        { day: 'Friday', times: ['11:00', '14:00', '18:00'] },
        { day: 'Saturday', times: ['10:00', '15:00', '19:00'] },
        { day: 'Sunday', times: ['12:00', '16:00', '20:00'] }
      ],
      tiktok: [
        { day: 'Monday', times: ['08:00', '14:00', '21:00'] },
        { day: 'Tuesday', times: ['09:00', '16:00', '22:00'] },
        { day: 'Wednesday', times: ['08:00', '13:00', '21:00'] },
        { day: 'Thursday', times: ['09:00', '15:00', '22:00'] },
        { day: 'Friday', times: ['10:00', '17:00', '23:00'] },
        { day: 'Saturday', times: ['11:00', '18:00', '22:00'] },
        { day: 'Sunday', times: ['12:00', '18:00', '23:00'] }
      ],
      youtube: [
        { day: 'Monday', times: ['15:00', '18:00', '21:00'] },
        { day: 'Tuesday', times: ['15:00', '19:00', '22:00'] },
        { day: 'Wednesday', times: ['15:00', '18:00', '21:00'] },
        { day: 'Thursday', times: ['15:00', '19:00', '22:00'] },
        { day: 'Friday', times: ['16:00', '20:00', '23:00'] },
        { day: 'Saturday', times: ['10:00', '16:00', '20:00'] },
        { day: 'Sunday', times: ['11:00', '15:00', '20:00'] }
      ]
    };
    
    // Return platform-specific schedule or default to Instagram if not found
    const schedule = optimalTimes[platform.toLowerCase()] || optimalTimes.instagram;
    
    // Also provide a heatmap of the full week (hour x day)
    const heatmap = generateEngagementHeatmap(platform.toLowerCase());
    
    return new Response(JSON.stringify({ 
      optimalTimes: schedule,
      heatmap,
      recommendations: [
        "Post consistently at your identified peak times",
        "Test and measure different posting times to refine your schedule",
        "Consider your audience's timezone distribution",
        "Content quality is more important than perfect timing"
      ]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error analyzing schedule:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// Helper function to generate a heatmap of engagement values
function generateEngagementHeatmap(platform: string) {
  const days = 7; // 0 = Sunday, 6 = Saturday
  const hours = 24;
  const heatmap = [];
  
  // Base patterns modified by platform
  let basePatterns = {
    instagram: [
      [0, 0, 0, 0, 0, 0, 0.1, 0.2, 0.3, 0.5, 0.7, 0.9, 0.8, 0.7, 0.7, 0.6, 0.6, 0.7, 0.8, 0.9, 0.7, 0.5, 0.3, 0.1],
      [0, 0, 0, 0, 0, 0, 0.2, 0.3, 0.4, 0.6, 0.8, 0.7, 0.6, 0.7, 0.8, 0.7, 0.6, 0.7, 0.8, 0.7, 0.6, 0.4, 0.2, 0.1],
      [0, 0, 0, 0, 0, 0, 0.2, 0.4, 0.5, 0.6, 0.7, 0.6, 0.7, 0.8, 0.7, 0.6, 0.7, 0.8, 0.7, 0.6, 0.5, 0.3, 0.2, 0.1],
      [0, 0, 0, 0, 0, 0, 0.2, 0.4, 0.6, 0.7, 0.6, 0.5, 0.6, 0.7, 0.8, 0.7, 0.8, 0.9, 0.8, 0.7, 0.5, 0.3, 0.2, 0.1],
      [0, 0, 0, 0, 0, 0, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.3, 0.2],
      [0.1, 0, 0, 0, 0, 0, 0.1, 0.2, 0.3, 0.5, 0.7, 0.8, 0.9, 0.8, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.7, 0.6, 0.4, 0.3],
      [0.1, 0.1, 0, 0, 0, 0, 0.1, 0.1, 0.3, 0.4, 0.6, 0.7, 0.8, 0.7, 0.6, 0.7, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1]
    ],
    tiktok: [
      [0.2, 0.1, 0, 0, 0, 0, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.5, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.7, 0.4],
      [0.2, 0.1, 0, 0, 0, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.5, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.6, 0.3],
      [0.1, 0.1, 0, 0, 0, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.4, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.7, 0.5, 0.3],
      [0.2, 0.1, 0, 0, 0, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.8, 0.9, 1.0, 0.9, 0.7, 0.5, 0.3],
      [0.3, 0.2, 0.1, 0, 0, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.9, 1.0, 0.8, 0.6],
      [0.4, 0.3, 0.2, 0.1, 0.1, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.8, 0.9, 1.0, 0.9, 0.8, 0.9, 1.0, 0.9, 0.7],
      [0.3, 0.2, 0.2, 0.1, 0, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.6, 0.5, 0.6, 0.7, 0.8, 0.9, 0.8, 0.7, 0.6, 0.4, 0.3]
    ],
    youtube: [
      [0.1, 0.1, 0, 0, 0, 0, 0, 0.1, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.7, 0.6, 0.4, 0.2],
      [0.1, 0, 0, 0, 0, 0, 0.1, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.3, 0.2],
      [0.1, 0, 0, 0, 0, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.2, 0.1],
      [0.1, 0, 0, 0, 0, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.2, 0.1],
      [0.1, 0.1, 0, 0, 0, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.8, 0.9, 1.0, 0.8, 0.6, 0.4],
      [0.3, 0.2, 0.1, 0, 0, 0, 0.1, 0.2, 0.3, 0.4, 0.6, 0.8, 1.0, 0.9, 0.8, 0.9, 1.0, 0.9, 0.8, 0.9, 1.0, 0.8, 0.7, 0.5],
      [0.2, 0.2, 0.1, 0, 0, 0, 0.1, 0.2, 0.3, 0.5, 0.7, 0.9, 1.0, 0.9, 0.8, 0.7, 0.8, 0.9, 0.8, 0.7, 0.6, 0.4, 0.3, 0.2]
    ]
  };
  
  const pattern = basePatterns[platform] || basePatterns.instagram;
  
  // Add small random variations to make it look more realistic
  for (let day = 0; day < days; day++) {
    for (let hour = 0; hour < hours; hour++) {
      const baseValue = pattern[day][hour];
      // Add up to 10% random variation
      const randomVariation = (Math.random() * 0.2) - 0.1;
      let value = baseValue + (baseValue * randomVariation);
      // Ensure value stays between 0 and 1
      value = Math.max(0, Math.min(1, value));
      
      heatmap.push({
        day,
        hour,
        value: parseFloat(value.toFixed(2))
      });
    }
  }
  
  return heatmap;
}
