
import { useSocialConnect } from './useSocialConnect';
import { toast } from './use-toast';
import { useCallback } from 'react';

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

  const initiateTiktokConnect = useCallback(async () => {
    try {
      const tiktokClientId = import.meta.env.VITE_TIKTOK_CLIENT_ID || 'awdxrt23456';
      const redirectUri = import.meta.env.VITE_TIKTOK_REDIRECT_URI || 
                         `${window.location.origin}/social-connect`;
      
      // Include video.list scope for content management
      await initiateSocialConnect(
        tiktokClientId,
        redirectUri,
        'user.info.basic,video.list,video.upload,video.publish'
      );
    } catch (error) {
      console.error('TikTok connection error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to TikTok. Please try again.',
        variant: 'destructive',
      });
    }
  }, [initiateSocialConnect]);

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
