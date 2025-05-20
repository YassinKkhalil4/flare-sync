
import { useSocialConnect } from './useSocialConnect';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useYoutubeConnect = () => {
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
  } = useSocialConnect('youtube');

  // YouTube OAuth configuration
  const CLIENT_ID = "abcdefg12345";  // Replace with actual YouTube Client Key
  const REDIRECT_URI = `${window.location.origin}/social-connect`;
  const SCOPE = "https://www.googleapis.com/auth/youtube.readonly";

  const initiateYoutubeConnect = () => {
    initiateConnect(CLIENT_ID, REDIRECT_URI, SCOPE);
  };

  // Handle OAuth callback with error handling
  const handleCallback = async (code: string) => {
    try {
      // Exchange code for token using our edge function
      const { data, error } = await supabase.functions.invoke('youtube-auth', {
        body: { code }
      });

      if (error) throw error;

      toast({
        title: 'YouTube Connected',
        description: 'Your YouTube account has been successfully connected.',
      });

      return data;
    } catch (error) {
      console.error('Error handling YouTube callback:', error);
      toast({
        title: 'Connection error',
        description: 'Failed to complete YouTube connection. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    isLoading,
    isConnecting,
    isSyncing,
    youtubeProfile: profile,
    isYoutubeConnected: isConnected,
    initiateYoutubeConnect,
    disconnectYoutube: disconnect,
    syncYoutubeData: syncData,
    handleCallback,
  };
};
