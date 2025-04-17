
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ContentService } from '@/services/api';
import { ContentPost } from '@/types/content';
import PostForm from '@/components/content/PostForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const ContentEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: post, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: () => id ? ContentService.getPostById(id) : null,
    enabled: !!id
  });
  
  const handleSubmit = async (data: Partial<ContentPost>, tagIds: string[]) => {
    try {
      if (!id) return;
      
      const result = await ContentService.updatePost(id, data, tagIds);
      
      if (result) {
        toast({
          title: 'Success',
          description: 'Post updated successfully'
        });
        navigate('/content');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to update post',
        variant: 'destructive'
      });
    }
  };
  
  if (isLoading || !post) {
    return <div>Loading post...</div>;
  }
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <Button 
          variant="ghost" 
          className="flex items-center" 
          onClick={() => navigate('/content')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
      </div>
      
      <Card className="p-6">
        <PostForm 
          initialValues={post} 
          onSubmit={handleSubmit} 
          isLoading={false}
          tags={[]} 
        />
      </Card>
    </div>
  );
};

export default ContentEditPage;
