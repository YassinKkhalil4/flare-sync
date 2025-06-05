
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RealContentService } from '@/services/realContentService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ContentPost, ScheduledPost } from '@/types/content';

export const useRealContent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading: isLoadingPosts } = useQuery({
    queryKey: ['content-posts', user?.id],
    queryFn: () => RealContentService.getUserPosts(user!.id),
    enabled: !!user?.id,
  });

  const { data: scheduledPosts = [], isLoading: isLoadingScheduled } = useQuery({
    queryKey: ['scheduled-posts', user?.id],
    queryFn: () => RealContentService.getScheduledPosts(user!.id),
    enabled: !!user?.id,
  });

  const createPostMutation = useMutation({
    mutationFn: (postData: Omit<ContentPost, 'id' | 'created_at' | 'updated_at'>) => 
      RealContentService.createPost(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-posts'] });
      toast({ title: 'Success', description: 'Post created successfully' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ContentPost> }) => 
      RealContentService.updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-posts'] });
      toast({ title: 'Success', description: 'Post updated successfully' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (id: string) => RealContentService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-posts'] });
      toast({ title: 'Success', description: 'Post deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const schedulePostMutation = useMutation({
    mutationFn: (postData: Omit<ScheduledPost, 'id' | 'created_at' | 'updated_at'>) => 
      RealContentService.schedulePost(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-posts'] });
      toast({ title: 'Success', description: 'Post scheduled successfully' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  const publishPostMutation = useMutation({
    mutationFn: (id: string) => RealContentService.publishPost(id),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['content-posts'] });
        queryClient.invalidateQueries({ queryKey: ['scheduled-posts'] });
        toast({ title: 'Success', description: 'Post published successfully' });
      } else {
        toast({ 
          title: 'Error', 
          description: data.error || 'Failed to publish post', 
          variant: 'destructive' 
        });
      }
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  return {
    posts,
    scheduledPosts,
    isLoadingPosts,
    isLoadingScheduled,
    createPost: createPostMutation.mutate,
    updatePost: updatePostMutation.mutate,
    deletePost: deletePostMutation.mutate,
    schedulePost: schedulePostMutation.mutate,
    publishPost: publishPostMutation.mutate,
    isCreating: createPostMutation.isPending,
    isUpdating: updatePostMutation.isPending,
    isDeleting: deletePostMutation.isPending,
    isScheduling: schedulePostMutation.isPending,
    isPublishing: publishPostMutation.isPending,
  };
};
