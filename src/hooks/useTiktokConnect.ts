
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
    disconnect,
    syncData,
  } = useSocialConnect('tiktok');

  const initiateTiktokConnect = async () => {
    try {
      // Get the current session for the state parameter
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to connect your TikTok account.',
          variant: 'destructive',
        });
        return;
      }

      // TikTok OAuth configuration
      const CLIENT_KEY = "tiktok-client-key"; // Replace with actual TikTok Client Key
      const REDIRECT_URI = `${window.location.origin}/social-connect`;
      const SCOPE = "user.info.basic,video.list";

      // Construct TikTok OAuth URL
      const authUrl = `https://www.tiktok.com/auth/authorize/?` +
        `client_key=${CLIENT_KEY}` +
        `&scope=${encodeURIComponent(SCOPE)}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&state=${encodeURIComponent(session.access_token)}`;

      // Redirect to TikTok
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error initiating TikTok connection:', error);
      toast({
        title: 'Connection error',
        description: 'Failed to connect to TikTok. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle OAuth callback
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
