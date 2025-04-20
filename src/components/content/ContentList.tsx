
import React from 'react';
import { ContentPost } from '@/types/content';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface ContentListProps {
  posts: ContentPost[];
  isLoading: boolean;
}

export const ContentList: React.FC<ContentListProps> = ({ posts, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return <div>Loading posts...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Content Posts</h2>
        <Button onClick={() => navigate('/content/create')}>
          Create New Post
        </Button>
      </div>
      
      {posts.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map(post => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {post.platform}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate(`/content/${post.id}`)}
                  >
                    View
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate(`/content/edit/${post.id}`)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-10 border rounded-lg">
          <p className="text-muted-foreground mb-4">No content posts found</p>
          <Button onClick={() => navigate('/content/create')}>Create Your First Post</Button>
        </div>
      )}
    </div>
  );
};
