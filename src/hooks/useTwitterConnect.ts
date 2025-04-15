
import { useSocialConnect } from './useSocialConnect';

export const useTwitterConnect = () => {
  const {
    profiles,
    isLoading,
    isConnecting,
    isSyncing,
    socialProfile: twitterProfile,
    isSocialConnected: isTwitterConnected,
    initiateSocialConnect,
    disconnectSocial: disconnectTwitter,
    syncSocialData: syncTwitterData,
  } = useSocialConnect('twitter');

  const initiateTwitterConnect = async () => {
    const twitterClientId = import.meta.env.VITE_TWITTER_CLIENT_ID || 'Uhjkl87yhgt';
    const redirectUri = import.meta.env.VITE_TWITTER_REDIRECT_URI || 
                       `${window.location.origin}/social-connect`;
    
    await initiateSocialConnect(
      twitterClientId,
      redirectUri,
      'tweet.read users.read follows.read'
    );
  };

  return {
    profiles,
    isLoading,
    isConnecting,
    isSyncing,
    twitterProfile,
    isTwitterConnected,
    initiateTwitterConnect,
    disconnectTwitter,
    syncTwitterData,
  };
};
