
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import { format, addDays, isToday, isTomorrow, isAfter, isBefore } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { scheduledPostService } from '@/services/scheduledPostService';
import { ScheduledPost } from '@/types/content';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const ContentScheduler = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedView, setSelectedView] = useState<'calendar' | 'list'>('calendar');
  const [selectedTime, setSelectedTime] = useState<string>('12:00');
  
  const { data: scheduledPosts, isLoading, error } = useQuery({
    queryKey: ['scheduledPosts'],
    queryFn: () => scheduledPostService.getScheduledPosts()
  });
  
  // Filter posts for the selected date
  const postsForSelectedDate = scheduledPosts?.filter((post: ScheduledPost) => {
    const postDate = new Date(post.scheduled_for);
    return (
      postDate.getDate() === selectedDate.getDate() &&
      postDate.getMonth() === selectedDate.getMonth() &&
      postDate.getFullYear() === selectedDate.getFullYear()
    );
  });
  
  // Group posts by time slot for the selected date
  const groupedByTime: Record<string, ScheduledPost[]> = {};
  
  postsForSelectedDate?.forEach((post: ScheduledPost) => {
    const postDate = new Date(post.scheduled_for);
    const timeKey = format(postDate, 'HH:mm');
    if (!groupedByTime[timeKey]) {
      groupedByTime[timeKey] = [];
    }
    groupedByTime[timeKey].push(post);
  });
  
  // Determine if a day has posts (for calendar day rendering)
  const dayHasPosts = (day: Date) => {
    return scheduledPosts?.some((post: ScheduledPost) => {
      const postDate = new Date(post.scheduled_for);
      return (
        postDate.getDate() === day.getDate() &&
        postDate.getMonth() === day.getMonth() &&
        postDate.getFullYear() === day.getFullYear()
      );
    });
  };
  
  // Generate time slots for the day view
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });
  
  // Get posts for upcoming days (next 7 days)
  const upcomingPosts = scheduledPosts?.filter((post: ScheduledPost) => {
    const postDate = new Date(post.scheduled_for);
    const oneWeekFromNow = addDays(new Date(), 7);
    return (
      isAfter(postDate, new Date()) && 
      isBefore(postDate, oneWeekFromNow)
    );
  }).sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime());

  return (
    <div className="content-scheduler space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Content Schedule</h2>
        <div className="space-x-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/content/create">
              <Plus className="h-4 w-4 mr-1" /> New Post
            </a>
          </Button>
        </div>
      </div>
      
      <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as 'calendar' | 'list')}>
        <TabsList className="mb-4">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">Upcoming Posts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                  modifiers={{
                    booked: (date) => dayHasPosts(date) || false
                  }}
                  modifiersStyles={{
                    booked: { fontWeight: 'bold', backgroundColor: 'rgba(59, 130, 246, 0.1)' }
                  }}
                />
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {isToday(selectedDate) 
                    ? "Today's Schedule" 
                    : isTomorrow(selectedDate)
                      ? "Tomorrow's Schedule"
                      : `Schedule for ${format(selectedDate, 'MMMM d, yyyy')}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    Loading schedule...
                  </div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      Failed to load scheduled posts.
                    </AlertDescription>
                  </Alert>
                ) : postsForSelectedDate && postsForSelectedDate.length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(groupedByTime).map(([time, posts]) => (
                      <div key={time} className="border-l-4 border-primary pl-4 py-2">
                        <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center">
                          <Clock className="mr-1 h-4 w-4" /> {time}
                        </div>
                        <div className="space-y-2">
                          {posts.map((post) => (
                            <Card key={post.id} className="p-3">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">
                                    {post.platform && post.platform.charAt(0).toUpperCase() + post.platform.slice(1)} Post
                                  </div>
                                  <div className="text-sm text-muted-foreground line-clamp-1">
                                    {post.content || 'No content'}
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={`/content/${post.id}`}>View</a>
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">No posts scheduled for this date</p>
                    <Button className="mt-4" asChild>
                      <a href="/content/create">Schedule a Post</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Scheduled Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  Loading upcoming posts...
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to load scheduled posts.
                  </AlertDescription>
                </Alert>
              ) : upcomingPosts && upcomingPosts.length > 0 ? (
                <div className="space-y-4">
                  {upcomingPosts.map((post: ScheduledPost) => (
                    <Card key={post.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">
                              {post.platform && post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                            </div>
                            <div className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                              {post.status}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                            <CalendarIcon className="h-3 w-3" />
                            <span>
                              {format(new Date(post.scheduled_for), 'MMM d, yyyy')} at {format(new Date(post.scheduled_for), 'h:mm a')}
                            </span>
                          </div>
                          <div className="mt-2 text-sm line-clamp-2">
                            {post.content || 'No content'}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/content/${post.id}`}>View</a>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No upcoming posts scheduled</p>
                  <Button className="mt-4" asChild>
                    <a href="/content/create">Schedule a Post</a>
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

export default ContentScheduler;
