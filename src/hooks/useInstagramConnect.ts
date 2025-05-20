
import { useSocialConnect } from './useSocialConnect';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useInstagramConnect = () => {
  const { toast } = useToast();
  const {
    isLoading,
    isConnecting,
    isSyncing,
    profile,
    isConnected,
    disconnect,
    syncData,
  } = useSocialConnect('instagram');

  const initiateInstagramConnect = async () => {
    try {
      // Get the current session for the state parameter
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to connect your Instagram account.',
          variant: 'destructive',
        });
        return;
      }

      // Instagram OAuth configuration
      const INSTAGRAM_APP_ID = "12345678"; // Replace with actual Instagram App ID once provided
      const REDIRECT_URI = `${window.location.origin}/social-connect`;
      const SCOPE = "user_profile,user_media";

      // Construct Instagram OAuth URL
      const authUrl = `https://api.instagram.com/oauth/authorize?` +
        `client_id=${INSTAGRAM_APP_ID}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&scope=${encodeURIComponent(SCOPE)}` +
        `&response_type=code` +
        `&state=${encodeURIComponent(session.access_token)}`;

      // Redirect to Instagram
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error initiating Instagram connection:', error);
      toast({
        title: 'Connection error',
        description: 'Failed to connect to Instagram. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle OAuth callback
  const handleCallback = async (code: string) => {
    try {
      // Exchange code for token using our edge function
      const { data, error } = await supabase.functions.invoke('instagram-auth', {
        body: { code }
      });

      if (error) throw error;

      toast({
        title: 'Instagram Connected',
        description: 'Your Instagram account has been successfully connected.',
      });

      return data;
    } catch (error) {
      console.error('Error handling Instagram callback:', error);
      toast({
        title: 'Connection error',
        description: 'Failed to complete Instagram connection. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    isLoading,
    isConnecting,
    isSyncing,
    instagramProfile: profile,
    isInstagramConnected: isConnected,
    initiateInstagramConnect,
    disconnectInstagram: disconnect,
    syncInstagramData: syncData,
    handleCallback,
  };
};
