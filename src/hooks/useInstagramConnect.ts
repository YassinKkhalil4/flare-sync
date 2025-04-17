
import { useSocialConnect } from './useSocialConnect';

export const useInstagramConnect = () => {
  const {
    isLoading,
    isConnecting,
    isSyncing,
    profile,
    isConnected,
    initiateConnect,
    disconnect,
    syncData,
  } = useSocialConnect('instagram');

  // Instagram OAuth configuration
  const CLIENT_ID = "abcdefg12345";  // Replace with actual Instagram Client Key
  const REDIRECT_URI = `${window.location.origin}/social-connect`;
  const SCOPE = "user_profile,user_media";

  const initiateInstagramConnect = () => {
    initiateConnect(CLIENT_ID, REDIRECT_URI, SCOPE);
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
  };
};
