
import { useSocialConnect } from './useSocialConnect';

export const useTwitchConnect = () => {
  const {
    isLoading,
    isConnecting,
    isSyncing,
    profile,
    isConnected,
    initiateConnect,
    disconnect,
    syncData,
  } = useSocialConnect('twitch');

  // Twitch OAuth configuration
  const CLIENT_ID = "abcdefg12345";  // Replace with actual Twitch Client Key
  const REDIRECT_URI = `${window.location.origin}/social-connect`;
  const SCOPE = "user:read:email channel:read:subscriptions";

  const initiateTwitchConnect = () => {
    initiateConnect(CLIENT_ID, REDIRECT_URI, SCOPE);
  };

  return {
    isLoading,
    isConnecting,
    isSyncing,
    twitchProfile: profile,
    isTwitchConnected: isConnected,
    initiateTwitchConnect,
    disconnectTwitch: disconnect,
    syncTwitchData: syncData,
  };
};
