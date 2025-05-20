import React, { useState } from 'react';
import { useScheduler } from '@/hooks/useScheduler';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, RefreshCw, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { scheduledPostService } from '@/services/scheduledPostService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ContentPost, ScheduledPost } from '@/types/content';

const SmartPostSchedulerPage: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('instagram');
  
  const {
    analyzeSchedule,
    isAnalyzing,
    schedulingData,
    scheduledPosts,
    isLoadingScheduledPosts,
    refreshScheduledPosts
  } = useScheduler();
  
  const handleAnalyze = () => {
    analyzeSchedule({ platform: selectedPlatform });
  };

  const handleRefresh = () => {
    refreshScheduledPosts();
  };
  
  const renderHeatmap = () => {
    if (!schedulingData?.heatmap) return null;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    const getColorIntensity = (value: number) => {
      // Generate color based on value (0-1)
      const maxIntensity = 0.9; // Maximum intensity, adjust if needed
      const normalizedValue = value / maxIntensity;
      
      if (selectedPlatform === 'instagram') {
        // Purple gradient for Instagram
        return `rgba(131, 58, 180, ${normalizedValue})`;
      } else if (selectedPlatform === 'tiktok') {
        // Red gradient for TikTok
        return `rgba(225, 48, 108, ${normalizedValue})`;
      } else {
        // Blue gradient for others
        return `rgba(64, 93, 230, ${normalizedValue})`;
      }
    };

    return (
      <div className="overflow-x-auto pt-4">
        <div className="min-w-[800px]">
          <div className="flex mb-1">
            <div className="w-20"></div>
            {hours.map(hour => (
              <div key={`header-${hour}`} className="w-8 text-center text-xs text-muted-foreground">
                {hour}
              </div>
            ))}
          </div>
          
          {days.map((day, dayIndex) => (
            <div key={`row-${day}`} className="flex mb-1">
              <div className="w-20 pr-2 text-sm font-medium">{day}</div>
              {hours.map(hour => {
                const cellData = schedulingData.heatmap.find(
                  item => item.day === dayIndex && item.hour === hour
                );
                const value = cellData?.value || 0;
                
                return (
                  <TooltipProvider key={`cell-${dayIndex}-${hour}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="w-8 h-6 rounded-sm cursor-pointer"
                          style={{ backgroundColor: getColorIntensity(value) }}
                        ></div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs">
                          {day} at {hour}:00 - Engagement: {Math.round(value * 100)}%
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          ))}
          
          <div className="flex items-center mt-4 justify-end">
            <div className="flex items-center">
              <span className="text-xs text-muted-foreground mr-2">Low</span>
              <div className="flex h-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={`legend-${i}`}
                    className="w-5 h-2"
                    style={{ 
                      backgroundColor: getColorIntensity(i * 0.25) 
                    }}
                  ></div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground ml-2">High</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Smart Post Scheduler</h1>
      
      <Tabs defaultValue="analyze" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analyze">Analyze & Schedule</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Posts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analyze">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Analysis</CardTitle>
                <CardDescription>
                  Analyze optimal posting times based on your audience engagement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Platform</label>
                  <Select 
                    value={selectedPlatform} 
                    onValueChange={setSelectedPlatform}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleAnalyze} 
                  className="w-full"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Optimal Times'}
                </Button>
                
                <Separator />
                
                {schedulingData ? (
                  <>
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Optimal Posting Times for {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}
                      </h3>
                      
                      <div className="space-y-4">
                        {schedulingData.optimalTimes.map((dayData, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="font-medium">{dayData.day}</span>
                            <div className="flex gap-2">
                              {dayData.times.map((time, timeIndex) => (
                                <Badge key={timeIndex} variant="outline">
                                  <Clock className="h-3 w-3 mr-1" />{time}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Weekly Engagement Heatmap</h3>
                      {renderHeatmap()}
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Recommendations</h3>
                      <ul className="space-y-2">
                        {schedulingData.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                            </div>
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="rounded-full bg-primary/10 p-4 inline-block mb-3">
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No Analysis Yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Run an analysis to see optimal posting times
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Schedule Posts</CardTitle>
                <CardDescription>
                  Schedule your content based on optimal posting times
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <div className="mx-auto bg-primary/10 p-6 rounded-full w-fit mb-4">
                    <Calendar className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Schedule Your Content</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                    Create content in the Content Manager and use the optimal times from 
                    your analysis to schedule posts for maximum engagement.
                  </p>
                  <Button onClick={() => window.location.href = '/content/create'}>
                    Create New Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="scheduled">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Scheduled Posts</CardTitle>
                <CardDescription>
                  Manage and track your scheduled content
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingScheduledPosts ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : scheduledPosts && scheduledPosts.length > 0 ? (
                <div className="space-y-4">
                  {scheduledPosts.map((post) => (
                    <Card key={post.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge className="mb-2" variant={post.platform === 'instagram' ? 'default' : post.platform === 'tiktok' ? 'destructive' : 'secondary'}>
                              {post.platform}
                            </Badge>
                            <h3 className="font-medium">{post.content ? post.content.substring(0, 30) + (post.content.length > 30 ? '...' : '') : 'No title'}</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {post.content || "No description"}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-sm font-medium">
                              <Calendar className="h-4 w-4 mr-1" />
                              {post.scheduled_for ? new Date(post.scheduled_for).toLocaleDateString() : 'Not scheduled'}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <Clock className="h-4 w-4 mr-1" />
                              {post.scheduled_for ? new Date(post.scheduled_for).toLocaleTimeString() : ''}
                            </div>
                            <Badge className="mt-2" variant={
                              post.status === 'published' ? 'default' :
                              post.status === 'scheduled' ? 'default' :
                              'outline'
                            }>
                              {post.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No Scheduled Posts</h3>
                  <p className="text-muted-foreground mb-4">
                    You don't have any posts scheduled yet
                  </p>
                  <Button onClick={() => window.location.href = '/content/create'}>
                    Create New Post
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

export default SmartPostSchedulerPage;
