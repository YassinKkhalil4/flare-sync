
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface ContentPost {
  id: string;
  user_id: string;
  title: string;
  body?: string;
  platform: string;
  status: string;
  scheduled_for?: string;
  published_at?: string;
  media_urls?: string[];
  platform_post_id?: string;
  metrics?: any;
  created_at: string;
  updated_at: string;
}

export interface ScheduledPost {
  id: string;
  user_id: string;
  content?: string;
  platform: string;
  scheduled_for: string;
  status: string;
  media_urls?: string[];
  post_id?: string;
  error_message?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export const useRealContent = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: ['content-posts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_posts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ContentPost[];
    },
    enabled: !!user?.id,
  });

  const { data: scheduledPosts = [], isLoading: isLoadingScheduled } = useQuery({
    queryKey: ['scheduled-posts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user?.id)
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      return data as ScheduledPost[];
    },
    enabled: !!user?.id,
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData: Omit<ContentPost, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('content_posts')
        .insert({
          ...postData,
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ContentPost;
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
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert({
          ...postData,
          user_id: user?.id,
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
      // In a real implementation, this would call the social media APIs
      // For now, we'll update the status in our database
      const { data, error } = await supabase
        .from('content_posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', postId)
        .eq('user_id', user?.id)
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
      const { error } = await supabase
        .from('content_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user?.id);

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
    createPost: createPostMutation.mutate,
    schedulePost: schedulePostMutation.mutate,
    publishPost: publishPostMutation.mutate,
    deletePost: deletePostMutation.mutate,
    isCreating: createPostMutation.isPending,
    isScheduling: schedulePostMutation.isPending,
    isPublishing: publishPostMutation.isPending,
    isDeleting: deletePostMutation.isPending,
  };
};
