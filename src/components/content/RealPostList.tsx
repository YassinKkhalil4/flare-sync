
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, BarChart3, Edit, Trash2, Eye } from 'lucide-react';
import { useRealContent } from '@/hooks/useRealContent';
import { ContentPost } from '@/types/content';
import { format } from 'date-fns';

interface RealPostListProps {
  onEdit?: (post: ContentPost) => void;
  onViewAnalytics?: (post: ContentPost) => void;
}

const RealPostList: React.FC<RealPostListProps> = ({ onEdit, onViewAnalytics }) => {
  const { posts, scheduledPosts, isLoadingPosts, isLoadingScheduled, publishPost } = useRealContent();

  if (isLoadingPosts || isLoadingScheduled) {
    return <div className="p-6">Loading content...</div>;
  }

  const allContent = [
    ...posts.map(post => ({ ...post, type: 'published' as const })),
    ...scheduledPosts.map(post => ({ 
      ...post, 
      type: 'scheduled' as const,
      title: post.metadata?.title || 'Scheduled Post',
      body: post.content || ''
    }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const getStatusBadge = (post: any) => {
    if (post.type === 'scheduled') {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700">Scheduled</Badge>;
    }
    
    switch (post.status) {
      case 'published':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Published</Badge>;
      case 'draft':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700">Draft</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Failed</Badge>;
      default:
        return <Badge variant="outline">{post.status}</Badge>;
    }
  };

  const handlePublish = (postId: string) => {
    publishPost(postId);
  };

  return (
    <div className="space-y-4">
      {allContent.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No content yet. Start by creating your first post!</p>
        </div>
      ) : (
        allContent.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {post.type === 'scheduled' ? 
                      `Scheduled for ${format(new Date(post.scheduled_for), 'PPp')}` :
                      `Created ${format(new Date(post.created_at), 'PPp')}`
                    }
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(post)}
                  <Badge variant="secondary">{post.platform}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 line-clamp-2">{post.body}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {post.media_urls && post.media_urls.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {post.media_urls.length} media file{post.media_urls.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {post.type === 'scheduled' && (
                    <Button
                      size="sm"
                      onClick={() => handlePublish(post.id)}
                      className="text-xs"
                    >
                      Publish Now
                    </Button>
                  )}
                  
                  {onEdit && post.type !== 'scheduled' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(post as ContentPost)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {onViewAnalytics && post.type !== 'scheduled' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewAnalytics(post as ContentPost)}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
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
