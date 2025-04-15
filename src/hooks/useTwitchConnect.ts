
import { useSocialConnect } from './useSocialConnect';

export const useTwitchConnect = () => {
  const {
    profiles,
    isLoading,
    isConnecting,
    isSyncing,
    socialProfile: twitchProfile,
    isSocialConnected: isTwitchConnected,
    initiateSocialConnect,
    disconnectSocial: disconnectTwitch,
    syncSocialData: syncTwitchData,
  } = useSocialConnect('twitch');

  const initiateTwitchConnect = async () => {
    const twitchClientId = import.meta.env.VITE_TWITCH_CLIENT_ID || 'abcdef123456';
    const redirectUri = import.meta.env.VITE_TWITCH_REDIRECT_URI || 
                       `${window.location.origin}/social-connect`;
    
    await initiateSocialConnect(
      twitchClientId,
      redirectUri,
      'user:read:email channel:read:subscriptions'
    );
  };

  return {
    profiles,
    isLoading,
    isConnecting,
    isSyncing,
    twitchProfile,
    isTwitchConnected,
    initiateTwitchConnect,
    disconnectTwitch,
    syncTwitchData,
  };
};
