
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
    mutationFn: (postData: Omit<ContentPost, 'id' | 'created_at' | 'updated_at' | 'user_id'>) =>
      RealContentService.createPost({ ...postData, user_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-posts'] });
      toast({ title: 'Success', description: 'Post created successfully' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive',
      });
    },
  });

  const schedulePostMutation = useMutation({
    mutationFn: (postData: Omit<ScheduledPost, 'id' | 'created_at' | 'updated_at' | 'user_id'>) =>
      RealContentService.schedulePost({ ...postData, user_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-posts'] });
      toast({ title: 'Success', description: 'Post scheduled successfully' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to schedule post',
        variant: 'destructive',
      });
    },
  });

  const publishPostMutation = useMutation({
    mutationFn: (postId: string) => RealContentService.publishPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-posts'] });
      queryClient.invalidateQueries({ queryKey: ['scheduled-posts'] });
      toast({ title: 'Success', description: 'Post published successfully' });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to publish post',
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
    isCreatingPost: createPostMutation.isPending,
    isSchedulingPost: schedulePostMutation.isPending,
    isPublishingPost: publishPostMutation.isPending,
  };
};
