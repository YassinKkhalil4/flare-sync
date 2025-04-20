
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ContentService } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface PostDetailProps {
  postId?: string;
  onClose?: () => void;
}

const PostDetail: React.FC<PostDetailProps> = ({ postId, onClose }) => {
  const { id: urlId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const idToUse = postId || urlId;

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['content', idToUse],
    queryFn: () => {
      if (!idToUse) {
        throw new Error("Post ID is required");
      }
      return ContentService.getPostById(idToUse);
    },
    enabled: !!idToUse,
  });

  if (isLoading) {
    return <div>Loading post...</div>;
  }

  if (isError || !post) {
    return <div>Error loading post.</div>;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <p className="text-muted-foreground">
            Created at {format(new Date(post.created_at), 'PPP')}
          </p>
        </div>
        <Button variant="ghost" onClick={() => onClose ? onClose() : navigate('/content')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {onClose ? 'Close' : 'Back to List'}
        </Button>
      </div>

      <Card className="p-6">
        <CardHeader>
          <CardTitle>{post.title}</CardTitle>
          <CardDescription>
            {post.tags && post.tags.length > 0 ? (
              <div className="flex space-x-2">
                {post.tags.map((tag) => (
                  <Badge key={tag.id}>{tag.name}</Badge>
                ))}
              </div>
            ) : (
              <span>No tags</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>{post.body}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostDetail;
