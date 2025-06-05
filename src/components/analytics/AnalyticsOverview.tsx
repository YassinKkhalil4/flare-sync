
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Eye, Heart, RefreshCw } from 'lucide-react';
import { useRealAnalytics } from '@/hooks/useRealAnalytics';

interface AnalyticsOverviewProps {
  timeRange?: string;
}

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({ timeRange = '30d' }) => {
  const { overview, isLoadingOverview, syncAnalytics, isSyncing } = useRealAnalytics(timeRange);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleSyncAnalytics = () => {
    syncAnalytics('instagram'); // Default to Instagram, can be made dynamic
  };

  if (isLoadingOverview) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Overview</h2>
        <Button 
          onClick={handleSyncAnalytics} 
          disabled={isSyncing}
          variant="outline"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Analytics
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.total_posts || 0}</div>
            <p className="text-xs text-muted-foreground">
              Last {timeRange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview?.total_engagement || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Likes, comments, shares
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.avg_engagement_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Engagement / Impressions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview?.total_reach || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Unique accounts reached
            </p>
          </CardContent>
        </Card>
      </div>

      {overview?.recent_posts_performance && overview.recent_posts_performance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts Performance</CardTitle>
            <CardDescription>
              Performance metrics for your latest posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overview.recent_posts_performance.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize">{post.platform}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span>{formatNumber(post.likes)} likes</span>
                    <span>{formatNumber(post.comments)} comments</span>
                    <span>{post.engagement_rate.toFixed(1)}% rate</span>
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

export default AnalyticsOverview;
