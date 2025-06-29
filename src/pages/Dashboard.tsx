
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useSubscription } from '@/hooks/useSubscription';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import OverviewCard from '@/components/Dashboard/OverviewCard';
import PaymentHistoryWidget from '@/components/Dashboard/PaymentHistoryWidget';
import NotificationsWidget from '@/components/Dashboard/NotificationsWidget';
import { Loader2, Users, Calendar, BarChart3, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { unreadCount } = useNotifications();
  const { subscription, isLoading: isSubscriptionLoading } = useSubscription();
  const [stats, setStats] = useState({
    scheduledPosts: 0,
    socialAccounts: 0,
    totalEngagement: 0,
    pendingDeals: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!user) return;
      
      setIsLoadingStats(true);
      try {
        // Fetch real scheduled posts count
        const { data: scheduledPosts, error: postsError } = await supabase
          .from('scheduled_posts')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'scheduled');

        if (postsError) {
          console.error('Error fetching scheduled posts:', postsError);
        }

        // Fetch real connected social accounts
        const { data: socialProfiles, error: profilesError } = await supabase
          .from('social_profiles')
          .select('id')
          .eq('user_id', user.id)
          .eq('connected', true);

        if (profilesError) {
          console.error('Error fetching social profiles:', profilesError);
        }

        // Fetch real content posts for engagement calculation
        const { data: contentPosts, error: contentError } = await supabase
          .from('content_posts')
          .select('metrics')
          .eq('user_id', user.id);

        if (contentError) {
          console.error('Error fetching content posts:', contentError);
        }

        // Calculate total engagement from real data
        let totalEngagement = 0;
        if (contentPosts) {
          totalEngagement = contentPosts.reduce((sum, post) => {
            const metrics = post.metrics as any || {};
            return sum + (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0);
          }, 0);
        }

        // Fetch real pending deals
        const { data: deals, error: dealsError } = await supabase
          .from('brand_deals')
          .select('id')
          .eq('creator_id', user.id)
          .eq('status', 'pending');

        if (dealsError) {
          console.error('Error fetching deals:', dealsError);
        }

        setStats({
          scheduledPosts: scheduledPosts?.length || 0,
          socialAccounts: socialProfiles?.length || 0,
          totalEngagement: totalEngagement,
          pendingDeals: deals?.length || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Set all stats to 0 on error
        setStats({
          scheduledPosts: 0,
          socialAccounts: 0,
          totalEngagement: 0,
          pendingDeals: 0,
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchDashboardStats();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Welcome back, {user.name || 'Creator'}! Here's an overview of your account.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <OverviewCard 
          title="Scheduled Posts"
          value={isLoadingStats ? '...' : stats.scheduledPosts.toString()}
          icon={<Calendar className="h-5 w-5" />}
          description="Posts scheduled for publication"
          isLoading={isLoadingStats}
        />
        <OverviewCard 
          title="Social Accounts"
          value={isLoadingStats ? '...' : stats.socialAccounts.toString()}
          icon={<Users className="h-5 w-5" />}
          description="Connected social platforms"
          isLoading={isLoadingStats}
        />
        <OverviewCard 
          title="Total Engagement"
          value={isLoadingStats ? '...' : stats.totalEngagement.toLocaleString()}
          icon={<BarChart3 className="h-5 w-5" />}
          description="Across all platforms"
          isLoading={isLoadingStats}
        />
        <OverviewCard 
          title="Pending Deals"
          value={isLoadingStats ? '...' : stats.pendingDeals.toString()}
          icon={<Clock className="h-5 w-5" />}
          description="Awaiting your response"
          isLoading={isLoadingStats}
          actionLabel={stats.pendingDeals > 0 ? "View Deals" : undefined}
          onAction={stats.pendingDeals > 0 ? () => navigate('/deals') : undefined}
        />
      </div>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="plan" disabled={isSubscriptionLoading}>
            {isSubscriptionLoading ? 
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading Plan
              </span> : 
              `Current Plan: ${subscription?.plan || 'Free'}`
            }
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <NotificationsWidget limit={5} />
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start mb-2"
                  onClick={() => navigate('/content/create')}
                >
                  Create New Post
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start mb-2"
                  onClick={() => navigate('/social-connect')}
                >
                  Connect Social Account
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => navigate('/content/caption-generator')}
                >
                  Generate AI Caption
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="payments">
          <PaymentHistoryWidget limit={5} />
        </TabsContent>
        
        <TabsContent value="plan">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
            </CardHeader>
            <CardContent>
              {isSubscriptionLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Current Plan</p>
                      <p className="text-2xl font-bold">{subscription?.plan || 'Free'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-2xl font-bold capitalize">{subscription?.status || 'inactive'}</p>
                    </div>
                  </div>
                  
                  {subscription?.plan !== 'free' && (
                    <div>
                      <p className="text-sm font-medium">Renews On</p>
                      <p className="text-lg">
                        {subscription?.current_period_end
                          ? new Date(subscription.current_period_end).toLocaleDateString()
                          : 'N/A'
                        }
                      </p>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => navigate('/plans')}
                    className="w-full mt-4"
                    variant={subscription?.plan === 'free' ? 'default' : 'outline'}
                  >
                    {subscription?.plan === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
