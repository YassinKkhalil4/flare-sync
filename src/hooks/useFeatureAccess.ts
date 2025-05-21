
import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type FeatureKey = 
  | 'advanced_analytics' 
  | 'priority_support' 
  | 'custom_branding' 
  | 'api_access' 
  | 'team_collaboration' 
  | 'content_generation' 
  | 'automated_scheduling';

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

  return { checkFeatureAccess };
};
