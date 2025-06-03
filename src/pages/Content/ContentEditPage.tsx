
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('content_posts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
  
  const handleSubmit = async (data: Partial<ContentPost>) => {
    try {
      if (!id) return;
      
      const { error } = await supabase
        .from('content_posts')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Post updated successfully'
      });
      navigate('/content');
    } catch (error) {
      console.error('Error updating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to update post',
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    navigate('/content');
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
          onCancel={handleCancel}
          isLoading={isLoading}
          tags={post.tags || []} 
        />
      </Card>
    </div>
  );
};

export default ContentEditPage;
