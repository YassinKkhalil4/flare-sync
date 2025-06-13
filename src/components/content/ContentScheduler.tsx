
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/social/LoadingSpinner';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Updated ScheduledPost interface to match database schema
interface ScheduledPost {
  id: string;
  user_id: string;
  content: string;
  media_urls: string[] | null;
  platform: string;
  scheduled_for: string;
  status: string;
  error_message: string | null;
  post_id: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

// Custom hook for fetching scheduled posts
const useScheduler = (userId: string) => {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchScheduledPosts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', userId)
        .order('scheduled_for', { ascending: true });

      if (error) {
        throw error;
      }

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
    if (userId) {
      fetchScheduledPosts();
    }
  }, [userId]);

  return {
    scheduledPosts,
    isLoading,
    refreshPosts: fetchScheduledPosts,
  };
};

const ContentScheduler: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { scheduledPosts, isLoading } = useScheduler(user?.id || '');

  // Function to get posts for the selected date
  const getPostsForSelectedDate = () => {
    if (!selectedDate) return [];
    
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    return scheduledPosts.filter(post => {
      const postDate = new Date(post.scheduled_for);
      return format(postDate, 'yyyy-MM-dd') === dateString;
    });
  };

  // Function to get dates with posts for highlighting in calendar
  const getDatesWithPosts = () => {
    const dates = scheduledPosts.map(post => {
      const date = new Date(post.scheduled_for);
      return format(date, 'yyyy-MM-dd');
    });
    return [...new Set(dates)];
  };

  const postsForSelectedDate = getPostsForSelectedDate();
  const datesWithPosts = getDatesWithPosts();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              booked: (date) => datesWithPosts.includes(format(date, 'yyyy-MM-dd')),
            }}
            modifiersStyles={{
              booked: { fontWeight: 'bold', backgroundColor: 'rgba(var(--primary), 0.1)' },
            }}
          />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedDate ? (
              `Posts for ${format(selectedDate, 'MMMM d, yyyy')}`
            ) : (
              'Select a date to view posts'
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingSpinner />
          ) : postsForSelectedDate.length > 0 ? (
            <div className="space-y-4">
              {postsForSelectedDate.map((post) => (
                <div key={post.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">
                        {post.metadata?.title || post.content?.substring(0, 50)}
                        {post.content && post.content.length > 50 ? '...' : ''}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(post.scheduled_for), 'h:mm a')}
                      </p>
                    </div>
                    <Badge variant={
                      post.status === 'published' ? 'default' :
                      post.status === 'failed' ? 'destructive' :
                      'outline'
                    }>
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                      {post.platform}
                    </div>
                    {post.media_urls && post.media_urls.length > 0 && (
                      <div className="bg-muted text-xs px-2 py-1 rounded">
                        {post.media_urls.length} media
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No posts scheduled for this date
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentScheduler;
