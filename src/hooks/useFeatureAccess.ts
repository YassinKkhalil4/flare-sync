
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from '@/hooks/use-toast';
import { getPlanFeatures, UserPlan } from '@/lib/supabase';

export type FeatureKey = 
  | 'advanced_analytics' 
  | 'priority_support' 
  | 'custom_branding'
  | 'api_access'
  | 'team_collaboration'
  | 'content_generation'
  | 'automated_scheduling';

export type ResourceKey = 'max_posts' | 'max_users' | 'max_social_accounts';

export const useFeatureAccess = () => {
  const { user } = useAuth();
  const { plan } = useSubscription();

  // Check if user has access to a specific feature
  const checkFeatureAccess = async (featureName: FeatureKey): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // First try using the database function
      const { data, error } = await supabase.rpc('user_has_feature_access', {
        feature_name: featureName
      });
      
      if (error) {
        console.error('Error checking feature access:', error);
        // Fall back to client-side check with plan features
        const features = getPlanFeatures(plan);
        return features[featureName] || false;
      }
      
      return data || false;
    } catch (err) {
      console.error('Error in feature access check:', err);
      // Fall back to client-side check with plan features
      const features = getPlanFeatures(plan);
      return features[featureName] || false;
    }
  };

  // Get user's plan limit for a specific resource
  const getPlanLimit = async (resourceName: ResourceKey): Promise<number> => {
    if (!user) return 0;
    
    try {
      const { data, error } = await supabase.rpc('get_user_plan_limit', {
        resource_name: resourceName
      });
      
      if (error) {
        console.error('Error checking resource limit:', error);
        // Fall back to client-side check with plan features
        const features = getPlanFeatures(plan);
        return features[resourceName] || 0;
      }
      
      return data || 0;
    } catch (err) {
      console.error('Error in plan limit check:', err);
      // Fall back to client-side check with plan features
      const features = getPlanFeatures(plan);
      return features[resourceName] || 0;
    }
  };

  // Check if the user has reached their plan's limit for a resource
  const hasReachedLimit = async (resourceName: ResourceKey, currentCount: number): Promise<boolean> => {
    const limit = await getPlanLimit(resourceName);
    return currentCount >= limit;
  };

  // React Query hook to get feature access with caching
  const useFeatureCheck = (featureName: FeatureKey) => {
    return useQuery({
      queryKey: ['featureAccess', user?.id, featureName, plan],
      queryFn: () => checkFeatureAccess(featureName),
      enabled: !!user,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
    });
  };

  // React Query hook to get resource limits with caching
  const useResourceLimit = (resourceName: ResourceKey) => {
    return useQuery({
      queryKey: ['resourceLimit', user?.id, resourceName, plan],
      queryFn: () => getPlanLimit(resourceName),
      enabled: !!user,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
    });
  };

  // Guard component/HOC that can be used to prevent access to premium features
  const guardFeature = (featureName: FeatureKey, callback: () => void) => {
    return async () => {
      const hasAccess = await checkFeatureAccess(featureName);
      
      if (hasAccess) {
        callback();
      } else {
        toast({
          title: "Premium Feature",
          description: `This feature requires a plan upgrade. Please check our pricing page.`,
          variant: "destructive",
        });
      }
    };
  };

  return {
    checkFeatureAccess,
    getPlanLimit,
    hasReachedLimit,
    useFeatureCheck,
    useResourceLimit,
    guardFeature
  };
};
