
import React from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import ContentScheduler from '@/components/content/ContentScheduler';
import { ScheduledPosts } from '@/components/content/ScheduledPosts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Calendar, Clock, LayoutGrid } from 'lucide-react';

const ContentCalendarPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Content Calendar</h1>
        </div>
        
        <Tabs defaultValue="calendar">
          <TabsList className="mb-6">
            <TabsTrigger value="calendar">
              <Calendar className="h-4 w-4 mr-2" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              <Clock className="h-4 w-4 mr-2" />
              Upcoming Posts
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="grid">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Grid View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar">
            <ContentScheduler />
          </TabsContent>
          
          <TabsContent value="upcoming">
            <ScheduledPosts />
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Content Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-10 text-center">
                  <p className="text-muted-foreground">Coming soon: Content performance analytics dashboard</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="grid">
            <Card>
              <CardHeader>
                <CardTitle>Content Grid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-10 text-center">
                  <p className="text-muted-foreground">Coming soon: Visual content grid view</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ContentCalendarPage;
