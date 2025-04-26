
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SocialAPI } from '@/services/socialService';
import { useToast } from '@/hooks/use-toast';

export const useSocialPlatforms = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Force loading to false after 5 seconds
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setInitialLoadComplete(true);
      }
    }, 5000);

    const checkConnections = async () => {
      try {
        await SocialAPI.getProfiles();
        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Error checking social connections:', error);
        toast({
          title: "Couldn't load social profiles",
          description: "There was an error loading your social profiles. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
        setInitialLoadComplete(true);
      }
    };

    checkConnections();
    return () => clearTimeout(timeout);
  }, [user, toast, isLoading]);

  return {
    isLoading,
    initialLoadComplete,
  };
};
