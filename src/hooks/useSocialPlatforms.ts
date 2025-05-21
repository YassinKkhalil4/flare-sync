
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useSocialPlatforms = () => {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSocialAccounts, setHasSocialAccounts] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  useEffect(() => {
    const checkSocialAccounts = async () => {
      if (!user) {
        setInitialLoadComplete(true);
        return;
      }
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('social_profiles')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
          
        if (!error && data) {
          setHasSocialAccounts(data.length > 0);
        }
      } catch (error) {
        console.error('Error checking social accounts:', error);
      } finally {
        setIsLoading(false);
        setInitialLoadComplete(true);
      }
    };
    
    checkSocialAccounts();
  }, [user]);
  
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
      
      // Instagram OAuth process would go here
      if (platform === 'instagram') {
        // For demo purposes, we'll just show a toast that would redirect in a real implementation
        toast({
          title: 'Redirecting to Instagram',
          description: 'You will be redirected to authorize with Instagram',
        });
        
        // In a real implementation, we would redirect to Instagram OAuth
        // window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=instagram&redirect_to=${redirectUrl}`;
      } else {
        toast({
          title: 'Coming Soon',
          description: `${platform} integration will be available in a future update.`,
        });
      }
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
    initialLoadComplete
  };
};
