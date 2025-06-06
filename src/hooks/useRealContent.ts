
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { StorageService } from '@/services/storageService';
import { errorHandler } from '@/utils/errorHandler';
import { supabase } from '@/integrations/supabase/client';
import { ContentPost, ScheduledPost } from '@/types/content';

export const useRealContent = () => {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isLoadingScheduled, setIsLoadingScheduled] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const initializeContentSystem = async () => {
      if (!user) return;

      try {
        const storageResult = await StorageService.initializeStorage();
        
        if (!storageResult.success) {
          throw new Error(storageResult.error || 'Storage initialization failed');
        }

        setIsInitialized(true);
        setInitError(null);
        
        // Load posts after initialization
        await loadPosts();
        await loadScheduledPosts();
      } catch (error) {
        console.error('Content system initialization error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setInitError(errorMessage);
        errorHandler.logError(error as Error, 'Content system initialization', user.id);
      }
    };

    initializeContentSystem();
  }, [user]);

  const loadPosts = async () => {
    if (!user) return;
    
    setIsLoadingPosts(true);
    try {
      const { data, error } = await supabase
        .from('content_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      errorHandler.logError(error as Error, 'Load posts', user.id);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const loadScheduledPosts = async () => {
    if (!user) return;
    
    setIsLoadingScheduled(true);
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      setScheduledPosts(data || []);
    } catch (error) {
      console.error('Error loading scheduled posts:', error);
      errorHandler.logError(error as Error, 'Load scheduled posts', user.id);
    } finally {
      setIsLoadingScheduled(false);
    }
  };

  const schedulePost = async (postData: any) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: user.id,
          content: postData.content,
          platform: postData.platform,
          scheduled_for: postData.scheduled_for,
          status: 'scheduled',
          metadata: {
            title: postData.title,
            media_urls: postData.media_urls
          }
        })
        .select()
        .single();

      if (error) throw error;
      
      await loadScheduledPosts();
      return data;
    } catch (error) {
      console.error('Error scheduling post:', error);
      errorHandler.logError(error as Error, 'Schedule post', user.id);
      throw error;
    }
  };

  const publishPost = async (postId: string) => {
    setIsPublishing(true);
    try {
      const { error } = await supabase
        .from('content_posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (error) throw error;
      
      await loadPosts();
    } catch (error) {
      console.error('Error publishing post:', error);
      errorHandler.logError(error as Error, 'Publish post', user?.id);
      throw error;
    } finally {
      setIsPublishing(false);
    }
  };

  const deletePost = async (postId: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('content_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      
      await loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      errorHandler.logError(error as Error, 'Delete post', user?.id);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isInitialized,
    initError,
    posts,
    scheduledPosts,
    isLoadingPosts,
    isLoadingScheduled,
    isDeleting,
    isPublishing,
    schedulePost,
    publishPost,
    deletePost,
    loadPosts,
    loadScheduledPosts,
  };
};
