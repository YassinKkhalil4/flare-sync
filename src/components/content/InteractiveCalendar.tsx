
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ScheduledPost } from '@/types/database';
import { LoadingSpinner } from '@/components/social/LoadingSpinner';
import { format, isSameDay, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Plus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import PostScheduleForm from '@/components/content/PostScheduleForm';

const InteractiveCalendar: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedPost, setDraggedPost] = useState<ScheduledPost | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  // Fetch scheduled posts
  const fetchScheduledPosts = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      setScheduledPosts(data || []);
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load scheduled posts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduledPosts();
  }, [user]);

  // Get posts for a specific date
  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => 
      isSameDay(parseISO(post.scheduled_for), date)
    );
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, post: ScheduledPost) => {
    setDraggedPost(post);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drop on calendar date
  const handleDateDrop = async (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    
    if (!draggedPost) return;

    try {
      // Update the post's scheduled date
      const newScheduledTime = format(targetDate, 'yyyy-MM-dd') + 'T' + format(parseISO(draggedPost.scheduled_for), 'HH:mm:ss');
      
      const { error } = await supabase
        .from('scheduled_posts')
        .update({ scheduled_for: newScheduledTime })
        .eq('id', draggedPost.id);

      if (error) throw error;

      toast({
        title: 'Post Rescheduled',
        description: `Post moved to ${format(targetDate, 'MMMM d, yyyy')}`,
      });

      // Refresh posts
      fetchScheduledPosts();
    } catch (error) {
      console.error('Error rescheduling post:', error);
      toast({
        title: 'Error',
        description: 'Failed to reschedule post',
        variant: 'destructive',
      });
    } finally {
      setDraggedPost(null);
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const postsForSelectedDate = getPostsForDate(selectedDate);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Content Calendar
          </CardTitle>
          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Post</DialogTitle>
              </DialogHeader>
              <PostScheduleForm 
                selectedDate={selectedDate}
                onSuccess={() => {
                  setIsScheduleDialogOpen(false);
                  fetchScheduledPosts();
                }}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border w-full"
              modifiers={{
                booked: (date) => getPostsForDate(date).length > 0,
              }}
              modifiersStyles={{
                booked: { 
                  fontWeight: 'bold', 
                  backgroundColor: 'rgba(var(--primary), 0.1)',
                  color: 'rgb(var(--primary))'
                },
              }}
            />
            
            {/* Calendar Grid with Drop Zones */}
            <div className="grid grid-cols-7 gap-1 text-sm">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts for Selected Date */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {format(selectedDate, 'MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {postsForSelectedDate.length > 0 ? (
            <div className="space-y-3">
              {postsForSelectedDate.map((post) => (
                <div
                  key={post.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, post)}
                  className="border rounded-lg p-3 cursor-move hover:shadow-md transition-shadow bg-card"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {post.content?.substring(0, 40)}
                        {post.content && post.content.length > 40 ? '...' : ''}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(post.scheduled_for), 'h:mm a')}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        post.status === 'published' ? 'default' :
                        post.status === 'failed' ? 'destructive' :
                        'secondary'
                      }
                      className="ml-2 text-xs"
                    >
                      {post.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {post.platform}
                    </Badge>
                    {post.media_urls && post.media_urls.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {post.media_urls.length} media
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No posts scheduled for this date</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setIsScheduleDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule Post
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveCalendar;
