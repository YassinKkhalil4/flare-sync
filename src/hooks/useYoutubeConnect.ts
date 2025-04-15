
import { useSocialConnect } from './useSocialConnect';

export const useYoutubeConnect = () => {
  const {
    profiles,
    isLoading,
    isConnecting,
    isSyncing,
    socialProfile: youtubeProfile,
    isSocialConnected: isYoutubeConnected,
    initiateSocialConnect,
    disconnectSocial: disconnectYoutube,
    syncSocialData: syncYoutubeData,
  } = useSocialConnect('youtube');

  const initiateYoutubeConnect = async () => {
    const youtubeClientId = import.meta.env.VITE_YOUTUBE_CLIENT_ID || '123456-abcdef.apps.googleusercontent.com';
    const redirectUri = import.meta.env.VITE_YOUTUBE_REDIRECT_URI || 
                       `${window.location.origin}/social-connect`;
    
    await initiateSocialConnect(
      youtubeClientId,
      redirectUri,
      'https://www.googleapis.com/auth/youtube.readonly'
    );
  };

  return {
    profiles,
    isLoading,
    isConnecting,
    isSyncing,
    youtubeProfile,
    isYoutubeConnected,
    initiateYoutubeConnect,
    disconnectYoutube,
    syncYoutubeData,
  };
};
