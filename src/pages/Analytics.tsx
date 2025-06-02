
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealAnalytics } from '@/hooks/useRealAnalytics';
import { Loader2, BarChart3, Calendar, TrendingUp, Users } from 'lucide-react';

export default function Analytics() {
  const { user } = useAuth();
  const { analyticsData, isLoading, error } = useRealAnalytics();

  if (!user?.id) {
    return (
      <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl mx-auto text-center">
          <p className="text-base sm:text-lg">Please log in to view analytics.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl mx-auto flex items-center justify-center">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mr-2" />
          <span className="text-sm sm:text-base">Loading analytics data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl mx-auto text-center">
          <p className="text-base sm:text-lg text-red-500">Error loading analytics data</p>
        </div>
      </div>
    );
  }

  const data = analyticsData!;

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 lg:mb-8 space-y-4 sm:space-y-0">
          <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary sm:mr-3" />
          <h1 className="text-2xl sm:text-3xl font-bold">Analytics Dashboard</h1>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                  <p className="text-2xl font-bold">{data.totalPosts}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Engagement</p>
                  <p className="text-2xl font-bold">{data.totalEngagement.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reach</p>
                  <p className="text-2xl font-bold">{data.totalReach.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Engagement Rate</p>
                  <p className="text-2xl font-bold">{data.avgEngagementRate.toFixed(1)}%</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-auto mb-6">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="platforms" className="text-xs sm:text-sm">Platforms</TabsTrigger>
            <TabsTrigger value="content" className="text-xs sm:text-sm">Content</TabsTrigger>
            <TabsTrigger value="audience" className="text-xs sm:text-sm">Audience</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Posts by Platform</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.postsByPlatform.length > 0 ? (
                    <div className="space-y-4">
                      {data.postsByPlatform.map((platform) => (
                        <div key={platform.platform} className="flex items-center justify-between">
                          <span className="capitalize">{platform.platform}</span>
                          <span className="font-medium">{platform.count} posts</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No posts found</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Posts Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.recentPosts.length > 0 ? (
                    <div className="space-y-4">
                      {data.recentPosts.slice(0, 5).map((post) => (
                        <div key={post.id} className="border-b pb-2">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-sm truncate">{post.title}</h4>
                            <span className="text-xs text-muted-foreground capitalize">{post.platform}</span>
                          </div>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>{post.metrics.likes} likes</span>
                            <span>{post.metrics.comments} comments</span>
                            <span>{post.metrics.shares} shares</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No posts found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="platforms">
            <Card>
              <CardHeader>
                <CardTitle>Connected Platforms</CardTitle>
              </CardHeader>
              <CardContent>
                {data.socialProfiles.length > 0 ? (
                  <div className="grid gap-4">
                    {data.socialProfiles.map((profile) => (
                      <div key={profile.platform} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium capitalize">{profile.platform}</h3>
                          <p className="text-sm text-muted-foreground">
                            {profile.followers.toLocaleString()} followers • {profile.engagement.toFixed(1)}% engagement
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${profile.connected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {profile.connected ? 'Connected' : 'Disconnected'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No connected platforms</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {data.recentPosts.length > 0 ? (
                  <div className="space-y-4">
                    {data.recentPosts.map((post) => (
                      <div key={post.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{post.title}</h3>
                          <span className="text-xs text-muted-foreground capitalize bg-gray-100 px-2 py-1 rounded">
                            {post.platform}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-lg font-bold">{post.metrics.likes}</p>
                            <p className="text-xs text-muted-foreground">Likes</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">{post.metrics.comments}</p>
                            <p className="text-xs text-muted-foreground">Comments</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">{post.metrics.shares}</p>
                            <p className="text-xs text-muted-foreground">Shares</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No content data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="audience">
            <Card>
              <CardHeader>
                <CardTitle>Audience Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4">Follower Distribution</h4>
                    {data.socialProfiles.map((profile) => (
                      <div key={profile.platform} className="flex justify-between items-center mb-2">
                        <span className="capitalize">{profile.platform}</span>
                        <span className="font-medium">{profile.followers.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">Engagement Rates</h4>
                    {data.socialProfiles.map((profile) => (
                      <div key={profile.platform} className="flex justify-between items-center mb-2">
                        <span className="capitalize">{profile.platform}</span>
                        <span className="font-medium">{profile.engagement.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
