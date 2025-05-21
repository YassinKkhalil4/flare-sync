
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { scheduledPostService } from '@/services/scheduledPostService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ScheduledPost } from '@/types/content';
import { useAuth } from '@/context/AuthContext';

export const ScheduledPosts = () => {
  const { user } = useAuth();
  const userId = user?.id || '';
  
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['scheduledPosts', userId],
    queryFn: () => scheduledPostService.getScheduledPosts(userId),
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading scheduled posts...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>Error loading scheduled posts.</p>
        <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Upcoming Posts</h2>
      {!posts || posts.length === 0 ? (
        <p className="text-muted-foreground">No scheduled posts yet.</p>
      ) : (
        posts.map((post: ScheduledPost) => (
          <Card key={post.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {post.platform && post.platform.charAt(0).toUpperCase() + post.platform.slice(1)} Post
              </CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                {post.scheduled_for ? format(new Date(post.scheduled_for), 'PPp') : 'Not scheduled'}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{post.content || 'No content'}</p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
