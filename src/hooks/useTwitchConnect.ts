
import { useSocialConnect } from './useSocialConnect';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTwitchConnect = () => {
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
  } = useSocialConnect('twitch');

  // Twitch OAuth configuration
  const CLIENT_ID = "twitch-client-id";
  const REDIRECT_URI = `${window.location.origin}/social-connect`;
  const SCOPE = "user:read:email channel:read:subscriptions";

  const initiateTwitchConnect = () => {
    initiateConnect(CLIENT_ID, REDIRECT_URI, SCOPE);
  };

  // Handle OAuth callback with error handling
  const handleCallback = async (code: string) => {
    try {
      // Exchange code for token using our edge function
      const { data, error } = await supabase.functions.invoke('twitch-auth', {
        body: { code }
      });

      if (error) throw error;

      toast({
        title: 'Twitch Connected',
        description: 'Your Twitch account has been successfully connected.',
      });

      return data;
    } catch (error) {
      console.error('Error handling Twitch callback:', error);
      toast({
        title: 'Connection error',
        description: 'Failed to complete Twitch connection. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    isLoading,
    isConnecting,
    isSyncing,
    twitchProfile: profile,
    isTwitchConnected: isConnected,
    initiateTwitchConnect,
    disconnectTwitch: disconnect,
    syncTwitchData: syncData,
    handleCallback,
  };
};
