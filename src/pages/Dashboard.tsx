
import { useState, useEffect } from 'react';
import OverviewCard from '@/components/Dashboard/OverviewCard';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { 
  BarChart4, 
  Users, 
  Heart, 
  TrendingUp, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  CalendarDays
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { SocialService, ContentService } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import NotificationsWidget from '@/components/Dashboard/NotificationsWidget';
import PaymentHistoryWidget from '@/components/Dashboard/PaymentHistoryWidget';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from '@/lib/supabase';

function Dashboard() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile);

  // Fetch social profiles
  const { data: socialProfiles } = useQuery({
    queryKey: ['social-profiles'],
    queryFn: async () => await SocialService.getProfiles(),
    enabled: !!user,
  });

  // Fetch content posts
  const { data: contentPosts } = useQuery({
    queryKey: ['content-posts'],
    queryFn: async () => await ContentService.getPosts(),
    enabled: !!user,
  });

  // Calculate total followers across all platforms
  const totalFollowers = socialProfiles?.reduce((sum, profile) => 
    sum + (profile.stats?.followers || 0), 0) || 0;

  // Calculate engagement - for demo purposes we'll use a random percentage
  // In a real app, this would come from analytics data
  const engagementRate = Math.round((Math.random() * 2 + 3) * 10) / 10;
  
  // Mock impressions data - in a real app would come from analytics
  const impressions = Math.floor(totalFollowers * 3.5);
  
  // Mock watch time - in a real app would come from analytics
  const avgWatchTime = "2:45";

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <Sidebar collapsed={sidebarCollapsed} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="mr-4 md:hidden"
              >
                {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
              </Button>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.name || user?.email || 'Creator'}!
              </p>
            </div>
            <Button>
              <CalendarDays className="mr-2 h-4 w-4" /> 
              Schedule Post
            </Button>
          </div>
          
          {/* Overview Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
            <OverviewCard
              title="Total Followers"
              value={totalFollowers >= 1000 ? `${(totalFollowers/1000).toFixed(1)}K` : totalFollowers.toString()}
              change={{ value: 12, positive: true }}
              icon={<Users />}
            />
            <OverviewCard
              title="Engagement Rate"
              value={`${engagementRate}%`}
              change={{ value: 3.1, positive: true }}
              icon={<Heart />}
            />
            <OverviewCard
              title="Impressions"
              value={impressions >= 1000 ? `${Math.floor(impressions/1000)}K` : impressions.toString()}
              change={{ value: 28, positive: true }}
              icon={<BarChart4 />}
            />
            <OverviewCard
              title="Avg. Watch Time"
              value={avgWatchTime}
              change={{ value: 12, positive: false }}
              icon={<Clock />}
            />
          </div>
          
          {/* Main Dashboard Content */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Charts - Taking up 2 columns */}
            <div className="md:col-span-2 grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Growth Trends</CardTitle>
                  <CardDescription>Your audience growth over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                    <div className="text-center space-y-2">
                      <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p>Chart placeholder</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Content Performance</CardTitle>
                  <CardDescription>How your recent posts are performing</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                    <div className="text-center space-y-2">
                      <BarChart4 className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p>Chart placeholder</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar Widgets - Taking up 1 column */}
            <div className="space-y-6">
              <NotificationsWidget />
              <PaymentHistoryWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
