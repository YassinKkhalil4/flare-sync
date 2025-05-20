
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Users, ArrowRight, Instagram, Clock } from 'lucide-react';
import OverviewCard from '@/components/Dashboard/OverviewCard';
import NotificationsWidget from '@/components/Dashboard/NotificationsWidget';
import PaymentHistoryWidget from '@/components/Dashboard/PaymentHistoryWidget';
import { userService } from '@/services/userService';

interface UserStats {
  followers: number;
  engagement: number;
  posts: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'creator' | 'brand' | null>(null);
  const [stats, setStats] = useState<UserStats>({
    followers: 0,
    engagement: 0,
    posts: 0
  });

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        
        // Get user role
        const role = await userService.getUserRole(user.id);
        setUserRole(role);
        
        // Get user stats from social profiles
        if (role === 'creator') {
          const { data, error } = await supabase
            .from('social_profiles')
            .select('followers, posts, engagement')
            .eq('user_id', user.id)
            .eq('connected', true);
            
          if (!error && data && data.length > 0) {
            // Aggregate stats from all connected profiles
            const aggregatedStats = data.reduce((acc, profile) => {
              return {
                followers: acc.followers + (profile.followers || 0),
                posts: acc.posts + (profile.posts || 0),
                engagement: Math.max(acc.engagement, profile.engagement || 0)
              };
            }, { followers: 0, posts: 0, engagement: 0 });
            
            setStats(aggregatedStats);
          }
        }
        
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarded')
          .eq('id', user.id)
          .single();
          
        if (profile && !profile.onboarded) {
          // Redirect to onboarding flow
          // We'll implement this later
        }
        
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Loading Dashboard</h2>
          <p className="text-muted-foreground">Please wait while we load your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {userRole === 'creator' ? (
          <>
            <OverviewCard
              title="Total Followers"
              value={stats.followers.toLocaleString()}
              description="Across all platforms"
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <OverviewCard
              title="Engagement Rate"
              value={`${stats.engagement.toFixed(2)}%`}
              description="Average across platforms"
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <OverviewCard
              title="Total Posts"
              value={stats.posts.toLocaleString()}
              description="Published content"
              icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
            />
            <OverviewCard
              title="Scheduled Posts"
              value="0"
              description="Pending publication"
              icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            />
          </>
        ) : (
          <>
            <OverviewCard
              title="Active Campaigns"
              value="0"
              description="Currently running"
              icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
            />
            <OverviewCard
              title="Creator Partnerships"
              value="0"
              description="Active collaborations"
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <OverviewCard
              title="Pending Deals"
              value="0"
              description="Awaiting response"
              icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            />
            <OverviewCard
              title="Total Reach"
              value="0"
              description="Potential audience"
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
          </>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Tasks you might want to do next</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {userRole === 'creator' ? (
                <>
                  <Button 
                    variant="outline" 
                    className="flex justify-between items-center"
                    onClick={() => navigate('/social-connect')}
                  >
                    <div className="flex items-center">
                      <Instagram className="mr-2 h-4 w-4" />
                      Connect Social Accounts
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex justify-between items-center"
                    onClick={() => navigate('/profile')}
                  >
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Complete Your Profile
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="flex justify-between items-center"
                    onClick={() => navigate('/deals')}
                  >
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Browse Creators
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex justify-between items-center"
                    onClick={() => navigate('/profile')}
                  >
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Complete Brand Profile
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <PaymentHistoryWidget limit={5} />
          </div>
        </div>
        
        <div className="space-y-6">
          <NotificationsWidget limit={5} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
