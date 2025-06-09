
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { EngagementChart } from './EngagementChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, Heart, MessageCircle, Share, Eye } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');

  const { data: socialProfiles = [] } = useQuery({
    queryKey: ['socialProfiles', user?.id],
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

  const { data: postMetrics = [] } = useQuery({
    queryKey: ['postMetrics', user?.id, timeRange],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const since = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('content_posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'published')
        .gte('published_at', since)
        .order('published_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Calculate summary metrics
  const totalFollowers = socialProfiles.reduce((sum, profile) => sum + (profile.followers || 0), 0);
  const averageEngagement = socialProfiles.length 
    ? socialProfiles.reduce((sum, profile) => sum + (profile.engagement || 0), 0) / socialProfiles.length 
    : 0;
  
  const totalPosts = postMetrics.length;
  const totalLikes = postMetrics.reduce((sum, post) => {
    const metrics = post.metrics || {};
    return sum + (metrics.likes || 0);
  }, 0);
  
  const totalComments = postMetrics.reduce((sum, post) => {
    const metrics = post.metrics || {};
    return sum + (metrics.comments || 0);
  }, 0);

  const totalShares = postMetrics.reduce((sum, post) => {
    const metrics = post.metrics || {};
    return sum + (metrics.shares || 0);
  }, 0);

  // Generate mock engagement chart data
  const generateChartData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const instagram = 3 + Math.random() * 4; // 3-7%
      const twitter = 2 + Math.random() * 3; // 2-5%
      const youtube = 4 + Math.random() * 6; // 4-10%
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        instagram: parseFloat(instagram.toFixed(2)),
        twitter: parseFloat(twitter.toFixed(2)),
        youtube: parseFloat(youtube.toFixed(2)),
        average: parseFloat(((instagram + twitter + youtube) / 3).toFixed(2))
      });
    }
    
    return data;
  };

  const chartData = generateChartData();

  const MetricCard = ({ title, value, change, icon: Icon, color }: {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ElementType;
    color: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <div className="flex items-center mt-1">
                {change >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                <span className={`text-xs font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(change)}%
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your social media performance and engagement</p>
        </div>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Followers"
          value={totalFollowers.toLocaleString()}
          change={Math.random() > 0.5 ? Math.floor(Math.random() * 15) : -Math.floor(Math.random() * 5)}
          icon={Users}
          color="bg-blue-500"
        />
        <MetricCard
          title="Avg Engagement"
          value={`${averageEngagement.toFixed(1)}%`}
          change={Math.random() > 0.5 ? Math.floor(Math.random() * 10) : -Math.floor(Math.random() * 3)}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <MetricCard
          title="Total Likes"
          value={totalLikes.toLocaleString()}
          change={Math.random() > 0.5 ? Math.floor(Math.random() * 20) : -Math.floor(Math.random() * 8)}
          icon={Heart}
          color="bg-red-500"
        />
        <MetricCard
          title="Total Comments"
          value={totalComments.toLocaleString()}
          change={Math.random() > 0.5 ? Math.floor(Math.random() * 25) : -Math.floor(Math.random() * 10)}
          icon={MessageCircle}
          color="bg-purple-500"
        />
      </div>

      {/* Engagement Chart */}
      <EngagementChart data={chartData} timeRange={timeRange} />

      {/* Platform Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {socialProfiles.map((profile) => (
              <div key={profile.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{profile.platform}</Badge>
                  <div>
                    <p className="font-medium">@{profile.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.followers?.toLocaleString()} followers
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{profile.engagement}%</p>
                  <p className="text-xs text-muted-foreground">engagement</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Post Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {postMetrics.slice(0, 5).map((post) => {
              const metrics = post.metrics || {};
              return (
                <div key={post.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium line-clamp-1">{post.title}</p>
                    <p className="text-sm text-muted-foreground">{post.platform}</p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {metrics.likes || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {metrics.comments || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Share className="h-3 w-3" />
                      {metrics.shares || 0}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
