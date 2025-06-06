
import React from 'react';
import { useRealContent } from '@/hooks/useRealContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Loader2, Play, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export const ScheduledPosts = () => {
  const { scheduledPosts, isLoadingScheduled, publishPost, isPublishingPost } = useRealContent();
  
  if (isLoadingScheduled) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading scheduled posts...</span>
      </div>
    );
  }

  const handlePublishNow = (postId: string) => {
    publishPost(postId);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Upcoming Posts ({scheduledPosts.length})</h2>
      {scheduledPosts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No scheduled posts</h3>
            <p className="text-muted-foreground">
              Use the content scheduler to plan your posts in advance
            </p>
          </CardContent>
        </Card>
      ) : (
        scheduledPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {post.metadata?.title || `${post.platform.charAt(0).toUpperCase() + post.platform.slice(1)} Post`}
              </CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                {format(new Date(post.scheduled_for), 'PPp')}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4 line-clamp-2">{post.content || 'No content'}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {post.platform}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    {post.status}
                  </span>
                  {post.media_urls && post.media_urls.length > 0 && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {post.media_urls.length} media
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePublishNow(post.id)}
                    disabled={isPublishingPost}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Publish Now
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
