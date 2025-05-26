
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
      <div className="container py-8 text-center">
        <p className="text-lg">Please log in to view analytics.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading analytics data...</span>
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
    <div className="container py-8">
      <div className="flex items-center mb-8">
        <BarChart3 className="h-8 w-8 text-primary mr-3" />
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <div className="mb-6">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  Follower Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">No follower data available</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                  Engagement Rate (%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">No engagement data available</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">No platform data available</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Post Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">No post data available</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="platforms">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform-specific Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No platform data available</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="content">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No content data available</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="audience">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Audience Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No audience data available</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
