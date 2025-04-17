
import { useSocialConnect } from './useSocialConnect';

export const useTwitchConnect = () => {
  const {
    isLoading,
    isConnecting,
    isSyncing,
    socialProfile,
    isSocialConnected,
    initiateSocialConnect,
    disconnectSocial,
    syncSocialData,
  } = useSocialConnect('twitch');

  // Twitch OAuth configuration
  const CLIENT_ID = "twitch-client-id";  // Replace with actual Twitch Client ID
  const REDIRECT_URI = `${window.location.origin}/social-connect`;
  const SCOPE = "user:read:email channel:read:subscriptions";

  const initiateTwitchConnect = () => {
    initiateSocialConnect(CLIENT_ID, REDIRECT_URI, SCOPE);
  };

  return {
    isLoading,
    isConnecting,
    isSyncing,
    twitchProfile: socialProfile,
    isTwitchConnected: isSocialConnected,
    initiateTwitchConnect,
    disconnectTwitch: disconnectSocial,
    syncTwitchData: syncSocialData,
  };
};
