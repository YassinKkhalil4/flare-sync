
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RealPostingService } from '@/services/realPostingService';
import { ContentPost } from '@/types/content';

export const useRealContent = () => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isSchedulingPost, setIsSchedulingPost] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();

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
      // Get post data
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

      toast({
        title: 'Post published!',
        description: `Your post has been published to ${post.platform}`,
      });

      return result;
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

  return {
    createPost,
    schedulePost,
    publishNow,
    isCreatingPost,
    isSchedulingPost,
    isPublishing
  };
};
