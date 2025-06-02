
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ContentPost {
  id: string;
  title: string;
  body: string;
  platform: string;
  status: string;
  scheduled_for?: string;
  published_at?: string;
  media_urls?: string[];
  metrics?: any;
  created_at: string;
  updated_at: string;
}

export const useRealContentPosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all content posts
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['contentPosts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('content_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ContentPost[];
    },
    enabled: !!user?.id,
  });

  // Create new post
  const createPostMutation = useMutation({
    mutationFn: async (postData: {
      title: string;
      body: string;
      platform: string;
      scheduled_for?: string;
      media_urls?: string[];
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('content_posts')
        .insert({
          ...postData,
          user_id: user.id,
          status: postData.scheduled_for ? 'scheduled' : 'draft',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentPosts'] });
      toast({
        title: 'Post created',
        description: 'Your post has been created successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive',
      });
    },
  });

  // Update post
  const updatePostMutation = useMutation({
    mutationFn: async ({ postId, updates }: { postId: string; updates: Partial<ContentPost> }) => {
      const { error } = await supabase
        .from('content_posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentPosts'] });
      toast({
        title: 'Post updated',
        description: 'Your post has been updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update post',
        variant: 'destructive',
      });
    },
  });

  // Delete post
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('content_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentPosts'] });
      toast({
        title: 'Post deleted',
        description: 'Your post has been deleted',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    },
  });

  return {
    posts: posts || [],
    isLoading,
    error,
    createPost: createPostMutation.mutate,
    updatePost: updatePostMutation.mutate,
    deletePost: deletePostMutation.mutate,
    isCreating: createPostMutation.isPending,
    isUpdating: updatePostMutation.isPending,
    isDeleting: deletePostMutation.isPending,
  };
};
