
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EngagementChart } from '@/components/analytics/EngagementChart';
import { PlatformComparison } from '@/components/analytics/PlatformComparison';
import { ContentInsights } from '@/components/analytics/ContentInsights';
import { useAnalytics } from '@/hooks/useAnalytics';
import { BarChart3, TrendingUp, Users, RefreshCw } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { analyticsData, isLoading, error, refreshAnalytics } = useAnalytics();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">Error loading analytics: {error}</p>
            <Button onClick={refreshAnalytics}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No analytics data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your social media performance and insights
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refreshAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="engagement" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="platforms" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Platforms
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Content Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="engagement">
          <EngagementChart 
            data={analyticsData.engagement} 
            timeframe={timeframe}
          />
        </TabsContent>

        <TabsContent value="platforms">
          <PlatformComparison data={analyticsData.platforms} />
        </TabsContent>

        <TabsContent value="content">
          <ContentInsights 
            insights={analyticsData.insights}
            topHashtags={analyticsData.topHashtags}
            bestTimes={analyticsData.bestTimes}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
