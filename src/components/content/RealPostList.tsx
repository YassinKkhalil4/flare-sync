
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, BarChart3, Edit, Trash2, Eye } from 'lucide-react';
import { useRealContentPosts } from '@/hooks/useRealContentPosts';
import { format } from 'date-fns';

interface RealPostListProps {
  onEdit?: (postId: string) => void;
  onViewAnalytics?: (postId: string) => void;
}

const RealPostList: React.FC<RealPostListProps> = ({ onEdit, onViewAnalytics }) => {
  const { posts, isLoading, deletePost, isDeleting } = useRealContentPosts();

  if (isLoading) {
    return <div className="p-6">Loading content...</div>;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Published</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Scheduled</Badge>;
      case 'draft':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700">Draft</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDelete = (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePost(postId);
    }
  };

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No content yet. Start by creating your first post!</p>
        </div>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {post.scheduled_for ? 
                      `Scheduled for ${format(new Date(post.scheduled_for), 'PPp')}` :
                      `Created ${format(new Date(post.created_at), 'PPp')}`
                    }
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(post.status)}
                  <Badge variant="secondary">{post.platform}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 line-clamp-2">{post.body}</p>
              
              {post.metrics && (
                <div className="grid grid-cols-4 gap-2 mb-4 text-sm">
                  <div className="text-center p-2 bg-muted rounded">
                    <p className="font-semibold">{(post.metrics as any).likes || 0}</p>
                    <p className="text-xs text-muted-foreground">Likes</p>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <p className="font-semibold">{(post.metrics as any).comments || 0}</p>
                    <p className="text-xs text-muted-foreground">Comments</p>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <p className="font-semibold">{(post.metrics as any).shares || 0}</p>
                    <p className="text-xs text-muted-foreground">Shares</p>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <p className="font-semibold">{(post.metrics as any).reach || 0}</p>
                    <p className="text-xs text-muted-foreground">Reach</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {post.media_urls && post.media_urls.length > 0 && (
                    <Badge variant="secondary">{post.media_urls.length} media</Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {onViewAnalytics && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewAnalytics(post.id)}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(post.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(post.id)}
                    disabled={isDeleting}
                  >
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

export default RealPostList;
