
import { useSocialConnect } from './useSocialConnect';

export const useTiktokConnect = () => {
  const {
    isLoading,
    isConnecting,
    isSyncing,
    socialProfile,
    isSocialConnected,
    initiateSocialConnect,
    disconnectSocial,
    syncSocialData,
  } = useSocialConnect('tiktok');

  // TikTok OAuth configuration
  const CLIENT_ID = "abcdefg12345";  // Replace with actual TikTok Client Key
  const REDIRECT_URI = `${window.location.origin}/social-connect`;
  const SCOPE = "user.info.basic,video.list";

  const initiateTiktokConnect = () => {
    initiateSocialConnect(CLIENT_ID, REDIRECT_URI, SCOPE);
  };

  return {
    isLoading,
    isConnecting,
    isSyncing,
    tiktokProfile: socialProfile,
    isTiktokConnected: isSocialConnected,
    initiateTiktokConnect,
    disconnectTiktok: disconnectSocial,
    syncTiktokData: syncSocialData,
  };
};
