
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EngagementChart } from './EngagementChart';
import { Loader2, TrendingUp, Users, Heart, MessageCircle, Share2, Eye } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', user?.id, timeRange],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('post_analytics')
        .select(`
          *,
          posts (
            title,
            platform,
            created_at
          )
        `)
        .eq('posts.user_id', user.id)
        .gte('created_at', getDateRange(timeRange))
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: socialProfiles } = useQuery({
    queryKey: ['social-profiles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('social_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('connected', true);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const getDateRange = (range: string) => {
    const now = new Date();
    const days = parseInt(range.replace('d', ''));
    const pastDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    return pastDate.toISOString();
  };

  const processEngagementData = () => {
    if (!analytics) return [];
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayAnalytics = analytics.filter(a => 
        a.created_at?.startsWith(date)
      );

      const totalLikes = dayAnalytics.reduce((sum, item) => sum + (item.likes || 0), 0);
      const totalComments = dayAnalytics.reduce((sum, item) => sum + (item.comments || 0), 0);
      const totalShares = dayAnalytics.reduce((sum, item) => sum + (item.shares || 0), 0);
      const totalReach = dayAnalytics.reduce((sum, item) => sum + (item.reach || 0), 0);

      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
        reach: totalReach
      };
    });
  };

  const getTotalMetrics = () => {
    if (!analytics) return { likes: 0, comments: 0, shares: 0, reach: 0 };
    
    return analytics.reduce((totals, item) => ({
      likes: totals.likes + (item.likes || 0),
      comments: totals.comments + (item.comments || 0),
      shares: totals.shares + (item.shares || 0),
      reach: totals.reach + (item.reach || 0)
    }), { likes: 0, comments: 0, shares: 0, reach: 0 });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  const engagementData = processEngagementData();
  const totalMetrics = getTotalMetrics();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 days</SelectItem>
            <SelectItem value="30d">30 days</SelectItem>
            <SelectItem value="90d">90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.likes.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.comments.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.shares.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.reach.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <EngagementChart data={engagementData} timeRange={timeRange} />

      {socialProfiles && socialProfiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Connected Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {socialProfiles.map((profile) => (
                <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium capitalize">{profile.platform}</h4>
                    <p className="text-sm text-muted-foreground">@{profile.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{(profile.followers || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">followers</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
