
import { useSocialConnect } from './useSocialConnect';

export const useInstagramConnect = () => {
  const {
    isLoading,
    isConnecting,
    isSyncing,
    socialProfile,
    isSocialConnected,
    initiateSocialConnect,
    disconnectSocial,
    syncSocialData,
  } = useSocialConnect('instagram');

  // Instagram OAuth configuration
  const CLIENT_ID = "12345678";  // Replace with actual Instagram Client ID
  const REDIRECT_URI = `${window.location.origin}/social-connect`;
  const SCOPE = "user_profile,user_media";

  const initiateInstagramConnect = () => {
    initiateSocialConnect(CLIENT_ID, REDIRECT_URI, SCOPE);
  };

  return {
    isLoading,
    isConnecting,
    isSyncing,
    instagramProfile: socialProfile,
    isInstagramConnected: isSocialConnected,
    initiateInstagramConnect,
    disconnectInstagram: disconnectSocial,
    syncInstagramData: syncSocialData,
  };
};
