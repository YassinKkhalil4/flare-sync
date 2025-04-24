
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
  const CLIENT_ID = "abcdefg12345";  // Replace with actual Twitter Client Key
  const REDIRECT_URI = `${window.location.origin}/social-connect`;
  const SCOPE = "tweet.read,users.read";

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
