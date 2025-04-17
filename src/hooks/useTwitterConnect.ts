
import { useSocialConnect } from './useSocialConnect';

export const useTwitterConnect = () => {
  const {
    isLoading,
    isConnecting,
    isSyncing,
    profile,
    isConnected,
    initiateConnect,
    disconnect,
    syncData,
  } = useSocialConnect('twitter');

  // Twitter OAuth configuration
  const CLIENT_ID = "twitter123456";  // Replace with actual Twitter Client ID
  const REDIRECT_URI = `${window.location.origin}/social-connect`;
  const SCOPE = "tweet.read,users.read,offline.access";

  const initiateTwitterConnect = () => {
    initiateConnect(CLIENT_ID, REDIRECT_URI, SCOPE);
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
  };
};
