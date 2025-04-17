
import { useSocialConnect } from './useSocialConnect';

export const useTiktokConnect = () => {
  const {
    profiles,
    isLoading,
    isConnecting,
    isSyncing,
    socialProfile: tiktokProfile,
    isSocialConnected: isTiktokConnected,
    initiateSocialConnect,
    disconnectSocial: disconnectTiktok,
    syncSocialData: syncTiktokData,
  } = useSocialConnect('tiktok');

  const initiateTiktokConnect = async () => {
    try {
      const tiktokClientId = import.meta.env.VITE_TIKTOK_CLIENT_ID || 'awdxrt23456';
      const redirectUri = import.meta.env.VITE_TIKTOK_REDIRECT_URI || 
                         `${window.location.origin}/social-connect`;
      
      await initiateSocialConnect(
        tiktokClientId,
        redirectUri,
        'user.info.basic,video.list'
      );
    } catch (error) {
      console.error('TikTok connection error:', error);
      throw error;
    }
  };

  return {
    profiles,
    isLoading,
    isConnecting,
    isSyncing,
    tiktokProfile,
    isTiktokConnected,
    initiateTiktokConnect,
    disconnectTiktok,
    syncTiktokData,
  };
};
