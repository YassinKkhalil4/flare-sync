
import { useSocialConnect } from './useSocialConnect';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTwitterConnect = () => {
  const { toast } = useToast();
  const {
    isLoading,
    isConnecting,
    isSyncing,
    profile,
    isConnected,
    disconnect,
    syncData,
  } = useSocialConnect('twitter');

  const initiateTwitterConnect = async () => {
    try {
      // Get the current session for the state parameter
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to connect your Twitter account.',
          variant: 'destructive',
        });
        return;
      }

      // Check if Twitter credentials are configured
      const { data, error } = await supabase.functions.invoke('check-twitter-config');
      
      if (error || !data?.configured) {
        toast({
          title: 'Configuration Required',
          description: 'Twitter API credentials need to be configured in Supabase secrets. Please contact your administrator.',
          variant: 'destructive',
        });
        return;
      }

      // Twitter OAuth 2.0 with PKCE
      const REDIRECT_URI = `${window.location.origin}/social-connect`;
      const SCOPE = "tweet.read tweet.write users.read offline.access";
      const STATE = encodeURIComponent(session.access_token);
      
      const authUrl = `https://twitter.com/i/oauth2/authorize?` +
        `response_type=code` +
        `&client_id=${data.client_id}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&scope=${encodeURIComponent(SCOPE)}` +
        `&state=${STATE}` +
        `&code_challenge=challenge` +
        `&code_challenge_method=plain`;
        
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error initiating Twitter connection:', error);
      toast({
        title: 'Connection error',
        description: 'Failed to connect to Twitter. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle OAuth callback
  const handleCallback = async (code: string) => {
    try {
      // Exchange code for token using our edge function
      const { data, error } = await supabase.functions.invoke('twitter-auth', {
        body: { code }
      });

      if (error) throw error;

      toast({
        title: 'Twitter Connected',
        description: 'Your Twitter account has been successfully connected.',
      });

      return data;
    } catch (error) {
      console.error('Error handling Twitter callback:', error);
      toast({
        title: 'Connection error',
        description: 'Failed to complete Twitter connection. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    isLoading,
    isConnecting,
    isSyncing,
    twitterProfile: profile,
    isTwitterConnected: isConnected,
    initiateTwitterConnect,
    disconnectTwitter: disconnect,
    syncTwitterData: syncData,
    handleCallback,
  };
};
