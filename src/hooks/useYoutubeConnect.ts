
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
    disconnect,
    syncData,
  } = useSocialConnect('youtube');

  const initiateYoutubeConnect = async () => {
    try {
      // Get the current session for the state parameter
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to connect your YouTube account.',
          variant: 'destructive',
        });
        return;
      }

      // YouTube/Google OAuth configuration
      const CLIENT_ID = "youtube-client-id"; // Replace with actual Google Client ID
      const REDIRECT_URI = `${window.location.origin}/social-connect`;
      const SCOPE = "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload";

      // Construct Google OAuth URL
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&scope=${encodeURIComponent(SCOPE)}` +
        `&response_type=code` +
        `&access_type=offline` +
        `&state=${encodeURIComponent(session.access_token)}`;

      // Redirect to Google
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error initiating YouTube connection:', error);
      toast({
        title: 'Connection error',
        description: 'Failed to connect to YouTube. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle OAuth callback
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
