
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ContentService } from '@/services/api';
import { ContentPost } from '@/types/content';
import PostForm from '@/components/content/PostForm';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export const ContentCreatePage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleSubmit = async (data: Partial<ContentPost>, tagIds: string[]) => {
    try {
      const result = await ContentService.createPost(data as Omit<ContentPost, 'id' | 'created_at' | 'updated_at'>, tagIds);
      
      if (result) {
        toast({
          title: 'Success',
          description: 'Post created successfully'
        });
        navigate('/content');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Create New Post</h1>
      
      <Card className="p-6">
        <PostForm onSubmit={handleSubmit} />
      </Card>
    </div>
  );
};

export default ContentCreatePage;
