
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RealAnalyticsService } from '@/services/realAnalyticsService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useRealAnalytics = (timeRange: string = '30d') => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: overview, isLoading: isLoadingOverview } = useQuery({
    queryKey: ['analytics-overview', user?.id, timeRange],
    queryFn: () => RealAnalyticsService.getOverviewAnalytics(user!.id, timeRange),
    enabled: !!user?.id,
  });

  const syncAnalyticsMutation = useMutation({
    mutationFn: (platform: string) => RealAnalyticsService.syncPlatformAnalytics(platform),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['analytics-overview'] });
        toast({ title: 'Success', description: 'Analytics synced successfully' });
      } else {
        toast({ 
          title: 'Error', 
          description: data.error || 'Failed to sync analytics', 
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
    overview,
    isLoadingOverview,
    syncAnalytics: syncAnalyticsMutation.mutate,
    isSyncing: syncAnalyticsMutation.isPending,
  };
};

export const usePostAnalytics = (postId: string) => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['post-analytics', postId],
    queryFn: () => RealAnalyticsService.getPostAnalytics(postId),
    enabled: !!postId,
  });

  return {
    analytics,
    isLoading,
  };
};
