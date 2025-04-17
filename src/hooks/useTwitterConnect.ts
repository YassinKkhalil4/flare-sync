
import { useSocialConnect } from './useSocialConnect';

export const useTwitterConnect = () => {
  const {
    isLoading,
    isConnecting,
    isSyncing,
    socialProfile,
    isSocialConnected,
    initiateSocialConnect,
    disconnectSocial,
    syncSocialData,
  } = useSocialConnect('twitter');

  // Twitter OAuth configuration
  const CLIENT_ID = "twitter123456";  // Replace with actual Twitter Client ID
  const REDIRECT_URI = `${window.location.origin}/social-connect`;
  const SCOPE = "tweet.read,users.read,offline.access";

  const initiateTwitterConnect = () => {
    initiateSocialConnect(CLIENT_ID, REDIRECT_URI, SCOPE);
  };

  return {
    isLoading,
    isConnecting,
    isSyncing,
    twitterProfile: socialProfile,
    isTwitterConnected: isSocialConnected,
    initiateTwitterConnect,
    disconnectTwitter: disconnectSocial,
    syncTwitterData: syncSocialData,
  };
};
