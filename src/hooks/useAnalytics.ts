
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
          type: 'photo' as const,
          platform: post.platform,
          publishedAt: post.published_at || post.created_at,
          likes,
          comments,
          shares,
          reach,
          engagementRate,
          hashtags: [],
          performance
        };
      });

      // Generate engagement timeline from real posts
      const engagement = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        
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

      // Calculate real hashtag performance from posts
      const hashtagMap = new Map();
      contentPosts?.forEach(post => {
        const content = post.body || '';
        const hashtags = content.match(/#\w+/g) || [];
        const metrics = post.metrics as any || {};
        const engagement = (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0);
        
        hashtags.forEach(tag => {
          const cleanTag = tag.slice(1); // Remove #
          if (hashtagMap.has(cleanTag)) {
            const existing = hashtagMap.get(cleanTag);
            existing.usage += 1;
            existing.totalEngagement += engagement;
          } else {
            hashtagMap.set(cleanTag, { usage: 1, totalEngagement: engagement });
          }
        });
      });

      const topHashtags = Array.from(hashtagMap.entries())
        .map(([tag, data]) => ({
          tag,
          usage: data.usage,
          performance: data.usage > 0 ? Math.round((data.totalEngagement / data.usage) / 10) : 0
        }))
        .sort((a, b) => b.usage - a.usage)
        .slice(0, 5);

      // Calculate best posting times from real data
      const timeMap = new Map();
      contentPosts?.forEach(post => {
        if (post.published_at) {
          const date = new Date(post.published_at);
          const hour = date.getHours();
          const day = date.toLocaleDateString('en-US', { weekday: 'long' });
          const timeSlot = `${hour}:00`;
          const key = `${day}-${timeSlot}`;
          
          const metrics = post.metrics as any || {};
          const engagement = (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0);
          
          if (timeMap.has(key)) {
            const existing = timeMap.get(key);
            existing.count += 1;
            existing.totalEngagement += engagement;
          } else {
            timeMap.set(key, { day, time: timeSlot, count: 1, totalEngagement: engagement });
          }
        }
      });

      const bestTimes = Array.from(timeMap.values())
        .map(data => ({
          time: data.time,
          day: data.day,
          score: data.count > 0 ? Math.round((data.totalEngagement / data.count) / 10) : 0
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

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
