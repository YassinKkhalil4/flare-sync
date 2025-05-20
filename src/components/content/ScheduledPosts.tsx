
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { scheduledPostService } from '@/services/scheduledPostService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ScheduledPost } from '@/types/database';

export const ScheduledPosts = () => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['scheduledPosts'],
    queryFn: () => scheduledPostService.getScheduledPosts()
  });

  if (isLoading) {
    return <div>Loading scheduled posts...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Upcoming Posts</h2>
      {posts?.length === 0 ? (
        <p className="text-muted-foreground">No scheduled posts yet.</p>
      ) : (
        posts?.map((post: ScheduledPost) => (
          <Card key={post.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)} Post
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
