
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ContentPost, ScheduledPost, ContentStatus } from '@/types/content';
import { EnhancedContentService } from '@/services/enhancedContentService';
import { storageService } from '@/services/storageService';

export const useRealContent = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Initialize storage on first load
  useState(() => {
    storageService.initializeStorage().catch(console.error);
  });

  const { data: posts = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: ['content-posts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const result = await EnhancedContentService.getUserPostsWithTags(user.id);
      if (result.error) {
        console.error('Error fetching posts:', result.error);
        return [];
      }
      return result.data || [];
    },
    enabled: !!user?.id,
  });

  const { data: scheduledPosts = [], isLoading: isLoadingScheduled } = useQuery({
    queryKey: ['scheduled-posts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user?.id)
        .order('scheduled_for', { ascending: true });

      if (error) {
        console.error('Error fetching scheduled posts:', error);
        return [];
      }
      return data as ScheduledPost[];
    },
    enabled: !!user?.id,
  });

  const createPostMutation = useMutation({
    mutationFn: async ({ 
      postData, 
      tagIds = [] 
    }: { 
      postData: Omit<ContentPost, 'id' | 'user_id' | 'created_at' | 'updated_at'>; 
      tagIds?: string[] 
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const result = await EnhancedContentService.createPostWithTags({
        ...postData,
        user_id: user.id
      }, tagIds);

      if (result.error) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-posts'] });
      toast({
        title: 'Post created',
        description: 'Your post has been created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create post',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  const schedulePostMutation = useMutation({
    mutationFn: async (postData: Omit<ScheduledPost, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert({
          ...postData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ScheduledPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-posts'] });
      toast({
        title: 'Post scheduled',
        description: 'Your post has been scheduled successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to schedule post',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  const publishPostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      // In a real implementation, this would call the social media APIs
      // For now, we'll update the status in our database
      const { data, error } = await supabase
        .from('content_posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', postId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as ContentPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-posts'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-posts'] });
      toast({
        title: 'Post published',
        description: 'Your post has been published successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to publish post',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('content_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-posts'] });
      toast({
        title: 'Post deleted',
        description: 'Your post has been deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete post',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  return {
    posts,
    scheduledPosts,
    isLoadingPosts,
    isLoadingScheduled,
    createPost: (postData: Omit<ContentPost, 'id' | 'user_id' | 'created_at' | 'updated_at'>, tagIds?: string[]) => 
      createPostMutation.mutate({ postData, tagIds }),
    schedulePost: schedulePostMutation.mutate,
    publishPost: publishPostMutation.mutate,
    deletePost: deletePostMutation.mutate,
    isCreating: createPostMutation.isPending,
    isScheduling: schedulePostMutation.isPending,
    isPublishing: publishPostMutation.isPending,
    isDeleting: deletePostMutation.isPending,
  };
};
