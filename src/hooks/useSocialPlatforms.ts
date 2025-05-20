
import { useState, useEffect } from 'react';
import { useInstagramConnect } from './useInstagramConnect';
import { useTwitterConnect } from './useTwitterConnect';
import { useTiktokConnect } from './useTiktokConnect';
import { useYoutubeConnect } from './useYoutubeConnect';
import { useTwitchConnect } from './useTwitchConnect';

export const useSocialPlatforms = () => {
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [hasSocialAccounts, setHasSocialAccounts] = useState(false);
  
  const { isInstagramConnected } = useInstagramConnect();
  const { isTwitterConnected } = useTwitterConnect();
  const { isTiktokConnected } = useTiktokConnect();
  const { isYoutubeConnected } = useYoutubeConnect();
  const { isTwitchConnected } = useTwitchConnect();
  
  useEffect(() => {
    // Check if any platforms are connected
    const hasAnyConnections = 
      isInstagramConnected || 
      isTwitterConnected || 
      isTiktokConnected || 
      isYoutubeConnected || 
      isTwitchConnected;
    
    setHasSocialAccounts(hasAnyConnections);
    setInitialLoadComplete(true);
  }, [
    isInstagramConnected, 
    isTwitterConnected, 
    isTiktokConnected, 
    isYoutubeConnected, 
    isTwitchConnected
  ]);
  
  return {
    hasSocialAccounts,
    initialLoadComplete,
    platformConnections: {
      instagram: isInstagramConnected,
      twitter: isTwitterConnected,
      tiktok: isTiktokConnected,
      youtube: isYoutubeConnected,
      twitch: isTwitchConnected
    }
  };
};
