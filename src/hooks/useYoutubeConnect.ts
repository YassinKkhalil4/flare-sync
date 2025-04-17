
import { useSocialConnect } from './useSocialConnect';

export const useYoutubeConnect = () => {
  const {
    isLoading,
    isConnecting,
    isSyncing,
    socialProfile,
    isSocialConnected,
    initiateSocialConnect,
    disconnectSocial,
    syncSocialData,
  } = useSocialConnect('youtube');

  // YouTube OAuth configuration
  const CLIENT_ID = "youtube-client-id";  // Replace with actual YouTube Client ID
  const REDIRECT_URI = `${window.location.origin}/social-connect`;
  const SCOPE = "https://www.googleapis.com/auth/youtube.readonly";

  const initiateYoutubeConnect = () => {
    initiateSocialConnect(CLIENT_ID, REDIRECT_URI, SCOPE);
  };

  return {
    isLoading,
    isConnecting,
    isSyncing,
    youtubeProfile: socialProfile,
    isYoutubeConnected: isSocialConnected,
    initiateYoutubeConnect,
    disconnectYoutube: disconnectSocial,
    syncYoutubeData: syncSocialData,
  };
};
