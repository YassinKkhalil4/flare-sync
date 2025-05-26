
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
import { Plus, Calendar as CalendarIcon, Clock, Image as ImageIcon, Video, Users } from 'lucide-react';
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

  // Group posts by content and time (for multi-platform posts)
  const groupPostsByContent = (posts: ScheduledPost[]) => {
    const groups: { [key: string]: ScheduledPost[] } = {};
    
    posts.forEach(post => {
      const key = `${post.content}_${format(parseISO(post.scheduled_for), 'HH:mm')}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(post);
    });
    
    return Object.values(groups);
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
  const groupedPosts = groupPostsByContent(postsForSelectedDate);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return '📷';
      case 'twitter': return '🐦';
      case 'tiktok': return '🎵';
      case 'youtube': return '📺';
      case 'facebook': return '👥';
      default: return '📱';
    }
  };

  const isVideoFile = (url: string) => {
    return url && (url.includes('.mp4') || url.includes('.mov') || url.includes('.avi') || url.includes('video'));
  };

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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
          {groupedPosts.length > 0 ? (
            <div className="space-y-4">
              {groupedPosts.map((postGroup, groupIndex) => {
                const firstPost = postGroup[0];
                const hasMedia = firstPost.media_urls && firstPost.media_urls.length > 0;
                const firstMediaUrl = hasMedia ? firstPost.media_urls![0] : null;
                
                return (
                  <div
                    key={`group-${groupIndex}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, firstPost)}
                    className="border rounded-lg p-4 cursor-move hover:shadow-md transition-shadow bg-card space-y-3"
                  >
                    {/* Media Preview */}
                    {firstMediaUrl && (
                      <div className="relative">
                        {isVideoFile(firstMediaUrl) ? (
                          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                            <video
                              src={firstMediaUrl}
                              className="w-full h-full object-cover"
                              preload="metadata"
                            />
                            <div className="absolute top-2 left-2 bg-black/50 rounded px-2 py-1">
                              <Video className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="relative rounded-lg overflow-hidden aspect-video">
                            <img
                              src={firstMediaUrl}
                              alt="Post media"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 bg-black/50 rounded px-2 py-1">
                              <ImageIcon className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        )}
                        {firstPost.media_urls && firstPost.media_urls.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/50 rounded px-2 py-1">
                            <span className="text-white text-xs">+{firstPost.media_urls.length - 1}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">
                            {firstPost.content?.substring(0, 100)}
                            {firstPost.content && firstPost.content.length > 100 ? '...' : ''}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(parseISO(firstPost.scheduled_for), 'h:mm a')}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            firstPost.status === 'published' ? 'default' :
                            firstPost.status === 'failed' ? 'destructive' :
                            'secondary'
                          }
                          className="ml-2 text-xs"
                        >
                          {firstPost.status}
                        </Badge>
                      </div>
                      
                      {/* Platforms */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {postGroup.length > 1 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{postGroup.length} platforms</span>
                          </div>
                        )}
                        {postGroup.map((post) => (
                          <Badge key={post.id} variant="outline" className="text-xs">
                            {getPlatformIcon(post.platform)} {post.platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
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
