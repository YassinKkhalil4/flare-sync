
import React, { useState } from 'react';
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

function Dashboard() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile);

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
                Welcome back, {user?.email || 'Creator'}!
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
              value="24.8K"
              change="+12%"
              trend="up"
              icon={<Users />}
            />
            <OverviewCard
              title="Engagement Rate"
              value="5.2%"
              change="+3.1%"
              trend="up"
              icon={<Heart />}
            />
            <OverviewCard
              title="Impressions"
              value="142K"
              change="+28%"
              trend="up"
              icon={<BarChart4 />}
            />
            <OverviewCard
              title="Avg. Watch Time"
              value="2:45"
              change="-0:12"
              trend="down"
              icon={<Clock />}
            />
          </div>
          
          {/* Charts and other dashboard content would go here */}
          <div className="grid gap-6 md:grid-cols-2">
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
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
