
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Share, Calendar, BarChart3 } from 'lucide-react';
import { useRealContent } from '@/hooks/useRealContent';
import { ContentPost } from '@/types/content';
import { formatDistanceToNow } from 'date-fns';

interface RealPostListProps {
  onEdit?: (post: ContentPost) => void;
  onViewAnalytics?: (post: ContentPost) => void;
}

const RealPostList: React.FC<RealPostListProps> = ({ onEdit, onViewAnalytics }) => {
  const { 
    posts, 
    scheduledPosts, 
    deletePost, 
    publishPost, 
    isDeleting, 
    isPublishing 
  } = useRealContent();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'draft': return 'bg-gray-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const formatMetrics = (metrics: any) => {
    if (!metrics) return 'No metrics';
    const { likes = 0, comments = 0, shares = 0 } = metrics;
    return `${likes} likes, ${comments} comments, ${shares} shares`;
  };

  return (
    <div className="space-y-6">
      {/* Published Posts */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Published Posts ({posts.length})</h3>
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">{post.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(post.status)}>
                    {post.status}
                  </Badge>
                  <Badge variant="outline">{post.platform}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {post.body}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    <p>Published: {post.published_at ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true }) : 'Not published'}</p>
                    <p>{formatMetrics(post.metrics)}</p>
                  </div>
                  <div className="flex space-x-2">
                    {onViewAnalytics && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewAnalytics(post)}
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(post)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deletePost(post.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Scheduled Posts */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Scheduled Posts ({scheduledPosts.length})</h3>
        <div className="grid gap-4">
          {scheduledPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">
                  {post.metadata?.title || 'Scheduled Post'}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(post.status)}>
                    {post.status}
                  </Badge>
                  <Badge variant="outline">{post.platform}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {post.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    <p className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Scheduled for: {new Date(post.scheduled_for).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => publishPost(post.id)}
                      disabled={isPublishing}
                    >
                      <Share className="h-4 w-4 mr-1" />
                      Publish Now
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deletePost(post.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RealPostList;
