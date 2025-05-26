
import React, { useState } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { Instagram, Twitter, Youtube } from 'lucide-react';
import { PlatformIcon } from './PlatformIcon';
import { PlatformTabsList } from './PlatformTabsList';
import { PlatformTabContent } from './PlatformTabContent';
import { useSocialPlatforms } from '@/hooks/useSocialPlatforms';
import { useInstagramConnect } from '@/hooks/useInstagramConnect';
import { useTwitterConnect } from '@/hooks/useTwitterConnect';
import { useTiktokConnect } from '@/hooks/useTiktokConnect';
import { useYoutubeConnect } from '@/hooks/useYoutubeConnect';
import { useTwitchConnect } from '@/hooks/useTwitchConnect';

export const SocialPlatformTabs = () => {
  const [activeTab, setActiveTab] = useState('instagram');
  const { profiles } = useSocialPlatforms();
  
  // Platform-specific hooks
  const { 
    initiateInstagramConnect, 
    disconnectInstagram,
    syncInstagramData,
    isConnecting: instagramConnecting,
    isSyncing: instagramSyncing
  } = useInstagramConnect();
  
  const { 
    initiateTwitterConnect, 
    disconnectTwitter,
    syncTwitterData,
    isConnecting: twitterConnecting,
    isSyncing: twitterSyncing
  } = useTwitterConnect();
  
  const { 
    initiateTiktokConnect, 
    disconnectTiktok,
    syncTiktokData,
    isConnecting: tiktokConnecting,
    isSyncing: tiktokSyncing
  } = useTiktokConnect();
  
  const { 
    initiateYoutubeConnect, 
    disconnectYoutube,
    syncYoutubeData,
    isConnecting: youtubeConnecting,
    isSyncing: youtubeSyncing
  } = useYoutubeConnect();
  
  const { 
    initiateTwitchConnect, 
    disconnectTwitch,
    syncTwitchData,
    isConnecting: twitchConnecting,
    isSyncing: twitchSyncing
  } = useTwitchConnect();
  
  const getProfileByPlatform = (platform: string) => {
    return profiles.find(p => p.platform === platform);
  };
  
  const platforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <Instagram className="h-5 w-5" />,
      description: 'Connect your Instagram Business or Creator account to schedule posts and view analytics.',
      connectHandler: initiateInstagramConnect,
      disconnectHandler: disconnectInstagram,
      syncHandler: syncInstagramData,
      isConnecting: instagramConnecting,
      isSyncing: instagramSyncing
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: <Twitter className="h-5 w-5" />,
      description: 'Schedule tweets and analyze your Twitter engagement metrics.',
      connectHandler: initiateTwitterConnect,
      disconnectHandler: disconnectTwitter,
      syncHandler: syncTwitterData,
      isConnecting: twitterConnecting,
      isSyncing: twitterSyncing
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: <PlatformIcon platform="tiktok" className="h-5 w-5" />,
      description: 'Connect your TikTok account to schedule videos and track performance.',
      connectHandler: initiateTiktokConnect,
      disconnectHandler: disconnectTiktok,
      syncHandler: syncTiktokData,
      isConnecting: tiktokConnecting,
      isSyncing: tiktokSyncing
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: <Youtube className="h-5 w-5" />,
      description: 'Manage your YouTube channel, schedule videos, and track performance.',
      connectHandler: initiateYoutubeConnect,
      disconnectHandler: disconnectYoutube,
      syncHandler: syncYoutubeData,
      isConnecting: youtubeConnecting,
      isSyncing: youtubeSyncing
    },
    {
      id: 'twitch',
      name: 'Twitch',
      icon: <PlatformIcon platform="twitch" className="h-5 w-5" />,
      description: 'Connect your Twitch channel to manage streams and track viewer engagement.',
      connectHandler: initiateTwitchConnect,
      disconnectHandler: disconnectTwitch,
      syncHandler: syncTwitchData,
      isConnecting: twitchConnecting,
      isSyncing: twitchSyncing
    }
  ];
  
  return (
    <Tabs defaultValue="instagram" value={activeTab} onValueChange={setActiveTab}>
      <PlatformTabsList />
      
      {platforms.map((platform) => {
        const profile = getProfileByPlatform(platform.id);
        
        return (
          <PlatformTabContent
            key={platform.id}
            platform={platform}
            profile={profile}
            connected={profile?.connected || false}
            isConnecting={platform.isConnecting}
            isSyncing={platform.isSyncing}
            onConnect={platform.connectHandler}
            onDisconnect={platform.disconnectHandler}
            onSync={platform.syncHandler}
          />
        );
      })}
    </Tabs>
  );
};
