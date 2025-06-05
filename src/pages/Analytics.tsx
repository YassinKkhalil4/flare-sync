
import React, { useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import AnalyticsOverview from '@/components/analytics/AnalyticsOverview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Track your content performance across all platforms
            </p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="posts">Post Performance</TabsTrigger>
            <TabsTrigger value="platforms">Platform Comparison</TabsTrigger>
            <TabsTrigger value="audience">Audience Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AnalyticsOverview timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <CardTitle>Individual Post Performance</CardTitle>
                <CardDescription>
                  Detailed analytics for each of your posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Post performance analytics will be displayed here once you have published content.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="platforms">
            <Card>
              <CardHeader>
                <CardTitle>Platform Comparison</CardTitle>
                <CardDescription>
                  Compare performance across different social media platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Platform comparison charts will be displayed here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audience">
            <Card>
              <CardHeader>
                <CardTitle>Audience Insights</CardTitle>
                <CardDescription>
                  Learn more about your audience demographics and behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Audience insights will be displayed here once you connect your social accounts.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Analytics;
