
import { useSocialConnect } from './useSocialConnect';

export const useYoutubeConnect = () => {
  const {
    isLoading,
    isConnecting,
    isSyncing,
    profile,
    isConnected,
    initiateConnect,
    disconnect,
    syncData,
  } = useSocialConnect('youtube');

  // YouTube OAuth configuration
  const CLIENT_ID = "youtube-client-id";  // Replace with actual YouTube Client ID
  const REDIRECT_URI = `${window.location.origin}/social-connect`;
  const SCOPE = "https://www.googleapis.com/auth/youtube.readonly";

  const initiateYoutubeConnect = () => {
    initiateConnect(CLIENT_ID, REDIRECT_URI, SCOPE);
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
  };
};
