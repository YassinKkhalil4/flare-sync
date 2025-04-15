
import { useSocialConnect } from './useSocialConnect';

export const useInstagramConnect = () => {
  const {
    profiles,
    isLoading,
    isConnecting,
    isSyncing,
    socialProfile: instagramProfile,
    isSocialConnected: isInstagramConnected,
    initiateSocialConnect,
    disconnectSocial: disconnectInstagram,
    syncSocialData: syncInstagramData,
  } = useSocialConnect('instagram');

  const initiateInstagramConnect = async () => {
    const instagramClientId = import.meta.env.VITE_INSTAGRAM_CLIENT_ID || '123456789';
    const redirectUri = import.meta.env.VITE_INSTAGRAM_REDIRECT_URI || 
                       `${window.location.origin}/social-connect`;
    
    await initiateSocialConnect(
      instagramClientId,
      redirectUri,
      'user_profile,user_media'
    );
  };

  return {
    profiles,
    isLoading,
    isConnecting,
    isSyncing,
    instagramProfile,
    isInstagramConnected,
    initiateInstagramConnect,
    disconnectInstagram,
    syncInstagramData,
  };
};
