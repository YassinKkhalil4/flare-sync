
import React from 'react';
import { useState } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { SchedulerForm } from '@/components/content/SchedulerForm';
import { SchedulingAnalytics } from '@/components/content/SchedulingAnalytics';
import { useScheduler } from '@/hooks/useScheduler';

export default function SmartPostSchedulerPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { 
    analyzeSchedule, 
    schedulingData, 
    scheduledPosts, 
    isLoadingScheduledPosts, 
    publishScheduledPost,
  } = useScheduler();

  const handleAnalyzeSchedule = async (values: any) => {
    setIsAnalyzing(true);
    try {
      await analyzeSchedule(values);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Smart Post Scheduler</h1>
          <p className="text-muted-foreground">
            Plan and schedule your content for optimal engagement
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Schedule New Post</CardTitle>
              </CardHeader>
              <CardContent>
                <SchedulerForm onSubmit={handleAnalyzeSchedule} isLoading={isAnalyzing} />
              </CardContent>
            </Card>
          </div>

          {/* Scheduled Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduled Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingScheduledPosts ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : scheduledPosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No scheduled posts yet</p>
                  <p className="text-sm mt-2">Create your first scheduled post above</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scheduledPosts.slice(0, 5).map((post) => (
                    <div key={post.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium line-clamp-2">{post.body || post.title}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(post.created_at)}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {post.platform || 'Instagram'}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => publishScheduledPost(post.id)}
                        >
                          Publish Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Scheduling Analytics */}
        {schedulingData && (
          <SchedulingAnalytics schedulingData={schedulingData} />
        )}
      </div>
    </MainLayout>
  );
}
