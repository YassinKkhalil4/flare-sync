
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  engagement: {
    date: string;
    likes: number;
    comments: number;
    shares: number;
    reach: number;
  }[];
  platforms: {
    platform: string;
    followers: number;
    engagement: number;
    posts: number;
    avgLikes: number;
    avgComments: number;
    growthRate: number;
    color: string;
  }[];
  insights: {
    id: string;
    title: string;
    type: 'photo' | 'video' | 'text' | 'carousel';
    platform: string;
    publishedAt: string;
    likes: number;
    comments: number;
    shares: number;
    reach: number;
    engagementRate: number;
    hashtags: string[];
    performance: 'excellent' | 'good' | 'average' | 'poor';
  }[];
  topHashtags: {
    tag: string;
    usage: number;
    performance: number;
  }[];
  bestTimes: {
    time: string;
    day: string;
    score: number;
  }[];
}

export const useAnalytics = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load real social profiles data
      const { data: socialProfiles, error: socialError } = await supabase
        .from('social_profiles')
        .select('*')
        .eq('user_id', user.id);

      if (socialError) throw socialError;

      // Load real content posts data
      const { data: contentPosts, error: postsError } = await supabase
        .from('content_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsError) throw postsError;

      // Process social platforms data
      const platformColors: Record<string, string> = {
        instagram: '#E4405F',
        twitter: '#1DA1F2',
        facebook: '#1877F2',
        youtube: '#FF0000',
        tiktok: '#000000'
      };

      const platforms = (socialProfiles || []).map(profile => ({
        platform: profile.platform,
        followers: profile.followers || 0,
        engagement: profile.engagement || 0,
        posts: profile.posts || 0,
        avgLikes: Math.floor((profile.stats as any)?.avgLikes || 0),
        avgComments: Math.floor((profile.stats as any)?.avgComments || 0),
        growthRate: Math.floor((profile.stats as any)?.growthRate || 0),
        color: platformColors[profile.platform] || '#6B7280'
      }));

      // Process content insights from real posts
      const insights = (contentPosts || []).map(post => {
        const metrics = post.metrics as any || {};
        const likes = metrics.likes || 0;
        const comments = metrics.comments || 0;
        const shares = metrics.shares || 0;
        const reach = metrics.reach || 0;
        
        const engagementRate = reach > 0 ? ((likes + comments + shares) / reach) * 100 : 0;
        
        let performance: 'excellent' | 'good' | 'average' | 'poor' = 'poor';
        if (engagementRate > 5) performance = 'excellent';
        else if (engagementRate > 3) performance = 'good';
        else if (engagementRate > 1) performance = 'average';

        return {
          id: post.id,
          title: post.title,
          type: 'photo' as const, // Default type
          platform: post.platform,
          publishedAt: post.published_at || post.created_at,
          likes,
          comments,
          shares,
          reach,
          engagementRate,
          hashtags: [], // Extract from content if needed
          performance
        };
      });

      // Generate engagement timeline from real posts
      const engagement = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        
        // Find posts from this date
        const dayPosts = contentPosts?.filter(post => {
          const postDate = new Date(post.published_at || post.created_at);
          return postDate.toDateString() === date.toDateString();
        }) || [];

        const dayMetrics = dayPosts.reduce((acc, post) => {
          const metrics = post.metrics as any || {};
          return {
            likes: acc.likes + (metrics.likes || 0),
            comments: acc.comments + (metrics.comments || 0),
            shares: acc.shares + (metrics.shares || 0),
            reach: acc.reach + (metrics.reach || 0)
          };
        }, { likes: 0, comments: 0, shares: 0, reach: 0 });

        return {
          date: date.toISOString().split('T')[0],
          ...dayMetrics
        };
      });

      // Generate hashtags analysis (placeholder for now)
      const topHashtags = [
        { tag: 'socialmedia', usage: 45, performance: 6.8 },
        { tag: 'marketing', usage: 38, performance: 5.2 },
        { tag: 'content', usage: 52, performance: 4.9 },
        { tag: 'engagement', usage: 29, performance: 7.1 },
        { tag: 'digital', usage: 33, performance: 3.8 }
      ];

      // Generate best posting times (placeholder for now)
      const bestTimes = [
        { time: '9:00 AM', day: 'Monday', score: 85 },
        { time: '2:00 PM', day: 'Wednesday', score: 92 },
        { time: '6:00 PM', day: 'Friday', score: 78 },
        { time: '11:00 AM', day: 'Saturday', score: 88 },
        { time: '8:00 PM', day: 'Sunday', score: 73 }
      ];

      setAnalyticsData({
        engagement,
        platforms,
        insights,
        topHashtags,
        bestTimes
      });
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  return {
    analyticsData,
    isLoading,
    error,
    refreshAnalytics: loadAnalytics
  };
};
