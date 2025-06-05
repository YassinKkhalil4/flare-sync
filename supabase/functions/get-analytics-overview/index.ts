
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../utils/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    const { userId, timeRange } = await req.json()

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      default:
        startDate.setDate(endDate.getDate() - 30)
    }

    // Get user's posts
    const { data: posts, error: postsError } = await supabase
      .from('content_posts')
      .select('id, platform, created_at, metrics')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (postsError) throw postsError

    // Calculate metrics
    let totalLikes = 0
    let totalComments = 0
    let totalShares = 0
    let totalReach = 0
    let totalImpressions = 0
    const platformCounts: Record<string, number> = {}

    posts?.forEach(post => {
      const metrics = post.metrics || {}
      totalLikes += metrics.likes || 0
      totalComments += metrics.comments || 0
      totalShares += metrics.shares || 0
      totalReach += metrics.reach || 0
      totalImpressions += metrics.impressions || 0
      
      platformCounts[post.platform] = (platformCounts[post.platform] || 0) + 1
    })

    const totalEngagement = totalLikes + totalComments + totalShares
    const avgEngagementRate = totalImpressions > 0 ? (totalEngagement / totalImpressions) * 100 : 0
    const bestPerformingPlatform = Object.keys(platformCounts).reduce((a, b) => 
      platformCounts[a] > platformCounts[b] ? a : b, 'instagram'
    )

    // Get recent posts with their analytics
    const recentPosts = posts?.slice(-10).map(post => ({
      id: post.id,
      post_id: post.id,
      platform: post.platform,
      likes: post.metrics?.likes || 0,
      comments: post.metrics?.comments || 0,
      shares: post.metrics?.shares || 0,
      reach: post.metrics?.reach || 0,
      impressions: post.metrics?.impressions || 0,
      engagement_rate: post.metrics?.impressions > 0 ? 
        ((post.metrics?.likes + post.metrics?.comments + post.metrics?.shares) / post.metrics.impressions) * 100 : 0,
      clicks: post.metrics?.clicks || 0,
      saves: post.metrics?.saves || 0,
      date: post.created_at,
      created_at: post.created_at,
      updated_at: post.created_at
    })) || []

    const overview = {
      total_posts: posts?.length || 0,
      total_engagement: totalEngagement,
      avg_engagement_rate: Math.round(avgEngagementRate * 100) / 100,
      total_reach: totalReach,
      total_impressions: totalImpressions,
      growth_rate: 0, // TODO: Calculate growth rate based on previous period
      best_performing_platform: bestPerformingPlatform,
      recent_posts_performance: recentPosts
    }

    return new Response(
      JSON.stringify(overview),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error getting analytics overview:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
