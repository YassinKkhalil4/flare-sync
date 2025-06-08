
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { RealPostingService } from '@/services/realPostingService';
import { ContentPost, ScheduledPost } from '@/types/content';

export const useRealContent = () => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isSchedulingPost, setIsSchedulingPost] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch content posts
  const { data: posts = [], isLoading: isLoadingPosts } = useQuery({
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

  // Fetch scheduled posts
  const { data: scheduledPosts = [], isLoading: isLoadingScheduled } = useQuery({
    queryKey: ['scheduledPosts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      return data as ScheduledPost[];
    },
    enabled: !!user?.id,
  });

  const createPost = async (postData: Partial<ContentPost>) => {
    setIsCreatingPost(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error('User not authenticated');
      }

      // Insert post into database
      const { data: post, error: insertError } = await supabase
        .from('content_posts')
        .insert({
          user_id: session.session.user.id,
          title: postData.title || '',
          body: postData.body || '',
          platform: postData.platform || 'instagram',
          status: postData.status || 'draft',
          media_urls: postData.media_urls || [],
          published_at: postData.published_at
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // If status is published, actually publish it
      if (postData.status === 'published') {
        setIsPublishing(true);
        const result = await RealPostingService.publishPost(
          post.platform,
          post.body || post.title,
          post.media_urls,
          post.id
        );

        if (!result.success) {
          // Update status to failed
          await supabase
            .from('content_posts')
            .update({ status: 'failed' })
            .eq('id', post.id);
          
          throw new Error(result.error || 'Failed to publish post');
        }

        toast({
          title: 'Post published!',
          description: `Your post has been published to ${post.platform}`,
        });
      } else {
        toast({
          title: 'Post created!',
          description: postData.status === 'draft' ? 'Post saved as draft' : 'Post created successfully',
        });
      }

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['contentPosts'] });
      return post;
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create post',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsCreatingPost(false);
      setIsPublishing(false);
    }
  };

  const schedulePost = async (postData: any) => {
    setIsSchedulingPost(true);
    try {
      const result = await RealPostingService.schedulePost({
        platform: postData.platform,
        content: postData.content,
        media_urls: postData.media_urls,
        scheduled_for: postData.scheduled_for
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to schedule post');
      }

      toast({
        title: 'Post scheduled!',
        description: 'Your post has been scheduled for publication',
      });

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['scheduledPosts'] });
      return result;
    } catch (error) {
      console.error('Error scheduling post:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to schedule post',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsSchedulingPost(false);
    }
  };

  const publishNow = async (postId: string) => {
    setIsPublishing(true);
    try {
      // Check if this is a scheduled post or content post
      const { data: scheduledPost } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (scheduledPost) {
        // This is a scheduled post
        const result = await RealPostingService.publishPost(
          scheduledPost.platform,
          scheduledPost.content,
          scheduledPost.media_urls,
          scheduledPost.id
        );

        if (!result.success) {
          throw new Error(result.error || 'Failed to publish post');
        }

        // Update scheduled post status
        await supabase
          .from('scheduled_posts')
          .update({ status: 'published' })
          .eq('id', postId);

        toast({
          title: 'Post published!',
          description: `Your post has been published to ${scheduledPost.platform}`,
        });

        // Refresh queries
        queryClient.invalidateQueries({ queryKey: ['scheduledPosts'] });
        return result;
      } else {
        // This is a content post
        const { data: post, error: fetchError } = await supabase
          .from('content_posts')
          .select('*')
          .eq('id', postId)
          .single();

        if (fetchError || !post) {
          throw new Error('Post not found');
        }

        // Publish the post
        const result = await RealPostingService.publishPost(
          post.platform,
          post.body || post.title,
          post.media_urls,
          post.id
        );

        if (!result.success) {
          throw new Error(result.error || 'Failed to publish post');
        }

        // Update content post status
        await supabase
          .from('content_posts')
          .update({ 
            status: 'published',
            published_at: new Date().toISOString()
          })
          .eq('id', postId);

        toast({
          title: 'Post published!',
          description: `Your post has been published to ${post.platform}`,
        });

        // Refresh queries
        queryClient.invalidateQueries({ queryKey: ['contentPosts'] });
        return result;
      }
    } catch (error) {
      console.error('Error publishing post:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to publish post',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsPublishing(false);
    }
  };

  // Alias for backward compatibility
  const publishPost = publishNow;
  const isPublishingPost = isPublishing;

  return {
    posts,
    scheduledPosts,
    isLoadingPosts,
    isLoadingScheduled,
    createPost,
    schedulePost,
    publishNow,
    publishPost,
    isCreatingPost,
    isSchedulingPost,
    isPublishing,
    isPublishingPost
  };
};
