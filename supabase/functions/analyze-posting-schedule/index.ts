
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyzeScheduleParams {
  platform: string;
  contentType: string;
  audienceLocation: string;
  postCount: number;
}

interface OptimalTime {
  day: string;
  times: string[];
}

interface HeatmapData {
  day: number;
  hour: number;
  value: number;
}

interface SchedulingData {
  optimalTimes: OptimalTime[];
  heatmap: HeatmapData[];
  recommendations: string[];
}

function generateOptimalTimes(platform: string): OptimalTime[] {
  const baseTimes: Record<string, OptimalTime[]> = {
    instagram: [
      { day: 'Monday', times: ['6:00 AM', '12:00 PM', '7:00 PM'] },
      { day: 'Tuesday', times: ['6:00 AM', '12:00 PM', '5:00 PM'] },
      { day: 'Wednesday', times: ['7:00 AM', '1:00 PM', '9:00 PM'] },
      { day: 'Thursday', times: ['9:00 AM', '12:00 PM', '7:00 PM'] },
      { day: 'Friday', times: ['9:00 AM', '1:00 PM', '4:00 PM'] },
      { day: 'Saturday', times: ['11:00 AM', '1:00 PM', '4:00 PM'] },
      { day: 'Sunday', times: ['10:00 AM', '1:00 PM', '4:00 PM'] }
    ],
    twitter: [
      { day: 'Monday', times: ['8:00 AM', '12:00 PM', '5:00 PM'] },
      { day: 'Tuesday', times: ['8:00 AM', '12:00 PM', '5:00 PM'] },
      { day: 'Wednesday', times: ['9:00 AM', '1:00 PM', '6:00 PM'] },
      { day: 'Thursday', times: ['9:00 AM', '12:00 PM', '5:00 PM'] },
      { day: 'Friday', times: ['9:00 AM', '12:00 PM', '3:00 PM'] },
      { day: 'Saturday', times: ['10:00 AM', '12:00 PM', '2:00 PM'] },
      { day: 'Sunday', times: ['10:00 AM', '12:00 PM', '2:00 PM'] }
    ],
    tiktok: [
      { day: 'Monday', times: ['6:00 AM', '10:00 AM', '7:00 PM'] },
      { day: 'Tuesday', times: ['6:00 AM', '10:00 AM', '8:00 PM'] },
      { day: 'Wednesday', times: ['7:00 AM', '12:00 PM', '9:00 PM'] },
      { day: 'Thursday', times: ['9:00 AM', '12:00 PM', '7:00 PM'] },
      { day: 'Friday', times: ['5:00 AM', '1:00 PM', '3:00 PM'] },
      { day: 'Saturday', times: ['11:00 AM', '7:00 PM', '8:00 PM'] },
      { day: 'Sunday', times: ['7:00 AM', '8:00 PM', '9:00 PM'] }
    ]
  };

  return baseTimes[platform] || baseTimes.instagram;
}

function generateHeatmap(platform: string): HeatmapData[] {
  const heatmap: HeatmapData[] = [];
  
  // Generate realistic engagement patterns based on platform
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      let value = 0;
      
      if (platform === 'instagram') {
        // Instagram peaks: morning (6-9), lunch (12-1), evening (5-9)
        if ((hour >= 6 && hour <= 9) || (hour >= 12 && hour <= 13) || (hour >= 17 && hour <= 21)) {
          value = 0.6 + Math.random() * 0.4;
        } else if (hour >= 10 && hour <= 16) {
          value = 0.3 + Math.random() * 0.3;
        } else {
          value = Math.random() * 0.3;
        }
      } else if (platform === 'twitter') {
        // Twitter is more active during work hours
        if (hour >= 8 && hour <= 18) {
          value = 0.5 + Math.random() * 0.4;
        } else if (hour >= 19 && hour <= 22) {
          value = 0.4 + Math.random() * 0.3;
        } else {
          value = Math.random() * 0.3;
        }
      } else if (platform === 'tiktok') {
        // TikTok peaks in evening and late night
        if (hour >= 19 && hour <= 23) {
          value = 0.7 + Math.random() * 0.3;
        } else if (hour >= 6 && hour <= 9) {
          value = 0.5 + Math.random() * 0.3;
        } else {
          value = Math.random() * 0.4;
        }
      }
      
      // Weekend adjustments
      if (day === 5 || day === 6) {
        if (hour >= 10 && hour <= 16) {
          value *= 1.2; // Boost weekend afternoon engagement
        }
      }
      
      heatmap.push({ day, hour, value: Math.min(value, 1) });
    }
  }
  
  return heatmap;
}

function generateRecommendations(platform: string, contentType: string): string[] {
  const recommendations = [
    `Post consistently during peak hours for ${platform} to maximize engagement`,
    `${contentType} content performs best with engaging captions and relevant hashtags`,
    `Monitor your audience insights to refine posting times based on your followers`,
    `Engage with your audience by responding to comments within the first hour`,
    `Use analytics to track which posting times work best for your specific audience`
  ];

  if (platform === 'instagram') {
    recommendations.push('Stories and Reels typically get higher engagement than regular posts');
    recommendations.push('Use 3-5 relevant hashtags for optimal reach without appearing spammy');
  } else if (platform === 'twitter') {
    recommendations.push('Tweet during business hours for B2B content, evenings for B2C');
    recommendations.push('Keep tweets concise and include compelling visuals when possible');
  } else if (platform === 'tiktok') {
    recommendations.push('Post during evening hours when users are most active');
    recommendations.push('Use trending sounds and hashtags to increase discoverability');
  }

  return recommendations;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const params: AnalyzeScheduleParams = await req.json();
    const { platform, contentType, audienceLocation, postCount } = params;

    console.log('Analyzing posting schedule for:', { platform, contentType, audienceLocation, postCount });

    // Generate optimal times based on platform and best practices
    const optimalTimes = generateOptimalTimes(platform);
    
    // Generate engagement heatmap
    const heatmap = generateHeatmap(platform);
    
    // Generate platform-specific recommendations
    const recommendations = generateRecommendations(platform, contentType);

    const schedulingData: SchedulingData = {
      optimalTimes,
      heatmap,
      recommendations
    };

    return new Response(
      JSON.stringify(schedulingData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing posting schedule:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
