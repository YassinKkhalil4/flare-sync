
import { useSocialConnect } from './useSocialConnect';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTiktokConnect = () => {
  const { toast } = useToast();
  const {
    isLoading,
    isConnecting,
    isSyncing,
    profile,
    isConnected,
    initiateConnect,
    disconnect,
    syncData,
  } = useSocialConnect('tiktok');

  // TikTok OAuth configuration
  const CLIENT_ID = "abcdefg12345";  // Replace with actual TikTok Client Key
  const REDIRECT_URI = `${window.location.origin}/social-connect`;
  const SCOPE = "user.info.basic,video.list";

  const initiateTiktokConnect = () => {
    initiateConnect(CLIENT_ID, REDIRECT_URI, SCOPE);
  };

  // Handle OAuth callback with error handling
  const handleCallback = async (code: string) => {
    try {
      // Exchange code for token using our edge function
      const { data, error } = await supabase.functions.invoke('tiktok-auth', {
        body: { code }
      });

      if (error) throw error;

      toast({
        title: 'TikTok Connected',
        description: 'Your TikTok account has been successfully connected.',
      });

      return data;
    } catch (error) {
      console.error('Error handling TikTok callback:', error);
      toast({
        title: 'Connection error',
        description: 'Failed to complete TikTok connection. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    isLoading,
    isConnecting,
    isSyncing,
    tiktokProfile: profile,
    isTiktokConnected: isConnected,
    initiateTiktokConnect,
    disconnectTiktok: disconnect,
    syncTiktokData: syncData,
    handleCallback,
  };
};
