
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface AnalyticsData {
  totalPosts: number;
  totalEngagement: number;
  totalReach: number;
  avgEngagementRate: number;
  postsByPlatform: { platform: string; count: number; }[];
  recentPosts: {
    id: string;
    title: string;
    platform: string;
    published_at: string;
    metrics: {
      likes: number;
      comments: number;
      shares: number;
    };
  }[];
  socialProfiles: {
    platform: string;
    followers: number;
    engagement: number;
    connected: boolean;
  }[];
}

export const useRealAnalytics = () => {
  const { user } = useAuth();

  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['analytics', user?.id],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!user?.id) throw new Error('Not authenticated');

      // Fetch content posts
      const { data: posts, error: postsError } = await supabase
        .from('content_posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'published');

      if (postsError) throw postsError;

      // Fetch social profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('social_profiles')
        .select('platform, followers, engagement, connected')
        .eq('user_id', user.id);

      if (profilesError) throw profilesError;

      // Calculate analytics
      const totalPosts = posts?.length || 0;
      const totalEngagement = posts?.reduce((sum, post) => {
        const metrics = post.metrics as any;
        return sum + (metrics?.likes || 0) + (metrics?.comments || 0) + (metrics?.shares || 0);
      }, 0) || 0;

      const totalReach = profiles?.reduce((sum, profile) => sum + (profile.followers || 0), 0) || 0;
      const avgEngagementRate = profiles?.reduce((sum, profile) => sum + (profile.engagement || 0), 0) / (profiles?.length || 1) || 0;

      // Posts by platform
      const postsByPlatform = posts?.reduce((acc, post) => {
        const existing = acc.find(p => p.platform === post.platform);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ platform: post.platform, count: 1 });
        }
        return acc;
      }, [] as { platform: string; count: number; }[]) || [];

      // Recent posts with metrics
      const recentPosts = posts?.slice(0, 10).map(post => ({
        id: post.id,
        title: post.title,
        platform: post.platform,
        published_at: post.published_at || post.created_at,
        metrics: {
          likes: (post.metrics as any)?.likes || 0,
          comments: (post.metrics as any)?.comments || 0,
          shares: (post.metrics as any)?.shares || 0,
        }
      })) || [];

      return {
        totalPosts,
        totalEngagement,
        totalReach,
        avgEngagementRate,
        postsByPlatform,
        recentPosts,
        socialProfiles: profiles || [],
      };
    },
    enabled: !!user?.id,
  });

  return {
    analyticsData,
    isLoading,
    error,
  };
};
