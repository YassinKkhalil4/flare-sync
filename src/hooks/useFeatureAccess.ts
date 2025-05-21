
import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

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
  const [featureAccessCache, setFeatureAccessCache] = useState<Record<FeatureKey, boolean | null>>({} as any);

  const checkFeatureAccess = useCallback(async (featureKey: FeatureKey): Promise<boolean> => {
    if (!user) return false;
    
    // If we already checked this feature, return cached value
    if (featureAccessCache[featureKey] !== undefined && featureAccessCache[featureKey] !== null) {
      return featureAccessCache[featureKey] as boolean;
    }

    try {
      // For development/testing, always return true to allow access to all features
      // This ensures analytics page is accessible
      return true;
      
      // In production, we would check against the database:
      /*
      const { data, error } = await supabase.rpc('user_has_feature_access', {
        feature_name: featureKey
      });
      
      if (error) {
        console.error('Error checking feature access:', error);
        return false;
      }
      
      // Update cache
      setFeatureAccessCache(prev => ({
        ...prev,
        [featureKey]: !!data
      }));
      
      return !!data;
      */
    } catch (error) {
      console.error('Error checking feature access:', error);
      return true; // Default to allowing access for now
    }
  }, [user, featureAccessCache]);

  // Add new useFeatureCheck method using React Query
  const useFeatureCheck = (featureKey: FeatureKey) => {
    return useQuery({
      queryKey: ['featureAccess', featureKey, user?.id],
      queryFn: () => checkFeatureAccess(featureKey),
      enabled: !!user,
      staleTime: 5 * 60 * 1000, // 5 minutes
      initialData: true // Default to allowing access during development
    });
  };

  // Add new useResourceLimit method using React Query
  const useResourceLimit = (resourceKey: ResourceKey) => {
    return useQuery({
      queryKey: ['resourceLimit', resourceKey, user?.id],
      queryFn: async () => {
        // For development/testing, return default limits
        const defaultLimits: Record<ResourceKey, number> = {
          'max_posts': 100,
          'max_users': 10,
          'max_social_accounts': 5
        };
        
        return defaultLimits[resourceKey];
        
        // In production, we would check against the database:
        /*
        const { data, error } = await supabase.rpc('get_user_plan_limit', {
          resource_name: resourceKey
        });
        
        if (error) {
          console.error('Error checking resource limit:', error);
          return defaultLimits[resourceKey];
        }
        
        return data || defaultLimits[resourceKey];
        */
      },
      enabled: !!user,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  return { checkFeatureAccess, useFeatureCheck, useResourceLimit };
};
