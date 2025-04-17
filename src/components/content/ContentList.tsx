
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ContentService } from '@/services/api';
import { ContentPost } from '@/types/content';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUpRight, Calendar, Edit2, Trash } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

const statusColor = (status: string) => {
  switch(status) {
    case 'draft': return 'bg-gray-500';
    case 'pending_approval': return 'bg-yellow-500';
    case 'scheduled': return 'bg-blue-500';
    case 'published': return 'bg-green-500';
    case 'rejected': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const statusLabel = (status: string) => {
  switch(status) {
    case 'pending_approval': return 'In Review';
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export const ContentList: React.FC = () => {
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [postToDelete, setPostToDelete] = React.useState<ContentPost | null>(null);
  
  const { data: posts = [] as ContentPost[], refetch } = useQuery({
    queryKey: ['content'],
    queryFn: ContentService.getPosts
  });

  const handleDelete = async () => {
    if (!postToDelete) return;
    
    await ContentService.deletePost(postToDelete.id);
    setIsDeleteDialogOpen(false);
    setPostToDelete(null);
    refetch();
  };

  const confirmDelete = (post: ContentPost) => {
    setPostToDelete(post);
    setIsDeleteDialogOpen(true);
  };
  
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
              <TableHead>Scheduled</TableHead>
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
                  <Badge className={`${statusColor(post.status)} text-white`}>
                    {statusLabel(post.status)}
                  </Badge>
                </TableCell>
                <TableCell>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</TableCell>
                <TableCell>
                  {post.scheduled_for ? (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDistanceToNow(new Date(post.scheduled_for), { addSuffix: true })}
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    onClick={() => navigate(`/content/${post.id}`)} 
                    size="sm" 
                    variant="ghost"
                  >
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    onClick={() => navigate(`/content/edit/${post.id}`)} 
                    size="sm" 
                    variant="ghost"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    onClick={() => confirmDelete(post)} 
                    size="sm" 
                    variant="ghost"
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Delete
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
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post
              "{postToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
