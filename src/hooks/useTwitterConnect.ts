
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

      // Twitter OAuth 2.0 PKCE configuration
      const REDIRECT_URI = `${window.location.origin}/social-connect`;
      const SCOPE = "tweet.read users.read offline.access";
      
      // Generate PKCE challenge
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      
      // Store code verifier for later use
      localStorage.setItem('twitter_code_verifier', codeVerifier);

      // Construct Twitter OAuth URL
      const authUrl = `https://twitter.com/i/oauth2/authorize?` +
        `response_type=code` +
        `&client_id=${data.client_id}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&scope=${encodeURIComponent(SCOPE)}` +
        `&state=${encodeURIComponent(session.access_token)}` +
        `&code_challenge=${codeChallenge}` +
        `&code_challenge_method=S256`;

      // Redirect to Twitter
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

  // Helper functions for PKCE
  const generateCodeVerifier = () => {
    const array = new Uint32Array(56/2);
    crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
  };

  const generateCodeChallenge = async (verifier: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  // Handle OAuth callback
  const handleCallback = async (code: string) => {
    try {
      const codeVerifier = localStorage.getItem('twitter_code_verifier');
      if (!codeVerifier) {
        throw new Error('Missing code verifier');
      }

      // Exchange code for token using our edge function
      const { data, error } = await supabase.functions.invoke('twitter-auth', {
        body: { code, code_verifier: codeVerifier }
      });

      if (error) throw error;

      // Clean up stored verifier
      localStorage.removeItem('twitter_code_verifier');

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
