
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, BarChart, LineChart, PieChart } from '@/components/ui/charts';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, BarChart3, Calendar, TrendingUp } from 'lucide-react';

interface AnalyticsData {
  followers: {
    labels: string[];
    data: number[];
  };
  engagement: {
    labels: string[];
    data: number[];
  };
  postPerformance: {
    labels: string[];
    likes: number[];
    comments: number[];
    shares: number[];
  };
  platformBreakdown: {
    labels: string[];
    data: number[];
  };
}

export default function Analytics() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        // Try to fetch real data from Supabase
        const { data: socialProfiles, error: profilesError } = await supabase
          .from('social_profiles')
          .select('platform, followers, engagement, stats, last_synced')
          .eq('user_id', user.id)
          .order('platform', { ascending: true });

        if (profilesError) throw profilesError;

        // Fetch content posts for engagement analysis
        const { data: posts, error: postsError } = await supabase
          .from('content_posts')
          .select('published_at, platform, metrics, title')
          .eq('user_id', user.id)
          .order('published_at', { ascending: false })
          .limit(15);

        if (postsError) throw postsError;

        // If no real data, set empty data
        setAnalyticsData({
          followers: {
            labels: [],
            data: [],
          },
          engagement: {
            labels: [],
            data: [],
          },
          postPerformance: {
            labels: [],
            likes: [],
            comments: [],
            shares: [],
          },
          platformBreakdown: {
            labels: [],
            data: [],
          },
        });
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
        
        // Set empty data for development
        setAnalyticsData({
          followers: {
            labels: [],
            data: [],
          },
          engagement: {
            labels: [],
            data: [],
          },
          postPerformance: {
            labels: [],
            likes: [],
            comments: [],
            shares: [],
          },
          platformBreakdown: {
            labels: [],
            data: [],
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [user?.id]);

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

  // Ensure we have data to display - use empty arrays if not
  const safeData = analyticsData || {
    followers: { labels: [], data: [] },
    engagement: { labels: [], data: [] },
    postPerformance: { labels: [], likes: [], comments: [], shares: [] },
    platformBreakdown: { labels: [], data: [] }
  };

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6 lg:mb-8 space-y-4 sm:space-y-0">
          <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary sm:mr-3" />
          <h1 className="text-2xl sm:text-3xl font-bold">Analytics Dashboard</h1>
        </div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-auto">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="platforms" className="text-xs sm:text-sm">Platforms</TabsTrigger>
              <TabsTrigger value="content" className="text-xs sm:text-sm">Content</TabsTrigger>
              <TabsTrigger value="audience" className="text-xs sm:text-sm">Audience</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center text-base sm:text-lg">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-500" />
                    Follower Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">No follower data available</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center text-base sm:text-lg">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" />
                    Engagement Rate (%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">No engagement data available</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Platform Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">No platform data available</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Recent Post Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] sm:h-[300px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">No post data available</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="platforms">
            <div className="grid gap-4 lg:gap-6">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Platform-specific Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">No platform data available</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="content">
            <div className="grid gap-4 lg:gap-6">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Content Performance Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">No content data available</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="audience">
            <div className="grid gap-4 lg:gap-6">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Audience Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">No audience data available</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
