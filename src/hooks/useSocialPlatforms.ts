
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SocialProfile } from '@/types/messaging';
import { SocialAPI } from '@/services/socialService';

export const useSocialPlatforms = () => {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSocialAccounts, setHasSocialAccounts] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [profiles, setProfiles] = useState<SocialProfile[]>([]);
  
  useEffect(() => {
    const checkSocialAccounts = async () => {
      if (!user) {
        setInitialLoadComplete(true);
        return;
      }
      
      setIsLoading(true);
      try {
        // Get profiles from the social service
        const profilesData = await SocialAPI.getProfiles();
        setProfiles(profilesData);
        setHasSocialAccounts(profilesData.some(p => p.connected));
      } catch (error) {
        console.error('Error checking social accounts:', error);
      } finally {
        setIsLoading(false);
        setInitialLoadComplete(true);
      }
    };
    
    checkSocialAccounts();
  }, [user]);

  // Refresh profiles data
  const refreshProfiles = async () => {
    if (!user) return;
    
    try {
      const profilesData = await SocialAPI.getProfiles();
      setProfiles(profilesData);
      setHasSocialAccounts(profilesData.some(p => p.connected));
    } catch (error) {
      console.error('Error refreshing profiles:', error);
    }
  };
  
  const connectPlatform = async (platform: string) => {
    try {
      setIsConnecting(true);
      
      if (!user) {
        toast({
          variant: 'destructive',
          title: 'Authentication required',
          description: 'Please log in to connect social accounts',
        });
        return;
      }
      
      // Create or update platform profile
      await SocialAPI.connectPlatform(platform);
      await refreshProfiles();
      
      toast({
        title: 'Platform connection initiated',
        description: `${platform} connection process started. API credentials may need configuration.`,
      });
    } catch (error) {
      console.error('Error connecting platform:', error);
      toast({
        variant: 'destructive',
        title: 'Connection failed',
        description: 'Failed to connect your account. Please try again.',
      });
    } finally {
      setIsConnecting(false);
    }
  };
  
  return {
    connectPlatform,
    isConnecting,
    isLoading,
    hasSocialAccounts,
    initialLoadComplete,
    profiles,
    refreshProfiles
  };
};
